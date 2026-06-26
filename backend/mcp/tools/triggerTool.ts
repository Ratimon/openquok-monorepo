import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { IntegrationConnectionService } from "../../services/IntegrationConnectionService";
import { getMcpContext } from "../context";

export function registerTriggerTool(
    server: McpServer,
    deps: { integrationConnectionService: IntegrationConnectionService }
): void {
    server.registerTool(
        "triggerTool",
        {
            description:
                "Invoke an allow-listed provider method on a connected channel (same as POST /public/integration-trigger/:id).",
            inputSchema: {
                integration: z.string().describe("Connected channel id"),
                methodName: z.string().describe("Provider tool method name"),
                data: z.record(z.unknown()).optional().describe("Payload passed to the provider method"),
            },
        },
        async ({ integration, methodName, data }) => {
            const { organizationId } = getMcpContext();
            const result = await deps.integrationConnectionService.triggerIntegrationTool(
                organizationId,
                integration,
                methodName,
                data ?? {}
            );
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                structuredContent: result,
            };
        }
    );
}
