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

import { requireArg } from "./utils";

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

function buildVerificationUriComplete(verificationUri: string, userCode: string): string {
  const u = new URL(verificationUri);
  u.searchParams.set("code", userCode);
  return u.toString();
}

/** Ensure we only open URLs from the configured auth server origin and avoid HTTP downgrade outside localhost. */
function assertVerificationUriSafe(authServerBase: string, verificationUri: string): void {
  let baseUrl: URL;
  let verifyUrl: URL;
  try {
    baseUrl = new URL(authServerBase.includes("://") ? authServerBase : `https://${authServerBase}`);
    verifyUrl = new URL(verificationUri);
  } catch {
    throw new Error("Invalid auth server base URL or verification_uri from server");
  }

  if (verifyUrl.origin !== baseUrl.origin) {
    throw new Error(
      `Auth server returned verification_uri on ${verifyUrl.origin}, expected ${baseUrl.origin}; refusing to continue (misconfiguration or unexpected redirect).`
    );
  }

  const host = verifyUrl.hostname;
  const isLocal =
    host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";
  if (verifyUrl.protocol !== "https:" && !isLocal) {
    throw new Error("verification_uri must use https unless the host is localhost or 127.0.0.1");
  }
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
          }),
      async (args: any) => {
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

          await writeCredentialsFile({ apiKey: token.access_token });
          printJson({ success: true, stored: true, organization_id: token.organization_id, api_url: token.api_url });
          return;
        }

        const deadlineMs = Date.now() + code.expires_in * 1000;
        const token = await pollDeviceToken(base, code.device_code, code, deadlineMs);

        if (token?.access_token) {
          await writeCredentialsFile({ apiKey: token.access_token });
          printJson({ success: true, stored: true, organization_id: token.organization_id, api_url: token.api_url });
        }
      }
    )
    .command("auth:logout", "Remove stored credentials", () => {}, async () => {
      await deleteCredentialsFile();
      printJson({ success: true });
    })
    .command("auth:status", "Check auth status by calling /public/is-connected", () => {}, async () => {
      const api = await ctx.buildApi();
      const out = await api.isConnected();
      printJson(out);
    });
};
