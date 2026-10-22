import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { assertMcpDirectorySeoEnabled } from "../assertMcpPlanCapability";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";
import type { DirectorySeoMcpDeps } from "./directoryMcpDeps";

export function registerDirectorySeoHistoryTool(server: McpServer, deps: DirectorySeoMcpDeps): void {
    server.registerTool(
        "directorySeoHistory",
        {
            description:
                "Historical cached directory SEO rating points for the main product domain and tracked competitors. days defaults to 90 (max 366). Use after directorySeoOverview.",
            inputSchema: {
                productProfileId: z.string().describe("Main product profile id"),
                days: z
                    .number()
                    .int()
                    .min(1)
                    .max(366)
                    .optional()
                    .describe("Lookback window in days (default 90)"),
            },
        },
        async ({ productProfileId, days }) => {
            await assertMcpDirectorySeoEnabled(deps.subscriptionGuard);
            const profileId = productProfileId?.trim();
            if (!profileId) {
                throw new Error("productProfileId is required");
            }
            const windowDays = days ?? 90;
            const { organizationId, publicUserId } = getMcpContext();
            const data = await deps.directorySeoWorkspaceService.getWorkspaceHistory(
                publicUserId,
                organizationId,
                profileId,
                windowDays
            );
            return mcpJsonResult({ success: true, data });
        }
    );
}
