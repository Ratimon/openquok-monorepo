import type { Argv } from "yargs";

import { printJson } from "../output";

import type { CommandContext, RegisterCommands } from "./types";

export const registerIntegrationCommands: RegisterCommands = (y: Argv, ctx: CommandContext) => {
  return y.command("integrations:list", "List connected integrations (programmatic)", () => {}, async () => {
    const api = await ctx.buildApi();
    const out = await api.listIntegrations();
    printJson(out);
  });
};

