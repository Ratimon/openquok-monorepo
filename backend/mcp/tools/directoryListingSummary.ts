import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { assertMcpDirectoryLaunchEnabled } from "../assertMcpPlanCapability";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";
import type { DirectoryLaunchMcpDeps } from "./directoryMcpDeps";

export function registerDirectoryListingSummaryTool(server: McpServer, deps: DirectoryLaunchMcpDeps): void {
    server.registerTool(
        "directoryListingSummary",
        {
            description:
                "Read-only launch readiness per destination (PeerPush, Uneed, …): submission status and missing profile fields before extension autofill. Pass main or variant profile id; not social posting.",
            inputSchema: {
                productProfileId: z
                    .string()
                    .describe("Main or variant product profile id (often main after directoryVariantsEnsure)"),
            },
        },
        async ({ productProfileId }) => {
            await assertMcpDirectoryLaunchEnabled(deps.subscriptionGuard);
            const profileId = productProfileId?.trim();
            if (!profileId) {
                throw new Error("productProfileId is required");
            }
            const { organizationId } = getMcpContext();
            const data = await deps.autoLaunchService.getProfileListingSummaryForOrganization(
                organizationId,
                profileId
            );
            return mcpJsonResult({ success: true, data });
        }
    );
}
