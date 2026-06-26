import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { IntegrationConnectionService } from "../../services/IntegrationConnectionService";
import { getMcpContext } from "../context";

export function registerIntegrationListTool(
    server: McpServer,
    deps: { integrationConnectionService: IntegrationConnectionService }
): void {
    server.registerTool(
        "integrationList",
        {
            description: "List connected social media channels for the authenticated workspace.",
        },
        async () => {
            const { organizationId } = getMcpContext();
            const channels = await deps.integrationConnectionService.publicListIntegrations(organizationId);
            const output = { integrations: channels };
            return {
                content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
                structuredContent: output,
            };
        }
    );
}
