import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { assertMcpDirectoryLaunchEnabled } from "../assertMcpPlanCapability";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";
import type { DirectoryLaunchMcpDeps } from "./directoryMcpDeps";

export function registerDirectoryProfilesCreateTool(server: McpServer, deps: DirectoryLaunchMcpDeps): void {
    server.registerTool(
        "directoryProfilesCreate",
        {
            description:
                "Create a new main business profile for directory launch (organization from the token). Does not create per-site variants — call directoryVariantsEnsure with directorySiteKey peerpush or uneed afterward.",
            inputSchema: {
                name: z.string().describe("Product display name"),
                integrationCustomerId: z
                    .string()
                    .optional()
                    .describe("Optional channel group id to link"),
                tagline: z.string().nullable().optional(),
                description: z.string().nullable().optional(),
                websiteUrl: z.string().nullable().optional(),
                logoUrl: z.string().nullable().optional(),
                profileData: z.record(z.unknown()).optional().describe("Structured business profile fields"),
            },
        },
        async (input) => {
            await assertMcpDirectoryLaunchEnabled(deps.subscriptionGuard);
            const name = input.name?.trim();
            if (!name) {
                throw new Error("name is required");
            }
            const { organizationId, publicUserId } = getMcpContext();
            const data = await deps.autoLaunchService.createProfileProgrammatic(publicUserId, {
                organizationId,
                integrationCustomerId: input.integrationCustomerId ?? null,
                name,
                tagline: input.tagline,
                description: input.description,
                websiteUrl: input.websiteUrl,
                logoUrl: input.logoUrl,
                profileData: input.profileData ?? {},
            });
            return mcpJsonResult({ success: true, data });
        }
    );
}
