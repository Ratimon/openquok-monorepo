import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { IntegrationManager } from "../../integrations/integrationManager";

export function registerIntegrationSchemaTool(
    server: McpServer,
    deps: { integrationManager: IntegrationManager }
): void {
    server.registerTool(
        "integrationSchema",
        {
            description:
                "Return posting rules, character limits, compose settings schema, and allow-listed tools for a platform (provider identifier, e.g. threads, facebook).",
            inputSchema: {
                platform: z.string().describe("Social provider identifier (e.g. threads, facebook, x)"),
            },
        },
        async ({ platform }) => {
            const identifier = platform.trim().toLowerCase();
            const provider = deps.integrationManager.getSocialIntegration(identifier);
            if (!provider) {
                throw new Error(`Unknown platform: ${platform}`);
            }

            const output = {
                rules: deps.integrationManager.getAllRulesDescription()[identifier] ?? "",
                maxLength: provider.maxLength(false),
                settings: provider.settingsSchema ? provider.settingsSchema() : "No additional settings required",
                tools: deps.integrationManager.getAllTools()[identifier] ?? [],
            };

            return {
                content: [{ type: "text", text: JSON.stringify({ output }, null, 2) }],
                structuredContent: { output },
            };
        }
    );
}
