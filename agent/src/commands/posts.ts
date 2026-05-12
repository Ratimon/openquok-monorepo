import type { Argv } from "yargs";

import { printJson } from "../output";

import type { CommandContext, RegisterCommands } from "./types";
import { parseJsonMaybe, requireArg, runCommand, toArrayFromCsv } from "./utils";

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
          })
          .example(
            '$0 posts:list --start "2026-01-01T00:00:00Z" --end "2026-02-01T00:00:00Z"',
            "List posts scheduled in January 2026 across all connected channels"
          )
          .example(
            '$0 posts:list --start "2026-01-01T00:00:00Z" --end "2026-02-01T00:00:00Z" --integrationIds "4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b,9c0d1e2f-3a4b-5c6d-7e8f-901a2b3c4d5e"',
            "Filter to a subset of channels (CSV of integration UUIDs)"
          ),
      async (args: any) => {
        await runCommand("posts:list", async () => {
          const api = await ctx.buildApi();
          const out = await api.listPosts({
            start: requireArg("start", args.start),
            end: requireArg("end", args.end),
            integrationIds: typeof args.integrationIds === "string" ? args.integrationIds : undefined,
          });
          printJson(out);
        });
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
          .option("repeatInterval", { type: "string", describe: "Repeat interval (backend enum)" })
          .example(
            '$0 posts:create --scheduledAt "2026-01-01T12:00:00Z" --body "Hello from Openquok" --integrationIds "4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b"',
            "Simplest case: same body to one channel at a specific time"
          )
          .example(
            '$0 posts:create --scheduledAt "2026-01-01T12:00:00Z" --status draft --body "Draft me" --integrationIds "4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b"',
            "Save as a draft instead of scheduling"
          )
          .example(
            '$0 posts:create --scheduledAt "2026-01-01T12:00:00Z" --integrationIds "uuid-a,uuid-b" --bodiesByIntegrationId \'{"uuid-a":"Caption for A","uuid-b":"Caption for B"}\'',
            "Different body per channel (keys are integration UUIDs)"
          )
          .example(
            '$0 posts:create --scheduledAt "2026-01-01T12:00:00Z" --body "With media" --integrationIds "uuid-a" --media \'[{"id":"media-uuid","path":"uploads/2026/01/img.png"}]\'',
            "Attach media (use `openquok upload` first to get `id` + `path`)"
          ),
      async (args: any) => {
        await runCommand("posts:create", async () => {
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
        });
      }
    )
    .command(
      "posts:group <postGroup>",
      "Get a post group (UUID)",
      (yy: Argv) =>
        yy
          .positional("postGroup", {
            type: "string",
            demandOption: true,
            describe: "Post group UUID (returned by `posts:create` and visible in `posts:list`)",
          })
          .example(
            "$0 posts:group 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d",
            "Fetch a single post group by UUID"
          ),
      async (args: any) => {
        await runCommand("posts:group", async () => {
          const api = await ctx.buildApi();
          const out = await api.getPostGroup(requireArg("postGroup", args.postGroup));
          printJson(out);
        });
      }
    )
    .command(
      "posts:update-group <postGroup>",
      "Update a post group (same payload shape as create, except organizationId is never allowed)",
      (yy: Argv) =>
        yy
          .positional("postGroup", {
            type: "string",
            demandOption: true,
            describe: "Post group UUID to update",
          })
          .option("json", { type: "string", demandOption: true, describe: "Full JSON payload string" })
          .example(
            '$0 posts:update-group 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d --json \'{"status":"draft"}\'',
            "Move a scheduled group back to draft"
          )
          .example(
            '$0 posts:update-group 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d --json \'{"scheduledAt":"2026-02-15T09:00:00Z","status":"scheduled"}\'',
            "Reschedule a group to a new time"
          ),
      async (args: any) => {
        await runCommand("posts:update-group", async () => {
          const api = await ctx.buildApi();
          const payload = parseJsonMaybe(args.json, "json");
          if (!payload || typeof payload !== "object") throw new Error("json must be an object");
          const out = await api.updatePostGroup(requireArg("postGroup", args.postGroup), payload);
          printJson(out);
        });
      }
    )
    .command(
      "posts:delete-group <postGroup>",
      "Delete a post group (UUID)",
      (yy: Argv) =>
        yy
          .positional("postGroup", {
            type: "string",
            demandOption: true,
            describe: "Post group UUID to delete",
          })
          .example(
            "$0 posts:delete-group 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d",
            "Delete a post group (cancels scheduling if not yet published)"
          ),
      async (args: any) => {
        await runCommand("posts:delete-group", async () => {
          const api = await ctx.buildApi();
          const out = await api.deletePostGroup(requireArg("postGroup", args.postGroup));
          printJson(out);
        });
      }
    )
    .command(
      "posts:find-slot [integrationId]",
      "Find the next available publishing slot for the workspace (or a single channel)",
      (yy: Argv) =>
        yy
          .positional("integrationId", {
            type: "string",
            describe:
              "Optional integration UUID. When provided, only that channel's posting_times contribute to the candidate slots.",
          })
          .example(
            "$0 posts:find-slot",
            "Next free slot considering posting_times across every connected channel"
          )
          .example(
            "$0 posts:find-slot 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b",
            "Next free slot using only one channel's posting_times"
          ),
      async (args: any) => {
        await runCommand("posts:find-slot", async () => {
          const api = await ctx.buildApi();
          const integrationId =
            typeof args.integrationId === "string" && args.integrationId.trim()
              ? args.integrationId.trim()
              : undefined;
          const out = await api.findSlot(integrationId);
          printJson(out);
        });
      }
    )
    .command(
      "posts:delete <postId>",
      "Soft-delete a single post (also deletes the post's group — a row never publishes in isolation)",
      (yy: Argv) =>
        yy
          .positional("postId", {
            type: "string",
            demandOption: true,
            describe: "Post UUID (from `openquok posts:list`)",
          })
          .example(
            "$0 posts:delete 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d",
            "Cancel a scheduled post (and any siblings in the same group)"
          ),
      async (args: any) => {
        await runCommand("posts:delete", async () => {
          const api = await ctx.buildApi();
          const out = await api.deletePost(requireArg("postId", args.postId));
          printJson(out);
        });
      }
    )
    .command(
      "posts:missing <postId>",
      "List provider-side candidates for a published post whose release_id is 'missing'",
      (yy: Argv) =>
        yy
          .positional("postId", {
            type: "string",
            demandOption: true,
            describe: "Post UUID (must have release_id === 'missing')",
          })
          .example(
            "$0 posts:missing 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d",
            "Fetch candidate IDs/thumbnails so you can pick the matching published asset"
          )
          .example(
            "$0 posts:missing 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d | jq '.[] | {id, url}'",
            "Flatten the candidate list with jq"
          ),
      async (args: any) => {
        await runCommand("posts:missing", async () => {
          const api = await ctx.buildApi();
          const out = await api.getMissingContent(requireArg("postId", args.postId));
          printJson(out);
        });
      }
    )
    .command(
      "posts:connect <postId>",
      "Connect a 'missing' post to its real provider release id (unlocks per-post analytics)",
      (yy: Argv) =>
        yy
          .positional("postId", {
            type: "string",
            demandOption: true,
            describe: "Post UUID whose release_id is currently 'missing'",
          })
          .option("releaseId", {
            alias: "r",
            type: "string",
            demandOption: true,
            describe:
              "Platform-native release id (from `posts:missing`), e.g. a TikTok video id or Threads post id",
          })
          .example(
            '$0 posts:connect 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d --releaseId "7321456789012345678"',
            "Link a post to its published asset on the provider"
          ),
      async (args: any) => {
        await runCommand("posts:connect", async () => {
          const api = await ctx.buildApi();
          const out = await api.updateReleaseId(
            requireArg("postId", args.postId),
            requireArg("releaseId", args.releaseId)
          );
          printJson(out);
        });
      }
    );
};

