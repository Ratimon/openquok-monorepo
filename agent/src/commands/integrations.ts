import type { Argv } from "yargs";

import { printJson } from "../output";

import type { CommandContext, RegisterCommands } from "./types";
import { requireArg } from "./utils";

export const registerIntegrationCommands: RegisterCommands = (y: Argv, ctx: CommandContext) => {
  return y
    .command("integrations:list", "List connected integrations (programmatic)", () => {}, async () => {
      const api = await ctx.buildApi();
      const out = await api.listIntegrations();
      printJson(out);
    })
    .command(
      "integrations:oauth-url <integration>",
      "Get an OAuth URL for a specific integration identifier",
      (yy: Argv) => yy.positional("integration", { type: "string", demandOption: true }),
      async (args: any) => {
        const api = await ctx.buildApi();
        const out = await api.getIntegrationOAuthUrl(requireArg("integration", args.integration));
        printJson(out);
      }
    )
    .command(
      "integrations:delete <id>",
      "Delete a connected integration channel by id",
      (yy: Argv) => yy.positional("id", { type: "string", demandOption: true }),
      async (args: any) => {
        const api = await ctx.buildApi();
        const out = await api.deleteIntegration(requireArg("id", args.id));
        printJson(out);
      }
    );
};

