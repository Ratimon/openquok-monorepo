import type { Argv } from "yargs";

import { printJson } from "../output";

import type { CommandContext, RegisterCommands } from "./types";
import { parseJsonMaybe, requireArg, toArrayFromCsv } from "./utils";

export const registerPostCommands: RegisterCommands = (y: Argv, ctx: CommandContext) => {
  return y
    .command(
      "posts:list",
      "List posts in a date range (required: start, end)",
      (yy: Argv) =>
        yy
          .option("start", { type: "string", demandOption: true, describe: "Start ISO timestamp" })
          .option("end", { type: "string", demandOption: true, describe: "End ISO timestamp" })
          .option("integrationIds", {
            type: "string",
            describe: "Optional comma-separated integration UUIDs to filter by",
          }),
      async (args: any) => {
        const api = await ctx.buildApi();
        const out = await api.listPosts({
          start: requireArg("start", args.start),
          end: requireArg("end", args.end),
          integrationIds: typeof args.integrationIds === "string" ? args.integrationIds : undefined,
        });
        printJson(out);
      }
    )
    .command(
      "posts:create",
      "Create a scheduled/draft post group",
      (yy: Argv) =>
        yy
          .option("scheduledAt", { type: "string", demandOption: true, describe: "ISO timestamp" })
          .option("status", { type: "string", choices: ["draft", "scheduled"] as const, default: "scheduled" })
          .option("body", { type: "string", describe: "Default body (used unless bodiesByIntegrationId is provided)" })
          .option("integrationIds", {
            type: "string",
            describe: "Comma-separated integration UUIDs",
          })
          .option("media", {
            type: "string",
            describe:
              'JSON array of media items: [{"id":"...","path":"...","bucket":"...optional"}]. Use `openquok upload` to get filePath/id.',
          })
          .option("bodiesByIntegrationId", {
            type: "string",
            describe: 'JSON object: {"<integrationUuid>":"body override"}',
          })
          .option("providerSettingsByIntegrationId", {
            type: "string",
            describe: 'JSON object: {"<integrationUuid>":{...provider settings...}}',
          })
          .option("tagNames", { type: "string", describe: "Comma-separated tags" })
          .option("repeatInterval", { type: "string", describe: "Repeat interval (backend enum)" }),
      async (args: any) => {
        const api = await ctx.buildApi();

        const media = parseJsonMaybe(args.media, "media");
        const bodiesByIntegrationId = parseJsonMaybe(args.bodiesByIntegrationId, "bodiesByIntegrationId");
        const providerSettingsByIntegrationId = parseJsonMaybe(
          args.providerSettingsByIntegrationId,
          "providerSettingsByIntegrationId"
        );

        const payload = {
          scheduledAt: requireArg("scheduledAt", args.scheduledAt),
          status: args.status,
          ...(typeof args.body === "string" && args.body.trim() ? { body: args.body } : {}),
          ...(toArrayFromCsv(args.integrationIds) ? { integrationIds: toArrayFromCsv(args.integrationIds) } : {}),
          ...(Array.isArray(media) ? { media } : {}),
          ...(bodiesByIntegrationId && typeof bodiesByIntegrationId === "object" ? { bodiesByIntegrationId } : {}),
          ...(providerSettingsByIntegrationId && typeof providerSettingsByIntegrationId === "object"
            ? { providerSettingsByIntegrationId }
            : {}),
          ...(toArrayFromCsv(args.tagNames) ? { tagNames: toArrayFromCsv(args.tagNames) } : {}),
          ...(typeof args.repeatInterval === "string" && args.repeatInterval.trim()
            ? { repeatInterval: args.repeatInterval.trim() }
            : {}),
        };

        const out = await api.createPost(payload);
        printJson(out);
      }
    )
    .command(
      "posts:group <postGroup>",
      "Get a post group (UUID)",
      (yy: Argv) => yy.positional("postGroup", { type: "string", demandOption: true }),
      async (args: any) => {
        const api = await ctx.buildApi();
        const out = await api.getPostGroup(requireArg("postGroup", args.postGroup));
        printJson(out);
      }
    )
    .command(
      "posts:update-group <postGroup>",
      "Update a post group (same payload shape as create, except organizationId is never allowed)",
      (yy: Argv) =>
        yy
          .positional("postGroup", { type: "string", demandOption: true })
          .option("json", { type: "string", demandOption: true, describe: "Full JSON payload string" }),
      async (args: any) => {
        const api = await ctx.buildApi();
        const payload = parseJsonMaybe(args.json, "json");
        if (!payload || typeof payload !== "object") throw new Error("json must be an object");
        const out = await api.updatePostGroup(requireArg("postGroup", args.postGroup), payload);
        printJson(out);
      }
    )
    .command(
      "posts:delete-group <postGroup>",
      "Delete a post group (UUID)",
      (yy: Argv) => yy.positional("postGroup", { type: "string", demandOption: true }),
      async (args: any) => {
        const api = await ctx.buildApi();
        const out = await api.deletePostGroup(requireArg("postGroup", args.postGroup));
        printJson(out);
      }
    );
};

