import type { Argv } from "yargs";

import { printJson } from "../output";

import type { CommandContext, RegisterCommands } from "./types";
import { requireArg } from "./utils";

export const registerUploadCommands: RegisterCommands = (y: Argv, ctx: CommandContext) => {
  return y.command(
    "upload <filePath>",
    "Upload a media file (multipart) via /public/upload",
    (yy: Argv) => yy.positional("filePath", { type: "string", demandOption: true }),
    async (args: any) => {
      const api = await ctx.buildApi();
      const out = await api.uploadFile(requireArg("filePath", args.filePath));
      printJson(out);
    }
  );
};

