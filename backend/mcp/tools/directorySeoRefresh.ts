import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { assertMcpDirectorySeoEnabled } from "../assertMcpPlanCapability";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";
import type { DirectorySeoMcpDeps } from "./directoryMcpDeps";

export function registerDirectorySeoRefreshTool(server: McpServer, deps: DirectorySeoMcpDeps): void {
    server.registerTool(
        "directorySeoRefresh",
        {
            description:
                "Manually refresh cached directory SEO metrics for a main product profile. Check manualRefreshAvailableAt from directorySeoOverview before calling; set force only when the plan allows bypass.",
            inputSchema: {
                productProfileId: z.string().describe("Main product profile id"),
                force: z
                    .boolean()
                    .optional()
                    .describe("Bypass cooldown when the plan allows (default false)"),
            },
        },
        async ({ productProfileId, force }) => {
            await assertMcpDirectorySeoEnabled(deps.subscriptionGuard);
            const profileId = productProfileId?.trim();
            if (!profileId) {
                throw new Error("productProfileId is required");
            }
            const { organizationId, publicUserId } = getMcpContext();
            const data = await deps.directorySeoWorkspaceService.refreshWorkspace(publicUserId, {
                organizationId,
                productProfileId: profileId,
                force: force ?? false,
            });
            return mcpJsonResult({ success: true, data });
        }
    );
}
