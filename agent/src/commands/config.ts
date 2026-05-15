import type { Argv } from "yargs";

import {
  credentialsPath,
  readCredentialsFile,
  readOpenquokApiUrlEnv,
  readOpenquokAuthServerEnv,
  resolveOpenquokConfig,
} from "../config";
import { printJson } from "../output";

import {
  classifyOpenquokDeployment,
  resolveApiUrlSource,
  resolveAuthServerSource,
} from "./config.logic";
import type { CommandContext, RegisterCommands } from "./types";
import { runCommand } from "./utils";

export const registerConfigCommands: RegisterCommands = (y: Argv, _ctx: CommandContext) => {
  return y.command(
    "config:show",
    "Show resolved API and auth server URLs (hosted Openquok vs custom/self-hosted)",
    (yy: Argv) =>
      yy.example("$0 config:show", "Print deployment kind and endpoints the CLI will use"),
    async () => {
      await runCommand("config:show", async () => {
        const [resolved, creds] = await Promise.all([resolveOpenquokConfig(), readCredentialsFile()]);
        const envApi = readOpenquokApiUrlEnv();
        const envAuth = readOpenquokAuthServerEnv();
        const deployment = classifyOpenquokDeployment(resolved.apiUrl, resolved.authServerUrl);
        const credPath = credentialsPath();

        printJson({
          success: true,
          deployment,
          api_url: resolved.apiUrl,
          auth_server_url: resolved.authServerUrl,
          api_url_source: resolveApiUrlSource(envApi, creds?.apiUrl),
          auth_server_url_source: resolveAuthServerSource(envAuth),
          credentials_file: credPath,
          has_stored_credentials: Boolean(creds?.apiKey),
        });
      });
    }
  );
};
