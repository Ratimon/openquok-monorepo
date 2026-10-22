import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { assertMcpDirectorySeoEnabled } from "../assertMcpPlanCapability";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";
import type { DirectorySeoMcpDeps } from "./directoryMcpDeps";

export function registerDirectorySeoCompetitorsRemoveTool(server: McpServer, deps: DirectorySeoMcpDeps): void {
    server.registerTool(
        "directorySeoCompetitorsRemove",
        {
            description:
                "Stop tracking a competitor domain in directory SEO for the workspace. Does not delete product profiles.",
            inputSchema: {
                domain: z.string().describe("Competitor domain to remove"),
            },
        },
        async ({ domain }) => {
            await assertMcpDirectorySeoEnabled(deps.subscriptionGuard);
            const normalizedDomain = domain?.trim();
            if (!normalizedDomain) {
                throw new Error("domain is required");
            }
            const { organizationId, publicUserId } = getMcpContext();
            await deps.directorySeoWorkspaceService.deleteCompetitor(publicUserId, {
                organizationId,
                domain: normalizedDomain,
            });
            return mcpJsonResult({ success: true, message: "Competitor removed" });
        }
    );
}
