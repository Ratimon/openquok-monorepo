import type { Argv } from "yargs";

import { printJson } from "../output";

import {
  buildCreateDirectoryProfileBody,
  buildEnsureVariantBody,
  buildUpdateDirectoryProfileBody,
  filterDirectoryProfilesListResponse,
  parseDirectorySeoHistoryDays,
} from "./directory.logic";
import type { CommandContext, RegisterCommands } from "./types";
import { requireArg, runCommand } from "./utils";

export const registerDirectoryCommands: RegisterCommands = (y: Argv, ctx: CommandContext) => {
  return y
    .command(
      "directory:destinations:list",
      "List published directory launch destinations (providerSlug, startUrl, extensionConfig)",
      (yy: Argv) =>
        yy.example(
          "$0 directory:destinations:list | jq '.data[] | {providerSlug, name, startUrl}'",
          "Scan the launch catalog"
        ),
      async () => {
        await runCommand("directory:destinations:list", async () => {
          const api = await ctx.buildApi();
          printJson(await api.listDirectoryLaunchDestinations());
        });
      }
    )
    .command(
      "directory:business-profiles:list",
      "List channel-group ↔ product profile rows for the workspace",
      (yy: Argv) =>
        yy.example(
          "$0 directory:business-profiles:list | jq '.data[] | {integrationCustomerId, productProfileId, name}'",
          "Map channel groups to product profiles"
        ),
      async () => {
        await runCommand("directory:business-profiles:list", async () => {
          const api = await ctx.buildApi();
          printJson(await api.listDirectoryLaunchBusinessProfiles());
        });
      }
    )
    .command(
      "directory:profiles:list",
      "List main and variant product profiles",
      (yy: Argv) =>
        yy
          .option("customer-group-id", {
            type: "string",
            describe: "Filter by integration_customers.id (channel group)",
          })
          .option("main-only", {
            type: "boolean",
            default: false,
            describe: "Client filter: only main profiles (no parentProfileId)",
          })
          .example(
            "$0 directory:profiles:list --main-only | jq '.data[] | {id, name, profileKind}'",
            "Main profiles only"
          )
          .example(
            "$0 directory:profiles:list --customer-group-id <customer-group-id>",
            "Profiles linked to one channel group"
          ),
      async (args: any) => {
        await runCommand("directory:profiles:list", async () => {
          const api = await ctx.buildApi();
          const customerGroupId =
            typeof args["customer-group-id"] === "string"
              ? args["customer-group-id"].trim()
              : undefined;
          const out = await api.listDirectoryLaunchProfiles({
            integrationCustomerId: customerGroupId || undefined,
          });
          printJson(filterDirectoryProfilesListResponse(out, Boolean(args["main-only"])));
        });
      }
    )
    .command(
      "directory:profiles:get <id>",
      "Get one product profile (profileData, similarityToMainPercent, variant fields)",
      (yy: Argv) =>
        yy
          .positional("id", {
            type: "string",
            demandOption: true,
            describe: "Product profile UUID",
          })
          .example("$0 directory:profiles:get <profile-id>", "Full profile DTO"),
      async (args: any) => {
        await runCommand("directory:profiles:get", async () => {
          const api = await ctx.buildApi();
          printJson(await api.getDirectoryLaunchProfile(requireArg("id", args.id)));
        });
      }
    )
    .command(
      "directory:profiles:create",
      "Create a main product profile",
      (yy: Argv) =>
        yy
          .option("name", { type: "string", describe: "Product name" })
          .option("tagline", { type: "string", describe: "Short tagline" })
          .option("description", { type: "string", describe: "Long description" })
          .option("website-url", { type: "string", describe: "Product website URL" })
          .option("logo-url", { type: "string", describe: "Logo image URL" })
          .option("customer-group-id", {
            type: "string",
            describe: "Link to integration_customers.id (channel group)",
          })
          .option("profile-data", {
            type: "string",
            describe: "profileData object as JSON",
          })
          .option("json", {
            alias: "j",
            type: "string",
            describe: "Path to JSON file (POST /public/directory-launch/profiles shape)",
          })
          .example(
            '$0 directory:profiles:create --name "Acme" --website-url "https://acme.example"',
            "Minimal main profile"
          )
          .example("$0 directory:profiles:create --json ./profile-create.json", "Create from file"),
      async (args: any) => {
        await runCommand("directory:profiles:create", async () => {
          const api = await ctx.buildApi();
          const body = buildCreateDirectoryProfileBody({
            name: args.name,
            tagline: args.tagline,
            description: args.description,
            websiteUrl: args["website-url"],
            logoUrl: args["logo-url"],
            customerGroupId: args["customer-group-id"],
            profileData: args["profile-data"],
            json: args.json,
          });
          printJson(await api.createDirectoryLaunchProfile(body));
        });
      }
    )
    .command(
      "directory:profiles:update <id>",
      "Patch a main or variant product profile",
      (yy: Argv) =>
        yy
          .positional("id", {
            type: "string",
            demandOption: true,
            describe: "Product profile UUID",
          })
          .option("name", { type: "string" })
          .option("tagline", { type: "string" })
          .option("description", { type: "string" })
          .option("website-url", { type: "string" })
          .option("logo-url", { type: "string" })
          .option("customer-group-id", { type: "string" })
          .option("profile-data", { type: "string", describe: "profileData object as JSON" })
          .option("json", {
            alias: "j",
            type: "string",
            describe: "Path to JSON patch file",
          })
          .example("$0 directory:profiles:update <profile-id> --json ./profile-patch.json", "Patch from file"),
      async (args: any) => {
        await runCommand("directory:profiles:update", async () => {
          const api = await ctx.buildApi();
          const body = buildUpdateDirectoryProfileBody({
            name: args.name,
            tagline: args.tagline,
            description: args.description,
            websiteUrl: args["website-url"],
            logoUrl: args["logo-url"],
            customerGroupId: args["customer-group-id"],
            profileData: args["profile-data"],
            json: args.json,
          });
          printJson(
            await api.updateDirectoryLaunchProfile(requireArg("id", args.id), body)
          );
        });
      }
    )
    .command(
      "directory:variants:ensure <mainId>",
      "Idempotent variant for a directorySiteKey under a main profile",
      (yy: Argv) =>
        yy
          .positional("mainId", {
            type: "string",
            demandOption: true,
            describe: "Main product profile UUID",
          })
          .option("site-key", {
            type: "string",
            demandOption: true,
            describe: "Destination site key (e.g. peerpush, uneed)",
          })
          .option("name", {
            type: "string",
            describe: "Optional variant display name override",
          })
          .example(
            "$0 directory:variants:ensure <main-profile-id> --site-key peerpush",
            "Ensure PeerPush-tailored copy exists"
          ),
      async (args: any) => {
        await runCommand("directory:variants:ensure", async () => {
          const api = await ctx.buildApi();
          const body = buildEnsureVariantBody({
            siteKey: args["site-key"],
            name: args.name,
          });
          printJson(
            await api.ensureDirectoryLaunchVariant(requireArg("mainId", args.mainId), body)
          );
        });
      }
    )
    .command(
      "directory:listings <profileId>",
      "Listing summary: submission status and launch readiness per destination",
      (yy: Argv) =>
        yy
          .positional("profileId", {
            type: "string",
            demandOption: true,
            describe: "Product profile UUID (main or variant)",
          })
          .example(
            "$0 directory:listings <profile-id> | jq '.data | {submittedDirectorySiteCount, unsubmittedDirectorySiteCount}'",
            "Counts before launch"
          ),
      async (args: any) => {
        await runCommand("directory:listings", async () => {
          const api = await ctx.buildApi();
          printJson(
            await api.getDirectoryLaunchListingSummary(requireArg("profileId", args.profileId))
          );
        });
      }
    )
    .command(
      "directory:submissions:list",
      "Read-only directory submission rows",
      (yy: Argv) =>
        yy
          .option("profile", {
            type: "string",
            describe: "Filter by productProfileId",
          })
          .option("destination", {
            type: "string",
            describe: "Filter by destinationId",
          })
          .example(
            "$0 directory:submissions:list --profile <profile-id>",
            "Submissions for one profile"
          ),
      async (args: any) => {
        await runCommand("directory:submissions:list", async () => {
          const api = await ctx.buildApi();
          const profile =
            typeof args.profile === "string" && args.profile.trim() ? args.profile.trim() : undefined;
          const destination =
            typeof args.destination === "string" && args.destination.trim()
              ? args.destination.trim()
              : undefined;
          printJson(
            await api.listDirectoryLaunchSubmissions({
              productProfileId: profile,
              destinationId: destination,
            })
          );
        });
      }
    )
    .command(
      "directory:analytics:overview",
      "Directory SEO workspace overview (cached DR metrics; see checkedAt)",
      (yy: Argv) =>
        yy
          .option("profile", {
            type: "string",
            demandOption: true,
            describe: "productProfileId",
          })
          .example(
            "$0 directory:analytics:overview --profile <profile-id> | jq '.data.productDomain.checkedAt'",
            "When metrics were last cached"
          ),
      async (args: any) => {
        await runCommand("directory:analytics:overview", async () => {
          const api = await ctx.buildApi();
          printJson(
            await api.getDirectorySeoOverview(requireArg("profile", args.profile))
          );
        });
      }
    )
    .command(
      "directory:analytics:history",
      "Directory SEO DR history for the product domain and competitors",
      (yy: Argv) =>
        yy
          .option("profile", {
            type: "string",
            demandOption: true,
            describe: "productProfileId",
          })
          .option("days", {
            alias: "d",
            type: "number",
            default: 90,
            describe: "Look-back window in days (1–366, default 90)",
          })
          .example(
            "$0 directory:analytics:history --profile <profile-id> -d 30",
            "Last 30 days of DR points"
          ),
      async (args: any) => {
        await runCommand("directory:analytics:history", async () => {
          const api = await ctx.buildApi();
          const days = parseDirectorySeoHistoryDays(args.days);
          printJson(
            await api.getDirectorySeoHistory(requireArg("profile", args.profile), days)
          );
        });
      }
    )
    .command(
      "directory:analytics:refresh",
      "Manually refresh directory SEO metrics (respect manualRefreshAvailableAt in response)",
      (yy: Argv) =>
        yy
          .option("profile", {
            type: "string",
            demandOption: true,
            describe: "productProfileId",
          })
          .option("force", {
            type: "boolean",
            default: false,
            describe: "Bypass cooldown when the plan allows force refresh",
          })
          .example("$0 directory:analytics:refresh --profile <profile-id>", "Refresh cached DR"),
      async (args: any) => {
        await runCommand("directory:analytics:refresh", async () => {
          const api = await ctx.buildApi();
          printJson(
            await api.refreshDirectorySeo({
              productProfileId: requireArg("profile", args.profile),
              force: Boolean(args.force),
            })
          );
        });
      }
    )
    .command(
      "directory:analytics:competitors:add",
      "Add a competitor domain to directory SEO tracking (workspace quota applies)",
      (yy: Argv) =>
        yy
          .option("domain", { type: "string", demandOption: true, describe: "Competitor domain" })
          .option("label", { type: "string", describe: "Optional display label" })
          .option("sort-order", { type: "number", describe: "Optional sort order (0–10000)" })
          .example(
            '$0 directory:analytics:competitors:add --domain rival.example --label "Rival Co"',
            "Track a competitor"
          ),
      async (args: any) => {
        await runCommand("directory:analytics:competitors:add", async () => {
          const api = await ctx.buildApi();
          const body: Record<string, unknown> = {
            domain: requireArg("domain", args.domain),
          };
          if (typeof args.label === "string") body.label = args.label.trim() || null;
          if (args["sort-order"] !== undefined) body.sortOrder = args["sort-order"];
          printJson(await api.addDirectorySeoCompetitor(body));
        });
      }
    )
    .command(
      "directory:analytics:competitors:remove",
      "Remove a tracked competitor domain",
      (yy: Argv) =>
        yy
          .option("domain", { type: "string", demandOption: true, describe: "Competitor domain" })
          .example(
            "$0 directory:analytics:competitors:remove --domain rival.example",
            "Stop tracking a domain"
          ),
      async (args: any) => {
        await runCommand("directory:analytics:competitors:remove", async () => {
          const api = await ctx.buildApi();
          printJson(
            await api.deleteDirectorySeoCompetitor({
              domain: requireArg("domain", args.domain),
            })
          );
        });
      }
    )
    .command(
      "directory:analytics:competitors:update",
      "Update a competitor display label",
      (yy: Argv) =>
        yy
          .option("domain", { type: "string", demandOption: true, describe: "Competitor domain" })
          .option("label", {
            type: "string",
            describe: "New label (omit or empty string to clear)",
          })
          .example(
            '$0 directory:analytics:competitors:update --domain rival.example --label "Rival (EU)"',
            "Rename a competitor"
          ),
      async (args: any) => {
        await runCommand("directory:analytics:competitors:update", async () => {
          const api = await ctx.buildApi();
          const label =
            args.label === undefined
              ? null
              : typeof args.label === "string"
                ? args.label.trim() || null
                : null;
          printJson(
            await api.updateDirectorySeoCompetitor({
              domain: requireArg("domain", args.domain),
              label,
            })
          );
        });
      }
    );
};
