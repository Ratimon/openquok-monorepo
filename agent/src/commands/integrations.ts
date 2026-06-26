import type { Argv } from "yargs";

import { printJson } from "../output";

import type { CommandContext, RegisterCommands } from "./types";
import { parseJsonMaybe, requireArg, runCommand } from "./utils";

export const registerIntegrationCommands: RegisterCommands = (y: Argv, ctx: CommandContext) => {
  return y
    .command(
      "integrations:list",
      "List connected integrations (programmatic)",
      (yy: Argv) =>
        yy
          .option("group", {
            type: "string",
            describe:
              "Optional channel-group UUID (`integration_customers.id` from `openquok integrations:groups`)",
          })
          .example("$0 integrations:list", "List every connected channel for the current workspace")
          .example(
            "$0 integrations:list --group 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b",
            "List only channels assigned to one channel group"
          ),
      async (args: any) => {
        await runCommand("integrations:list", async () => {
          const api = await ctx.buildApi();
          const group = typeof args.group === "string" ? args.group : undefined;
          const out = await api.listIntegrations(group);
          printJson(out);
        });
      }
    )
    .command(
      "integrations:groups",
      "List channel groups (customers) for the current workspace",
      (yy: Argv) =>
        yy.example("$0 integrations:groups", "List every channel group; use ids with integrations:list --group"),
      async () => {
        await runCommand("integrations:groups", async () => {
          const api = await ctx.buildApi();
          const out = await api.listGroups();
          printJson(out);
        });
      }
    )
    .command(
      "integrations:settings <id>",
      "Get rules, max length, settings schema, and allow-listed tools for a connected channel",
      (yy: Argv) =>
        yy
          .positional("id", {
            type: "string",
            demandOption: true,
            describe: "Integration channel UUID (from `openquok integrations:list`)",
          })
          .example(
            "$0 integrations:settings 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b",
            "Inspect what tools and constraints the channel supports"
          )
          .example(
            "$0 integrations:settings 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b | jq .output.tools",
            "Show only the allow-listed tools (use with `integrations:trigger`)"
          ),
      async (args: any) => {
        await runCommand("integrations:settings", async () => {
          const api = await ctx.buildApi();
          const out = await api.getIntegrationSettings(requireArg("id", args.id));
          printJson(out);
        });
      }
    )
    .command(
      "integrations:trigger <id> <method>",
      "Invoke an allow-listed provider tool on a connected channel",
      (yy: Argv) =>
        yy
          .positional("id", {
            type: "string",
            demandOption: true,
            describe: "Integration channel UUID (from `openquok integrations:list`)",
          })
          .positional("method", {
            type: "string",
            demandOption: true,
            describe: "Tool method name (from `output.tools[].methodName` of `integrations:settings`)",
          })
          .option("data", {
            alias: "d",
            type: "string",
            describe:
              "Tool input payload as a JSON string (object). Shape is provider-specific; see `output.tools[].dataSchema`.",
          })
          .example(
            "$0 integrations:trigger 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b getThings",
            "Run a tool that takes no input"
          )
          .example(
            "$0 integrations:trigger 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b searchThings -d '{\"query\":\"programming\"}'",
            "Run a tool with a JSON payload (note shell quoting of the JSON)"
          ),
      async (args: any) => {
        await runCommand("integrations:trigger", async () => {
          const api = await ctx.buildApi();
          const parsed = parseJsonMaybe(args.data, "data");
          const data =
            parsed && typeof parsed === "object" && !Array.isArray(parsed)
              ? (parsed as Record<string, unknown>)
              : {};
          const out = await api.triggerIntegrationTool(
            requireArg("id", args.id),
            requireArg("method", args.method),
            data
          );
          printJson(out);
        });
      }
    );
};
