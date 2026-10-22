import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { assertMcpDirectorySeoEnabled } from "../assertMcpPlanCapability";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";
import type { DirectorySeoMcpDeps } from "./directoryMcpDeps";

export function registerDirectorySeoCompetitorsUpdateTool(server: McpServer, deps: DirectorySeoMcpDeps): void {
    server.registerTool(
        "directorySeoCompetitorsUpdate",
        {
            description:
                "Update the display label for a competitor domain already tracked in directory SEO.",
            inputSchema: {
                domain: z.string().describe("Competitor domain"),
                label: z.string().nullable().describe("New label, or null to clear"),
            },
        },
        async ({ domain, label }) => {
            await assertMcpDirectorySeoEnabled(deps.subscriptionGuard);
            const normalizedDomain = domain?.trim();
            if (!normalizedDomain) {
                throw new Error("domain is required");
            }
            const { organizationId, publicUserId } = getMcpContext();
            const data = await deps.directorySeoWorkspaceService.updateCompetitor(publicUserId, {
                organizationId,
                domain: normalizedDomain,
                label,
            });
            return mcpJsonResult({ success: true, data, message: "Competitor updated" });
        }
    );
}
