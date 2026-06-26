import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { IntegrationConnectionService } from "../../services/IntegrationConnectionService";
import { getMcpContext } from "../context";

export function registerGroupListTool(
    server: McpServer,
    deps: { integrationConnectionService: IntegrationConnectionService }
): void {
    server.registerTool(
        "groupList",
        {
            description:
                "List channel groups (customers) for the authenticated workspace. Use a group id with integrationList to filter channels.",
        },
        async () => {
            const { organizationId } = getMcpContext();
            const groups = await deps.integrationConnectionService.publicListCustomerGroups(organizationId);
            const output = { groups };
            return {
                content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
                structuredContent: output,
            };
        }
    );
}
