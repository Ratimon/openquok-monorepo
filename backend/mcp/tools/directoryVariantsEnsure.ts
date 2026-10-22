import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { assertMcpDirectoryLaunchEnabled } from "../assertMcpPlanCapability";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";
import type { DirectoryLaunchMcpDeps } from "./directoryMcpDeps";

export function registerDirectoryVariantsEnsureTool(server: McpServer, deps: DirectoryLaunchMcpDeps): void {
    server.registerTool(
        "directoryVariantsEnsure",
        {
            description:
                "Create or return a per-directory copy of a main business profile (idempotent). Use when the user wants a PeerPush- or Uneed-specific profile: directoryProfilesList with mainOnly, then this tool with directorySiteKey peerpush or uneed. Copies main on first create; does not submit on the directory site.",
            inputSchema: {
                mainProductProfileId: z
                    .string()
                    .describe("Main profile id from directoryProfilesList (mainOnly true); not a variant id"),
                directorySiteKey: z
                    .string()
                    .describe("Directory site key: peerpush, uneed, or other kebab-case catalog slug"),
                name: z.string().optional().describe("Optional variant display name override"),
            },
        },
        async ({ mainProductProfileId, directorySiteKey, name }) => {
            await assertMcpDirectoryLaunchEnabled(deps.subscriptionGuard);
            const mainId = mainProductProfileId?.trim();
            const siteKey = directorySiteKey?.trim();
            if (!mainId) {
                throw new Error("mainProductProfileId is required");
            }
            if (!siteKey) {
                throw new Error("directorySiteKey is required");
            }
            const { organizationId, publicUserId } = getMcpContext();
            const result = await deps.autoLaunchService.ensureDirectoryVariantProgrammatic(
                organizationId,
                publicUserId,
                mainId,
                { directorySiteKey: siteKey, name }
            );
            return mcpJsonResult({ success: true, data: result.profile, created: result.created });
        }
    );
}
