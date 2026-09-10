import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { IntegrationConnectionService } from "../../services/IntegrationConnectionService";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";

export function registerPlugsListTool(
    server: McpServer,
    deps: { integrationConnectionService: IntegrationConnectionService }
): void {
    server.registerTool(
        "plugsList",
        {
            description: "List saved global plug rules on a connected channel.",
            inputSchema: {
                integrationId: z.string().describe("Connected channel id from integrationList"),
            },
        },
        async ({ integrationId }) => {
            const channelId = integrationId?.trim();
            if (!channelId) {
                throw new Error("integrationId is required");
            }

            const { organizationId } = getMcpContext();
            const plugs = await deps.integrationConnectionService.publicListIntegrationPlugs(
                organizationId,
                channelId
            );
            return mcpJsonResult({ plugs });
        }
    );
}
