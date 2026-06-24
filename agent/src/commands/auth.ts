import readline from "node:readline";
import { stdin as stdinStream, stderr as stderrStream } from "node:process";
import type { Argv } from "yargs";
import open from "open";
import type { CommandContext, RegisterCommands } from "./types";

import {
  deleteCredentialsFile,
  // Default Configuration Values
  getConfig,
  OPENQUOK_DEFAULT_AUTH_SERVER,
  writeCredentialsFile,
} from "../config";
import { requestJson } from "../http";
import { printJson } from "../output";

import { requireArg, runCommand } from "./utils";

/** Defaults aligned with agent/server device flow. */
const DEFAULT_DEVICE_EXPIRES_IN_S = 30 * 60;
const DEFAULT_DEVICE_POLL_INTERVAL_S = 5;

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

function buildVerificationUriComplete(verificationUri: string, userCode: string): string {
  const u = new URL(verificationUri);
  u.searchParams.set("code", userCode);
  return u.toString();
}

function isLocalHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]";
}

function isTrustedOpenquokBrowserOrigin(verifyUrl: URL): boolean {
  const host = verifyUrl.hostname;
  const onOpenquok =
    host === "openquok.com" || host.endsWith(".openquok.com") || isLocalHostname(host);
  if (!onOpenquok) return false;
  return verifyUrl.pathname === "/cli/device/verify" || verifyUrl.pathname === "/device/verify";
}

/** Ensure verification_uri is from the auth server or a trusted Openquok browser origin; block HTTP downgrade outside localhost. */
function assertVerificationUriSafe(authServerBase: string, verificationUri: string): void {
  let baseUrl: URL;
  let verifyUrl: URL;
  try {
    baseUrl = new URL(authServerBase.includes("://") ? authServerBase : `https://${authServerBase}`);
    verifyUrl = new URL(verificationUri);
  } catch {
    throw new Error("Invalid auth server base URL or verification_uri from server");
  }

  const host = verifyUrl.hostname;
  const isLocal = isLocalHostname(host);
  if (verifyUrl.protocol !== "https:" && !isLocal) {
    throw new Error("verification_uri must use https unless the host is localhost or 127.0.0.1");
  }

  if (verifyUrl.origin === baseUrl.origin) return;

  if (isTrustedOpenquokBrowserOrigin(verifyUrl)) return;

  throw new Error(
    `Auth server returned verification_uri on ${verifyUrl.origin}, expected ${baseUrl.origin} or a trusted Openquok browser origin; refusing to continue (misconfiguration or unexpected redirect).`
  );
}

async function waitForEnter(prompt: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const rl = readline.createInterface({ input: stdinStream, output: stderrStream, terminal: true });
    const onErr = (err: Error) => {
      rl.close();
      reject(err);
    };
    stdinStream.once("error", onErr);
    rl.question(prompt, () => {
      stdinStream.off("error", onErr);
      rl.close();
      resolve();
    });
  });
}

type DeviceCodeResponse = {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
};

type DevicePollOptions = {
  expiresIn: number;
  interval: number;
};

function resolveAuthServerBase(authServerArg: unknown): string {
  const cfg = getConfig();
  const authServer =
    typeof authServerArg === "string" && authServerArg.trim() ? authServerArg.trim() : cfg.authServerUrl;
  return authServer.replace(/\/+$/, "");
}

async function requestDeviceCode(base: string): Promise<DeviceCodeResponse> {
  const code = await requestJson<DeviceCodeResponse>({ url: `${base}/device/code`, method: "POST" });
  assertVerificationUriSafe(base, code.verification_uri);
  return code;
}

