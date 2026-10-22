import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { assertMcpDirectorySeoEnabled } from "../assertMcpPlanCapability";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";
import type { DirectorySeoMcpDeps } from "./directoryMcpDeps";

export function registerDirectorySeoCompetitorsAddTool(server: McpServer, deps: DirectorySeoMcpDeps): void {
    server.registerTool(
        "directorySeoCompetitorsAdd",
        {
            description:
                "Add a competitor domain to directory SEO tracking for the workspace (plan competitor quota applies). Pair with directorySeoOverview and directorySeoHistory.",
            inputSchema: {
                domain: z.string().describe("Competitor domain, e.g. example.com"),
                label: z.string().nullable().optional().describe("Optional display label"),
                sortOrder: z.number().int().optional().describe("Optional sort order"),
            },
        },
        async ({ domain, label, sortOrder }) => {
            await assertMcpDirectorySeoEnabled(deps.subscriptionGuard);
            const normalizedDomain = domain?.trim();
            if (!normalizedDomain) {
                throw new Error("domain is required");
            }
            const { organizationId, publicUserId } = getMcpContext();
            const data = await deps.directorySeoWorkspaceService.addCompetitor(publicUserId, {
                organizationId,
                domain: normalizedDomain,
                label,
                sortOrder,
            });
            return mcpJsonResult({ success: true, data, message: "Competitor added" });
        }
    );
}
