import { z } from "zod";
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
            description:
                "List connected social media channels for the authenticated workspace. Optionally filter by channel group id from groupList.",
            inputSchema: {
                group: z
                    .string()
                    .optional()
                    .describe("Channel group id from groupList; when set, only channels in that group are returned"),
            },
        },
        async ({ group }) => {
            const { organizationId } = getMcpContext();
            const groupId = group?.trim() || undefined;
            const channels = await deps.integrationConnectionService.publicListIntegrations(
                organizationId,
                groupId
            );

            const integrations = channels.map((channel) => ({
                ...channel,
                platform: channel.identifier,
            }));
            const output = { integrations };
            return {
                content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
                structuredContent: output,
            };
        }
    );
}
