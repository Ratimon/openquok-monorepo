import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { IntegrationConnectionService } from "../../services/IntegrationConnectionService";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";

export function registerPlugsActivateTool(
    server: McpServer,
    deps: { integrationConnectionService: IntegrationConnectionService }
): void {
    server.registerTool(
        "plugsActivate",
        {
            description: "Enable or disable a saved global plug rule.",
            inputSchema: {
                plugId: z.string().describe("Plug row id from plugsList"),
                activated: z.boolean().describe("true to enable, false to disable"),
            },
        },
        async ({ plugId, activated }) => {
            const id = plugId?.trim();
            if (!id) {
                throw new Error("plugId is required");
            }

            const { organizationId } = getMcpContext();
            const data = await deps.integrationConnectionService.publicSetIntegrationPlugActivated(
                organizationId,
                id,
                activated
            );
            return mcpJsonResult(data);
        }
    );
}
