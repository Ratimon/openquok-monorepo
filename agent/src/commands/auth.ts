import type { Argv } from "yargs";
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

        const code = await requestJson<{
          device_code: string;
          user_code: string;
          verification_uri: string;
          expires_in: number;
          interval: number;
        }>({ url: `${base}/device/code`, method: "POST" });

        const verificationUriComplete = `${code.verification_uri}?code=${encodeURIComponent(code.user_code)}`;

        // Print instructions as JSON (CLI output contract).
        printJson({
          success: true,
          device_code: code.device_code,
          user_code: code.user_code,
          verification_uri: code.verification_uri,
          verification_uri_complete: verificationUriComplete,
          expires_in: code.expires_in,
          interval: code.interval,
        });

        const deadlineMs = Date.now() + code.expires_in * 1000;
        while (Date.now() < deadlineMs) {
          try {
            const token = await requestJson<{
              access_token: string;
              api_url?: string;
              organization_id?: string;
            }>({
              url: `${base}/device/token`,
              method: "POST",
              body: { device_code: code.device_code },
            });

            if (token?.access_token) {
              await writeCredentialsFile({ apiKey: token.access_token });
              printJson({ success: true, stored: true, organization_id: token.organization_id, api_url: token.api_url });
              return;
            }
          } catch (err: any) {
            const e = err?.body?.error;
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

