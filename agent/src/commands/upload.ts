import type { Argv } from "yargs";

import { printJson } from "../output";

import type { CommandContext, RegisterCommands } from "./types";
import { requireArg, runCommand } from "./utils";

export const registerUploadCommands: RegisterCommands = (y: Argv, ctx: CommandContext) => {
  return y.command(
    "upload <filePath>",
    "Upload a media file (multipart) via /public/upload",
    (yy: Argv) =>
      yy
        .positional("filePath", {
          type: "string",
          demandOption: true,
          describe: "Local path to the media file (image, video, etc.) to upload",
        })
        .example(
          "$0 upload ./image.png",
          "Upload a local image; response includes `data.id` and `data.path` for use with `posts:create --media`"
        )
        .example("$0 upload /tmp/clip.mp4", "Upload a video by absolute path"),
    async (args: any) => {
      await runCommand("upload", async () => {
        const api = await ctx.buildApi();
        const out = await api.uploadFile(requireArg("filePath", args.filePath));
        printJson(out);
      });
    }
  );
};

