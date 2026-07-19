import type { Argv } from "yargs";

import { printJson } from "../output";

import type { CommandContext, RegisterCommands } from "./types";
import { buildPlugUpsertInput, parseActivatedFlag } from "./plugs.logic";
import { parseJsonMaybe, requireArg, runCommand } from "./utils";

export const registerPlugCommands: RegisterCommands = (y: Argv, ctx: CommandContext) => {
  return y
    .command(
      "plugs:catalog",
      "List global plug types per provider (likes-threshold rules)",
      (yy: Argv) =>
        yy.example(
          "$0 plugs:catalog | jq '.plugs[] | select(.identifier==\"threads\")'",
          "Show Threads global plug definitions (methodName, fields)"
        ),
      async () => {
        await runCommand("plugs:catalog", async () => {
          const api = await ctx.buildApi();
          const out = await api.getPlugCatalog();
          printJson(out);
        });
      }
    )
    .command(
      "plugs:list <integration-id>",
      "List saved global plug rules for a connected channel",
      (yy: Argv) =>
        yy
          .positional("integration-id", {
            type: "string",
            demandOption: true,
            describe: "Integration channel UUID (from `openquok integrations:list`)",
          })
          .example(
            "$0 plugs:list 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b",
            "List all global plug rules on one channel"
          ),
      async (args: any) => {
        await runCommand("plugs:list", async () => {
          const api = await ctx.buildApi();
          const out = await api.listIntegrationPlugs(requireArg("integration-id", args["integration-id"]));
          printJson(out);
        });
      }
    )
    .command(
      "plugs:upsert <integration-id>",
      "Create or update a global plug rule on a channel",
      (yy: Argv) =>
        yy
          .positional("integration-id", {
            type: "string",
            demandOption: true,
            describe: "Integration channel UUID (from `openquok integrations:list`)",
          })
          .option("func", {
            type: "string",
            describe: "Plug methodName from `plugs:catalog` (e.g. autoPlugPost, autoRepostPost)",
          })
          .option("fields", {
            type: "string",
            describe:
              'Field values as JSON array: \'[{"name":"likesAmount","value":"100"},{"name":"post","value":"Thanks!"}]\'',
          })
          .option("plug-id", {
            type: "string",
            describe: "Existing plug rule UUID to update (omit to create a new rule)",
          })
          .option("json", {
            alias: "j",
            type: "string",
            describe: "Path to JSON file with { func, fields, plugId? }",
          })
          .example(
            "$0 plugs:upsert 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b --func autoPlugPost --fields '[{\"name\":\"likesAmount\",\"value\":\"100\"},{\"name\":\"post\",\"value\":\"Grab the link in bio!\"}]'",
            "Threads auto-reply when a post reaches 100 likes"
          )
          .example(
            "$0 plugs:upsert 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b --json ./plug-rule.json",
            "Upsert from a JSON file"
          ),
      async (args: any) => {
        await runCommand("plugs:upsert", async () => {
          const api = await ctx.buildApi();
          let body;
          try {
            const fieldsRaw = parseJsonMaybe(args.fields, "fields");
            body = buildPlugUpsertInput({
              func: args.func,
              fields: fieldsRaw,
              plugId: args["plug-id"],
              json: args.json,
            });
          } catch (err) {
            if (typeof args.fields === "string" && err instanceof SyntaxError) {
              throw new Error("fields must be valid JSON");
            }
            throw err;
          }
          const out = await api.upsertIntegrationPlug(
            requireArg("integration-id", args["integration-id"]),
            body
          );
          printJson(out);
        });
      }
    )
    .command(
      "plugs:delete <plug-id>",
      "Delete a global plug rule",
      (yy: Argv) =>
        yy
          .positional("plug-id", {
            type: "string",
            demandOption: true,
            describe: "Plug rule UUID (from `plugs:list`)",
          })
          .example("$0 plugs:delete 9c0d1e2f-3a4b-5c6d-7e8f-901a2b3c4d5e", "Remove a saved global plug rule"),
      async (args: any) => {
        await runCommand("plugs:delete", async () => {
          const api = await ctx.buildApi();
          const out = await api.deleteIntegrationPlug(requireArg("plug-id", args["plug-id"]));
          printJson(out);
        });
      }
    )
    .command(
      "plugs:activate <plug-id>",
      "Enable or disable a global plug rule",
      (yy: Argv) =>
        yy
          .positional("plug-id", {
            type: "string",
            demandOption: true,
            describe: "Plug rule UUID (from `plugs:list`)",
          })
          .option("activated", {
            type: "boolean",
            demandOption: true,
            describe: "true to enable the rule; false to pause it",
          })
          .example("$0 plugs:activate 9c0d1e2f-3a4b-5c6d-7e8f-901a2b3c4d5e --activated false", "Pause a plug rule"),
      async (args: any) => {
        await runCommand("plugs:activate", async () => {
          const api = await ctx.buildApi();
          const activated = parseActivatedFlag(args.activated);
          const out = await api.setIntegrationPlugActivated(
            requireArg("plug-id", args["plug-id"]),
            activated
          );
          printJson(out);
        });
      }
    );
};
