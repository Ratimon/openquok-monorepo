import type { Argv } from "yargs";

import { printJson } from "../output";

import type { CommandContext, RegisterCommands } from "./types";
import { runCommand } from "./utils";

export const registerNotificationCommands: RegisterCommands = (y: Argv, ctx: CommandContext) => {
  return y.command(
    "notifications:list",
    "List in-app notifications for the workspace (paginated, 100 per page)",
    (yy: Argv) =>
      yy
        .option("page", {
          type: "number",
          default: 0,
          describe: "Zero-based page index (default 0 — first 100 entries)",
        })
        .example("$0 notifications:list", "First page (most recent 100 notifications)")
        .example("$0 notifications:list --page 1", "Next page")
        .example(
          "$0 notifications:list | jq '.notifications[] | {created_at, content}'",
          "Pipe through jq for a flat timeline"
        ),
    async (args: any) => {
      await runCommand("notifications:list", async () => {
        const api = await ctx.buildApi();
        const page = typeof args.page === "number" && Number.isFinite(args.page) ? args.page : 0;
        const out = await api.listNotifications(page);
        printJson(out);
      });
    }
  );
};
