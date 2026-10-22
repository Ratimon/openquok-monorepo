import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { assertMcpDirectoryLaunchEnabled } from "../assertMcpPlanCapability";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";
import type { DirectoryLaunchMcpDeps } from "./directoryMcpDeps";

export function registerDirectoryProfilesGetTool(server: McpServer, deps: DirectoryLaunchMcpDeps): void {
    server.registerTool(
        "directoryProfilesGet",
        {
            description:
                "Load one business profile by id: tagline, description, profileData, directorySiteKey, and similarityToMainPercent on variants. Use after directoryVariantsEnsure to inspect tailored copy.",
            inputSchema: {
                productProfileId: z
                    .string()
                    .describe("Main or directory-variant product profile id"),
            },
        },
        async ({ productProfileId }) => {
            await assertMcpDirectoryLaunchEnabled(deps.subscriptionGuard);
            const profileId = productProfileId?.trim();
            if (!profileId) {
                throw new Error("productProfileId is required");
            }
            const { organizationId } = getMcpContext();
            const data = await deps.autoLaunchService.getProfileProgrammatic(organizationId, profileId);
            if (!data) {
                throw new Error("Product profile not found");
            }
            return mcpJsonResult({ success: true, data });
        }
    );
}