async function pollDeviceToken(
  base: string,
  deviceCode: string,
  poll: DevicePollOptions,
  deadlineMs: number
): Promise<{ access_token: string; api_url?: string; organization_id?: string }> {
  while (Date.now() < deadlineMs) {
    try {
      const token = await requestJson<{
        access_token: string;
        api_url?: string;
        organization_id?: string;
      }>({
        url: `${base}/device/token`,
        method: "POST",
        body: { device_code: deviceCode },
      });

      if (token?.access_token) {
        return token;
      }
    } catch (err: unknown) {
      const e = (err as { body?: { error?: string } })?.body?.error;
      if (e === "authorization_pending") {
        // keep polling
      } else if (e === "expired_token" || e === "invalid_device_code") {
        throw new Error(`OAuth2 login failed: ${String(e)}`);
      } else {
        throw err;
      }
    }

    await sleep(Math.max(1000, Number(poll.interval) * 1000));
  }

  throw new Error("OAuth2 login timed out");
}

async function pollAndStoreDeviceCredentials(
  base: string,
  deviceCode: string,
  poll: DevicePollOptions
): Promise<{ organization_id?: string; api_url?: string }> {
  const deadlineMs = Date.now() + poll.expiresIn * 1000;
  const token = await pollDeviceToken(base, deviceCode, poll, deadlineMs);

  await writeCredentialsFile({
    apiKey: token.access_token,
    ...(token.api_url ? { apiUrl: token.api_url } : {}),
  });

  return { organization_id: token.organization_id, api_url: token.api_url };
}

