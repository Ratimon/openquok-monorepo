import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { IntegrationConnectionService } from "../../services/IntegrationConnectionService";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";

export function registerPlugsDeleteTool(
    server: McpServer,
    deps: { integrationConnectionService: IntegrationConnectionService }
): void {
    server.registerTool(
        "plugsDelete",
        {
            description: "Delete a saved global plug rule.",
            inputSchema: {
                plugId: z.string().describe("Plug row id from plugsList"),
            },
        },
        async ({ plugId }) => {
            const id = plugId?.trim();
            if (!id) {
                throw new Error("plugId is required");
            }

            const { organizationId } = getMcpContext();
            const data = await deps.integrationConnectionService.publicDeleteIntegrationPlug(organizationId, id);
            return mcpJsonResult(data);
        }
    );
}
