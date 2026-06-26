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
                integration: z.string().optional().describe("Connected channel id (alias: integrationId)"),
                integrationId: z.string().optional().describe("Connected channel id from integrationList"),
                methodName: z.string().describe("Provider tool method name from integrationSchema"),
                data: z.record(z.unknown()).optional().describe("Payload passed to the provider method"),
                dataSchema: z
                    .array(
                        z.object({
                            key: z.string().describe("Parameter name"),
                            value: z.string().describe("Parameter value"),
                        })
                    )
                    .optional()
                    .describe("Key-value parameters (alternative to data)"),
            },
        },
        async ({ integration, integrationId, methodName, data, dataSchema }) => {
            const channelId = (integration ?? integrationId)?.trim();
            if (!channelId) {
                throw new Error("integration or integrationId is required");
            }

            let payload: Record<string, unknown> = data ?? {};
            if (dataSchema?.length) {
                payload = dataSchema.reduce<Record<string, unknown>>((acc, entry) => {
                    acc[entry.key] = entry.value;
                    return acc;
                }, {});
            }

            const { organizationId } = getMcpContext();
            const result = await deps.integrationConnectionService.triggerIntegrationTool(
                organizationId,
                channelId,
                methodName,
                payload
            );
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                structuredContent: result,
            };
        }
    );
}
