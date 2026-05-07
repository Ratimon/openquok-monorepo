import type { Argv } from "yargs";

import type { OpenquokApi } from "../api";

export type CommandContext = {
  buildApi: () => Promise<OpenquokApi>;
};

export type RegisterCommands = (y: Argv, ctx: CommandContext) => Argv;

