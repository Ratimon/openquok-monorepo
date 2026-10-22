import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { assertMcpDirectoryLaunchEnabled } from "../assertMcpPlanCapability";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";
import type { DirectoryLaunchMcpDeps } from "./directoryMcpDeps";

export function registerDirectoryProfilesUpdateTool(server: McpServer, deps: DirectoryLaunchMcpDeps): void {
    server.registerTool(
        "directoryProfilesUpdate",
        {
            description:
                "Patch copy on a main or directory-variant profile (tagline, description, websiteUrl, logoUrl, profileData). Use when the user asks to fill or update tailored fields for PeerPush, Uneed, etc. Not schedulePostTool.",
            inputSchema: {
                productProfileId: z
                    .string()
                    .describe("Main or variant profile id (variant id from directoryVariantsEnsure)"),
                name: z.string().optional(),
                tagline: z.string().nullable().optional(),
                description: z.string().nullable().optional(),
                websiteUrl: z.string().nullable().optional(),
                logoUrl: z.string().nullable().optional(),
                integrationCustomerId: z.string().nullable().optional(),
                profileData: z.record(z.unknown()).optional(),
            },
        },
        async (input) => {
            await assertMcpDirectoryLaunchEnabled(deps.subscriptionGuard);
            const profileId = input.productProfileId?.trim();
            if (!profileId) {
                throw new Error("productProfileId is required");
            }
            const { organizationId } = getMcpContext();
            const data = await deps.autoLaunchService.updateProfileProgrammatic(organizationId, profileId, {
                name: input.name,
                tagline: input.tagline,
                description: input.description,
                websiteUrl: input.websiteUrl,
                logoUrl: input.logoUrl,
                integrationCustomerId: input.integrationCustomerId,
                profileData: input.profileData,
            });
            return mcpJsonResult({ success: true, data });
        }
    );
}
