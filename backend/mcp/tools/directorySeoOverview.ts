import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { assertMcpDirectorySeoEnabled } from "../assertMcpPlanCapability";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";
import type { DirectorySeoMcpDeps } from "./directoryMcpDeps";

export function registerDirectorySeoOverviewTool(server: McpServer, deps: DirectorySeoMcpDeps): void {
    server.registerTool(
        "directorySeoOverview",
        {
            description:
                "Cached directory SEO overview for a main business profile (domain rating, competitors). Read checkedAt on each metric and manualRefreshAvailableAt before directorySeoRefresh.",
            inputSchema: {
                productProfileId: z.string().describe("Main product profile id"),
            },
        },
        async ({ productProfileId }) => {
            await assertMcpDirectorySeoEnabled(deps.subscriptionGuard);
            const profileId = productProfileId?.trim();
            if (!profileId) {
                throw new Error("productProfileId is required");
            }
            const { organizationId, publicUserId } = getMcpContext();
            const data = await deps.directorySeoWorkspaceService.getWorkspaceOverview(
                publicUserId,
                organizationId,
                profileId
            );
            return mcpJsonResult({ success: true, data });
        }
    );
}
