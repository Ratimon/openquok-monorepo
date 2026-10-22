import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { assertMcpDirectoryLaunchEnabled } from "../assertMcpPlanCapability";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";
import type { DirectoryLaunchMcpDeps } from "./directoryMcpDeps";

export function registerDirectoryProfilesListTool(server: McpServer, deps: DirectoryLaunchMcpDeps): void {
    server.registerTool(
        "directoryProfilesList",
        {
            description:
                "List My Products business profiles for directory launch (not social integrations). Use mainOnly before directoryVariantsEnsure to resolve the main profile id. Optional filter by channel group id from groupList.",
            inputSchema: {
                integrationCustomerId: z
                    .string()
                    .optional()
                    .describe("Optional channel group id from groupList"),
                mainOnly: z
                    .boolean()
                    .optional()
                    .describe(
                        "When true, return only main profiles (exclude per-directory variants such as peerpush or uneed)"
                    ),
            },
        },
        async ({ integrationCustomerId, mainOnly }) => {
            await assertMcpDirectoryLaunchEnabled(deps.subscriptionGuard);
            const { organizationId } = getMcpContext();
            const customerId =
                typeof integrationCustomerId === "string" && integrationCustomerId.trim()
                    ? integrationCustomerId.trim()
                    : undefined;
            let data = await deps.autoLaunchService.listProfilesProgrammatic(organizationId, customerId);
            if (mainOnly) {
                data = data.filter((row) => !row.parentProfileId);
            }
            return mcpJsonResult({ success: true, data });
        }
    );
}
