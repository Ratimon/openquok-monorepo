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
  writeCredentialsFile
} from "../config";
import { requestJson } from "../http";
import { printJson } from "../output";

import { requireArg, runCommand } from "./utils";

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

async function pollDeviceToken(
  base: string,
  deviceCode: string,
  code: DeviceCodeResponse,
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

    await sleep(Math.max(1000, Number(code.interval) * 1000));
  }

  throw new Error("OAuth2 login timed out");
}

export const registerAuthCommands: RegisterCommands = (y: Argv, ctx: CommandContext) => {
  return y
    .command(
      "auth:login",
      "OAuth2 device flow login (or store an API key)",
      (yy: Argv) =>
        yy
          .option("apiKey", {
            type: "string",
            describe: "Store an API key directly (skips OAuth2 device flow)",
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
          .example("$0 auth:login", "Interactive OAuth2 device flow (opens a browser)")
          .example(
            "$0 auth:login --json",
            "Device flow with machine-readable JSON on stdout (for CI/automation)"
          )
          .example(
            '$0 auth:login --apiKey "opo_..."',
            "Skip OAuth and store a programmatic API key directly"
          )
          .example(
            "$0 auth:login --authServer http://localhost:3111",
            "Point at a local agent/server during development"
          ),
      async (args: any) => {
        await runCommand("auth:login", async () => {
          // Option 2: API key
          if (typeof args.apiKey === "string" && args.apiKey.trim()) {
            await writeCredentialsFile({ apiKey: requireArg("apiKey", args.apiKey) });
            printJson({ success: true });
            return;
          }

          // Option 1: OAuth2 device flow
          const cfg = getConfig();
          const authServer =
            typeof args.authServer === "string" && args.authServer.trim() ? args.authServer.trim() : cfg.authServerUrl;
          const base = authServer.replace(/\/+$/, "");

          const code = await requestJson<DeviceCodeResponse>({ url: `${base}/device/code`, method: "POST" });

          assertVerificationUriSafe(base, code.verification_uri);
          const verificationUriComplete = buildVerificationUriComplete(code.verification_uri, code.user_code);

          const jsonMode = Boolean(args.json);
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
            });
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

            const deadlineMs = Date.now() + code.expires_in * 1000;
            const token = await pollDeviceToken(base, code.device_code, code, deadlineMs);

            await writeCredentialsFile({
              apiKey: token.access_token,
              ...(token.api_url ? { apiUrl: token.api_url } : {}),
            });
            printJson({ success: true, stored: true, organization_id: token.organization_id, api_url: token.api_url });
            return;
          }

          const deadlineMs = Date.now() + code.expires_in * 1000;
          const token = await pollDeviceToken(base, code.device_code, code, deadlineMs);

          if (token?.access_token) {
            await writeCredentialsFile({
              apiKey: token.access_token,
              ...(token.api_url ? { apiUrl: token.api_url } : {}),
            });
            printJson({ success: true, stored: true, organization_id: token.organization_id, api_url: token.api_url });
          }
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
