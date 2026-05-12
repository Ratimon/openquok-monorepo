import type { Argv } from "yargs";

import { printJson } from "../output";

import type { CommandContext, RegisterCommands } from "./types";
import { requireArg, runCommand } from "./utils";

/**
 * Backend rejects anything outside `7 | 30 | 90`; narrow the CLI input here so
 * users get a clear local error instead of a generic server-side validation message.
 */
function parseDateWindow(input: unknown): 7 | 30 | 90 {
  const raw = typeof input === "number" ? input : Number(input);
  if (raw === 7 || raw === 30 || raw === 90) return raw;
  throw new Error('days must be one of 7, 30, or 90');
}

export const registerAnalyticsCommands: RegisterCommands = (y: Argv, ctx: CommandContext) => {
  return y
    .command(
      "analytics:platform <id>",
      "Get platform analytics for a connected channel (followers, impressions, engagement, …)",
      (yy: Argv) =>
        yy
          .positional("id", {
            type: "string",
            demandOption: true,
            describe: "Integration channel UUID (from `openquok integrations:list`)",
          })
          .option("days", {
            alias: "d",
            type: "number",
            default: 7,
            choices: [7, 30, 90] as const,
            describe: "Look-back window in days",
          })
          .example(
            "$0 analytics:platform 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b",
            "Last 7 days for one channel (default window)"
          )
          .example(
            "$0 analytics:platform 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b -d 30",
            "Last 30 days"
          )
          .example(
            '$0 analytics:platform 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b -d 90 | jq \'.[] | {label, percentageChange}\'',
            "Pipe into jq to compare percentage change across metrics"
          ),
      async (args: any) => {
        await runCommand("analytics:platform", async () => {
          const api = await ctx.buildApi();
          const out = await api.getIntegrationAnalytics(
            requireArg("id", args.id),
            parseDateWindow(args.days)
          );
          printJson(out);
        });
      }
    )
    .command(
      "analytics:post <id>",
      "Get per-post analytics for a published post (likes, comments, shares, …)",
      (yy: Argv) =>
        yy
          .positional("id", {
            type: "string",
            demandOption: true,
            describe: "Post UUID (from `openquok posts:list`)",
          })
          .option("days", {
            alias: "d",
            type: "number",
            default: 7,
            choices: [7, 30, 90] as const,
            describe: "Look-back window in days",
          })
          .example(
            "$0 analytics:post 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d",
            "Last 7 days for one published post"
          )
          .example(
            "$0 analytics:post 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d -d 30",
            "Last 30 days"
          )
          .example(
            "$0 analytics:post 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d -d 30 | jq '.[] | {label, latest: .data[-1].total}'",
            "Get the latest total for each metric"
          ),
      async (args: any) => {
        await runCommand("analytics:post", async () => {
          const api = await ctx.buildApi();
          const out = await api.getPostAnalytics(
            requireArg("id", args.id),
            parseDateWindow(args.days)
          );
          printJson(out);
        });
      }
    );
};
