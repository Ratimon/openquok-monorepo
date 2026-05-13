import type { Argv } from "yargs";

import { printJson } from "../output";

import type { CommandContext, RegisterCommands } from "./types";
import { parseJsonMaybe, requireArg, runCommand, toArrayFromCsv } from "./utils";
import {
  buildMediaFromArgs,
  buildUpdatePostGroupBodyFromGetData,
  getDataObjectFromApiEnvelope,
  getPostGroupFromSummaryEnvelope,
  mergeProviderSettingsForIntegrations,
  parsePostsStatusFlag,
  readCreatePayloadFromJsonFile,
  resolveCreateStatus,
  toStringList,
} from "./posts.logic";

/** ISO timestamp for local calendar date ± `dayDelta` from right now (same clock time, JS local TZ). */
function localCalendarDaysFromNowIso(dayDelta: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dayDelta);
  return d.toISOString();
}

export const registerPostCommands: RegisterCommands = (y: Argv, ctx: CommandContext) => {
  return y
    .command(
      "posts:list",
      "List posts in a date range (defaults: ±30 local calendar days from today when --start/--end are omitted)",
      (yy: Argv) =>
        yy
          .option("start", {
            alias: "startDate",
            type: "string",
            describe: "Start ISO timestamp. Default: 30 local calendar days before today.",
          })
          .option("end", {
            alias: "endDate",
            type: "string",
            describe: "End ISO timestamp. Default: 30 local calendar days after today.",
          })
          .option("integrationIds", {
            alias: "i",
            type: "string",
            describe: "Optional comma-separated integration UUIDs to filter by",
          })
          .option("customerGroupId", {
            alias: "customer",
            type: "string",
            describe:
              "Optional channel-group UUID (`integration_customers.id`): only posts on integrations assigned to that group",
          })
          .example(
            "$0 posts:list",
            "List posts in the default window (today − 30 local calendar days through today + 30)"
          )
          .example(
            '$0 posts:list --startDate "2026-01-01T00:00:00Z" --endDate "2026-02-01T00:00:00Z"',
            "Same as --start / --end (alternate flag names)"
          )
          .example(
            '$0 posts:list --start "2026-01-01T00:00:00Z" --end "2026-02-01T00:00:00Z" --integrationIds "4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b,9c0d1e2f-3a4b-5c6d-7e8f-901a2b3c4d5e"',
            "Filter to a subset of channels (CSV of integration UUIDs)"
          )
          .example(
            "$0 posts:list --customer 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b",
            "Alias for --customerGroupId (still uses default date window unless you pass --start/--end)"
          ),
      async (args: any) => {
        await runCommand("posts:list", async () => {
          const api = await ctx.buildApi();

          const startRaw = args.start ?? args.startDate;
          const endRaw = args.end ?? args.endDate;

          const start =
            typeof startRaw === "string" && startRaw.trim()
              ? startRaw.trim()
              : localCalendarDaysFromNowIso(-30);
          const end =
            typeof endRaw === "string" && endRaw.trim() ? endRaw.trim() : localCalendarDaysFromNowIso(30);

          const out = await api.listPosts({
            start,
            end,
            integrationIds: typeof args.integrationIds === "string" ? args.integrationIds : undefined,
            customerGroupId:
              typeof args.customerGroupId === "string" && args.customerGroupId.trim()
                ? args.customerGroupId.trim()
                : typeof args.customer === "string" && args.customer.trim()
                  ? args.customer.trim()
                  : undefined,
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
          .option("scheduledAt", {
            alias: ["s", "date"],
            type: "string",
            describe: "ISO timestamp (required unless --json). Shorthand: -s / --date",
          })
          .option("status", {
            type: "string",
            choices: ["draft", "scheduled"] as const,
            describe: "draft | scheduled (Openquok API). Default: scheduled",
          })
          .option("type", {
            alias: "t",
            type: "string",
            choices: ["draft", "schedule", "scheduled"] as const,
            describe: 'Short form: draft | schedule (maps to API "scheduled")',
          })
          .option("body", {
            type: "string",
            describe: "Default body (used unless bodiesByIntegrationId is provided). Prefer -c for short form.",
          })
          .option("content", {
            alias: "c",
            type: "string",
            array: true,
            describe: "Post body; repeat for thread segments (maps to provider replies when supported)",
          })
          .option("integrationIds", {
            alias: ["i", "integrations"],
            type: "string",
            describe: "Comma-separated integration UUIDs (required unless --json)",
          })
          .option("media", {
            alias: "m",
            type: "string",
            array: true,
            describe:
              "Comma-separated storage paths or URLs per flag, or JSON array [{id,path}] from upload; repeat -m to pair with repeated -c",
          })
          .option("bodiesByIntegrationId", {
            type: "string",
            describe: 'JSON object: {"<integrationUuid>":"body override"}',
          })
          .option("providerSettingsByIntegrationId", {
            type: "string",
            describe: 'JSON object: {"<integrationUuid>":{...provider settings...}}',
          })
          .option("settings", {
            type: "string",
            describe:
              "Platform-specific settings JSON; merged into each selected integration's provider settings",
          })
          .option("tagNames", { type: "string", describe: "Comma-separated tags" })
          .option("repeatInterval", { type: "string", describe: "Repeat interval (backend enum)" })
          .option("delay", {
            alias: "d",
            type: "number",
            describe:
              "Milliseconds between thread segments when using multiple -c (default 5000). Maps to reply delaySeconds.",
          })
          .option("json", {
            alias: "j",
            type: "string",
            describe: "Path to JSON file with full POST /public/posts body (skips other flags)",
          })
          .check((argv) => {
            const jsonPath =
              typeof argv.json === "string" && argv.json.trim()
                ? argv.json.trim()
                : typeof argv.j === "string" && argv.j.trim()
                  ? argv.j.trim()
                  : undefined;
            if (jsonPath) return true;

            const date = argv.scheduledAt ?? argv.date ?? argv.s;
            if (typeof date !== "string" || !date.trim()) {
              throw new Error("scheduledAt is required (use -s / --date / --scheduledAt) unless using --json");
            }
            const ints = argv.integrationIds ?? argv.integrations ?? argv.i;
            if (typeof ints !== "string" || !ints.trim()) {
              throw new Error("integrations are required (use -i / --integrations / --integrationIds) unless using --json");
            }
            const contents = toStringList(argv.content);
            const body = typeof argv.body === "string" ? argv.body.trim() : "";
            if (!body && contents.length === 0) {
              throw new Error("body or content (-c) is required unless using --json");
            }
            return true;
          })
          .example(
            '$0 posts:create -c "Hello from Openquok" -s "2026-01-01T12:00:00Z" -i "4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b"',
            "Short flags (-c -s -i) equivalent to --body --scheduledAt --integrationIds"
          )
          .example(
            '$0 posts:create -c "Draft me" -s "2026-01-01T12:00:00Z" -t draft -i "4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b"',
            "type=draft maps to API status draft"
          )
          .example(
            '$0 posts:create --scheduledAt "2026-01-01T12:00:00Z" --integrationIds "uuid-a,uuid-b" --bodiesByIntegrationId \'{"uuid-a":"Caption for A","uuid-b":"Caption for B"}\'',
            "Long-form flags still supported"
          )
          .example(
            '$0 posts:create -c "With media" -s "2026-01-01T12:00:00Z" -i "uuid-a" -m "uploads/2026/01/img.png"',
            "Bare paths/URLs get a client-generated media id; prefer upload JSON for production"
          )
          .example(
            '$0 posts:create -c "1/3" -c "2/3" -c "3/3" -d 60000 -s "2026-01-01T12:00:00Z" -i "$THREADS_ID"',
            "Repeated -c builds provider replies (delay in ms between segments; default 5000)"
          )
          .example(
            '$0 posts:create -c "Same copy everywhere" -s "2026-01-01T12:00:00Z" -i "uuid-a,uuid-b,uuid-c"',
            "Comma-separated -i publishes one body to multiple channels"
          )
          .example(
            '$0 posts:create -c "Hello" -s "2026-01-01T12:00:00Z" -i "$ID" --settings \'{"customField":true}\'',
            "Platform JSON merged into providerSettingsByIntegrationId for each -i"
          )
          .example("$0 posts:create --json ./post.json", "Full payload from JSON file (Openquok POST /public/posts shape)"),
      async (args: any) => {
        await runCommand("posts:create", async () => {
          const api = await ctx.buildApi();

          const jsonPath =
            typeof args.json === "string" && args.json.trim()
              ? args.json.trim()
              : typeof args.j === "string" && args.j.trim()
                ? args.j.trim()
                : undefined;

          if (jsonPath) {
            const payload = readCreatePayloadFromJsonFile(jsonPath);
            const out = await api.createPost(payload);
            printJson(out);
            return;
          }

          const segments = toStringList(args.content);
          const hasBody = typeof args.body === "string" && args.body.trim();
          const bodyText =
            segments.length > 1
              ? segments[0]!
              : segments.length === 1
                ? segments[0]!
                : hasBody
                  ? String(args.body).trim()
                  : "";

          const integrationCsv =
            typeof args.integrationIds === "string" && args.integrationIds.trim()
              ? args.integrationIds.trim()
              : typeof args.integrations === "string" && args.integrations.trim()
                ? args.integrations.trim()
                : "";
          const integrationIds = toArrayFromCsv(integrationCsv) ?? [];

          const scheduledAt = requireArg(
            "scheduledAt",
            args.scheduledAt ?? args.date ?? args.s
          );

          const status = resolveCreateStatus(args);

          const media = buildMediaFromArgs(args.media);
          const bodiesByIntegrationId = parseJsonMaybe(args.bodiesByIntegrationId, "bodiesByIntegrationId");
          const providerSettingsByIntegrationId = parseJsonMaybe(
            args.providerSettingsByIntegrationId,
            "providerSettingsByIntegrationId"
          );
          const settingsParsed = parseJsonMaybe(args.settings, "settings");

          const delayMs = typeof args.delay === "number" && !Number.isNaN(args.delay) ? args.delay : 5000;

          const mergedProvider = mergeProviderSettingsForIntegrations({
            integrationIds,
            contentSegments: segments.length ? segments : [bodyText],
            delayMs,
            settingsJson: settingsParsed,
            explicitByIntegration: providerSettingsByIntegrationId,
          });

          const payload: Record<string, unknown> = {
            scheduledAt,
            status,
            ...(bodyText ? { body: bodyText } : {}),
            ...(integrationIds.length ? { integrationIds } : {}),
            ...(media.length ? { media } : {}),
            ...(bodiesByIntegrationId && typeof bodiesByIntegrationId === "object"
              ? { bodiesByIntegrationId }
              : {}),
            ...(mergedProvider ? { providerSettingsByIntegrationId: mergedProvider } : {}),
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
      "Update a post group (PUT body matches create: at least scheduledAt + status; usually copy from posts:group or use posts:status to flip draft/scheduled only)",
      (yy: Argv) =>
        yy
          .positional("postGroup", {
            type: "string",
            demandOption: true,
            describe: "Post group UUID to update",
          })
          .option("json", { type: "string", demandOption: true, describe: "Full JSON payload string" })
          .example(
            '$0 posts:update-group 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d --json \'{"scheduledAt":"2026-02-15T09:00:00Z","status":"draft"}\'',
            "Move a scheduled group back to draft (PUT requires scheduledAt + status with the full shape)"
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
      "posts:status <postId>",
      "Flip a post group between draft and scheduled without changing its stored publish time (resolve row → group, GET group, PUT)",
      (yy: Argv) =>
        yy
          .positional("postId", {
            type: "string",
            demandOption: true,
            describe: "Post row UUID from `posts:list` (any row in the group); same id style as `posts:delete`",
          })
          .option("status", {
            alias: "s",
            type: "string",
            demandOption: true,
            choices: ["draft", "schedule", "scheduled"] as const,
            describe: 'draft | schedule (synonym for API "scheduled") | scheduled',
          })
          .example(
            "$0 posts:status 5b6c7d8e-9f01-2a3b-4c5d-6e7f8a9b0c1d --status draft",
            "Pause the group that row belongs to (terminates publishing workflow; keeps stored publish time)"
          )
          .example(
            "$0 posts:status 5b6c7d8e-9f01-2a3b-4c5d-6e7f8a9b0c1d -s schedule",
            "Promote draft to scheduled at the existing publish time (re)queues publishing"
          ),
      async (args: any) => {
        await runCommand("posts:status", async () => {
          const api = await ctx.buildApi();
          const postId = requireArg("postId", args.postId);
          const summaryRaw = await api.getPost(postId);
          const postGroup = getPostGroupFromSummaryEnvelope(summaryRaw);
          const raw = await api.getPostGroup(postGroup);
          const data = getDataObjectFromApiEnvelope(raw);
          const next = parsePostsStatusFlag(args.status ?? args.s);
          const putBody = buildUpdatePostGroupBodyFromGetData(data, next);
          const out = await api.updatePostGroup(postGroup, putBody);
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
            "$0 posts:missing 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d | jq '.data.items[] | {id, url}'",
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
            alias: ["r", "release-id"],
            type: "string",
            demandOption: true,
            describe:
              "Platform-native release id (from `posts:missing`), e.g. a TikTok video id or Threads post id",
          })
          .example(
            '$0 posts:connect 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d --release-id "7321456789012345678"',
            "Kebab-case --release-id (same as --releaseId / -r)"
          ),
      async (args: any) => {
        await runCommand("posts:connect", async () => {
          const api = await ctx.buildApi();
          const rid = args.releaseId ?? args["release-id"];
          const out = await api.updateReleaseId(requireArg("postId", args.postId), requireArg("releaseId", rid));
          printJson(out);
        });
      }
    );
};
