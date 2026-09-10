import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { IntegrationConnectionService } from "../../services/IntegrationConnectionService";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";

const plugFieldSchema = z.object({
    name: z.string().min(1),
    value: z.string(),
});

export function registerPlugsUpsertTool(
    server: McpServer,
    deps: { integrationConnectionService: IntegrationConnectionService }
): void {
    server.registerTool(
        "plugsUpsert",
        {
            description: "Create or update a global plug rule on a connected channel (func + fields).",
            inputSchema: {
                integrationId: z.string().describe("Connected channel id from integrationList"),
                func: z.string().describe("Plug function name from plugsCatalog"),
                fields: z.array(plugFieldSchema).describe("Plug field values"),
                plugId: z.string().optional().describe("Existing plug row id to update"),
            },
        },
        async ({ integrationId, func, fields, plugId }) => {
            const channelId = integrationId?.trim();
            const funcName = func?.trim();
            if (!channelId) {
                throw new Error("integrationId is required");
            }
            if (!funcName) {
                throw new Error("func is required");
            }

            const { organizationId } = getMcpContext();
            const data = await deps.integrationConnectionService.publicUpsertIntegrationPlug(
                organizationId,
                channelId,
                {
                    func: funcName,
                    fields,
                    plugId: plugId?.trim() || undefined,
                }
            );
            return mcpJsonResult(data);
        }
    );
}