export const registerAuthCommands: RegisterCommands = (y: Argv, ctx: CommandContext) => {
  return y
    .command(
      "auth:login",
      "OAuth2 device flow login (or store a programmatic access token)",
      (yy: Argv) =>
        yy
          .option("apiKey", {
            type: "string",
            describe: "Store an opo_ programmatic token directly (skips OAuth2 device flow)",
          })
          .option("authServer", {
            type: "string",
            describe: `Auth server base URL (defaults to OPENQUOK_AUTH_SERVER or ${OPENQUOK_DEFAULT_AUTH_SERVER})`,
          })
          .option("json", {
            type: "boolean",
            default: false,
            describe:
              "Emit machine-readable JSON for device flow (initial payload + result). Use in scripts; default is interactive (instructions on stderr).",
          })
          .option("no-poll", {
            type: "boolean",
            default: false,
            describe:
              "With --json: emit the device payload and exit (no polling). Complete login with auth:login:poll — required for messaging agents that stop the shell after the first JSON line.",
          })
          .example("$0 auth:login", "Interactive OAuth2 device flow (opens a browser)")
          .example(
            "$0 auth:login --json",
            "Device flow with machine-readable JSON on stdout (for CI/automation)"
          )
          .example(
            "$0 auth:login --json --no-poll",
            "Start device flow for agents (Telegram/Hermes): print link, then run auth:login:poll after the user authorizes"
          )
          .example(
            '$0 auth:login --apiKey "opo_..."',
            "Skip OAuth and store an opo_ programmatic access token directly"
          )
          .example(
            "$0 auth:login --authServer http://localhost:3111",
            "Point at a local agent/server during development"
          ),
      async (args: any) => {
        await runCommand("auth:login", async () => {
          // Option 2: programmatic access token
          if (typeof args.apiKey === "string" && args.apiKey.trim()) {
            await writeCredentialsFile({ apiKey: requireArg("apiKey", args.apiKey) });
            printJson({ success: true });
            return;
          }

          // Option 1: OAuth2 device flow
          const base = resolveAuthServerBase(args.authServer);
          const code = await requestDeviceCode(base);
          const verificationUriComplete = buildVerificationUriComplete(code.verification_uri, code.user_code);

          const jsonMode = Boolean(args.json);
          const noPoll = Boolean(args.noPoll);
          const interactive = !jsonMode && stdinStream.isTTY;

          if (jsonMode) {
            printJson({
              success: true,
              device_code: code.device_code,
              user_code: code.user_code,
              verification_uri: code.verification_uri,
              verification_uri_complete: verificationUriComplete,
              expires_in: code.expires_in,
              interval: code.interval,
              ...(noPoll
                ? {
                    poll_pending: true,
                    poll_command: `openquok auth:login:poll --device-code ${code.device_code}`,
                  }
                : {}),
            });

            if (noPoll) {
              return;
            }
          } else {
            stderrStream.write(
              `Visit ${code.verification_uri} and enter code ${code.user_code}\n` +
                `(or use the link after you press Enter — the code will be filled in automatically)\n`
            );

            const tryOpenBrowser = async (): Promise<void> => {
              try {
                await open(verificationUriComplete, { wait: false });
              } catch {
                stderrStream.write(`Could not open browser. Open manually:\n${verificationUriComplete}\n`);
              }
            };

            if (interactive) {
              await waitForEnter("\nPress [ENTER] to open the browser ");
              await tryOpenBrowser();
            } else {
              await tryOpenBrowser();
            }

            stderrStream.write("\nWaiting for authentication…\n");

            const stored = await pollAndStoreDeviceCredentials(base, code.device_code, {
              expiresIn: code.expires_in,
              interval: code.interval,
            });
            printJson({ success: true, stored: true, organization_id: stored.organization_id, api_url: stored.api_url });
            return;
          }

          const stored = await pollAndStoreDeviceCredentials(base, code.device_code, {
            expiresIn: code.expires_in,
            interval: code.interval,
          });
          printJson({ success: true, stored: true, organization_id: stored.organization_id, api_url: stored.api_url });
        });
      }
    )
    .command(
      "auth:login:poll",
      "Poll device OAuth and store credentials after auth:login --json --no-poll",
      (yy: Argv) =>
        yy
          .option("device-code", {
            type: "string",
            demandOption: true,
            describe: "device_code from auth:login --json --no-poll stdout",
          })
          .option("authServer", {
            type: "string",
            describe: `Auth server base URL (defaults to OPENQUOK_AUTH_SERVER or ${OPENQUOK_DEFAULT_AUTH_SERVER})`,
          })
          .option("expires-in", {
            type: "number",
            describe: `Seconds until the device code expires (default ${DEFAULT_DEVICE_EXPIRES_IN_S}, match auth:login output when possible)`,
          })
          .option("interval", {
            type: "number",
            describe: `Poll interval in seconds (default ${DEFAULT_DEVICE_POLL_INTERVAL_S}, match auth:login output when possible)`,
          })
          .example(
            "$0 auth:login:poll --device-code abc123…",
            "After the user opens verification_uri_complete, poll until credentials are stored"
          ),
      async (args: any) => {
        await runCommand("auth:login:poll", async () => {
          const base = resolveAuthServerBase(args.authServer);
          const deviceCode = requireArg("device-code", args.deviceCode);
          const expiresIn =
            typeof args.expiresIn === "number" && args.expiresIn > 0
              ? args.expiresIn
              : DEFAULT_DEVICE_EXPIRES_IN_S;
          const interval =
            typeof args.interval === "number" && args.interval > 0
              ? args.interval
              : DEFAULT_DEVICE_POLL_INTERVAL_S;

          const stored = await pollAndStoreDeviceCredentials(base, deviceCode, { expiresIn, interval });
          printJson({ success: true, stored: true, organization_id: stored.organization_id, api_url: stored.api_url });
        });
      }
    )
    .command(
      "auth:logout",
      "Remove stored credentials",
      (yy: Argv) => yy.example("$0 auth:logout", "Delete the credentials file at ~/.openquok/credentials.json"),
      async () => {
        await runCommand("auth:logout", async () => {
          await deleteCredentialsFile();
          printJson({ success: true });
        });
      }
    )
    .command(
      "auth:status",
      "Check auth status by calling /public/is-connected",
      (yy: Argv) =>
        yy.example(
          "$0 auth:status",
          "Verify the stored token (or OPENQUOK_API_KEY) is accepted by the API"
        ),
      async () => {
        await runCommand("auth:status", async () => {
          const api = await ctx.buildApi();
          const out = await api.isConnected();
          printJson(out);
        });
      }
    )
    .command(
      "auth:workspace",
      "Show the workspace bound to the current API credentials",
      (yy: Argv) =>
        yy.example(
          "$0 auth:workspace",
          "Print workspace id and name for the authenticated organization"
        ),
      async () => {
        await runCommand("auth:workspace", async () => {
          const api = await ctx.buildApi();
          const out = await api.getWorkspace();
          printJson(out);
        });
      }
    );
};
