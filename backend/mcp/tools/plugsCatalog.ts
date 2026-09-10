import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { IntegrationConnectionService } from "../../services/IntegrationConnectionService";
import { mcpJsonResult } from "./mcpJsonResult";

export function registerPlugsCatalogTool(
    server: McpServer,
    deps: { integrationConnectionService: IntegrationConnectionService }
): void {
    server.registerTool(
        "plugsCatalog",
        {
            description:
                "List global plug types and field names per provider (like-threshold auto-reply/repost rules).",
        },
        async () => {
            const data = deps.integrationConnectionService.getPlugCatalog();
            return mcpJsonResult(data);
        }
    );
}
