import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { assertMcpDirectoryLaunchEnabled } from "../assertMcpPlanCapability";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";
import type { DirectoryLaunchMcpDeps } from "./directoryMcpDeps";

export function registerDirectorySubmissionsListTool(server: McpServer, deps: DirectoryLaunchMcpDeps): void {
    server.registerTool(
        "directorySubmissionsList",
        {
            description:
                "List recorded directory launch submissions for the workspace (read-only): listing URLs and completion state. Optional filters by productProfileId or destinationId.",
            inputSchema: {
                productProfileId: z.string().optional().describe("Filter by product profile id"),
                destinationId: z.string().optional().describe("Filter by destination id"),
            },
        },
        async ({ productProfileId, destinationId }) => {
            await assertMcpDirectoryLaunchEnabled(deps.subscriptionGuard);
            const { organizationId } = getMcpContext();
            const data = await deps.autoLaunchService.listSubmissionsProgrammatic(organizationId, {
                productProfileId:
                    typeof productProfileId === "string" && productProfileId.trim()
                        ? productProfileId.trim()
                        : undefined,
                destinationId:
                    typeof destinationId === "string" && destinationId.trim()
                        ? destinationId.trim()
                        : undefined,
            });
            return mcpJsonResult({ success: true, data });
        }
    );
}
