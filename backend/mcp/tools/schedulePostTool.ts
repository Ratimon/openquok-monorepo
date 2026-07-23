import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { IntegrationConnectionService } from "../../services/IntegrationConnectionService";
import type { PostsService } from "../../services/PostsService";
import type { ProgrammaticMediaUploadDeps } from "../media/uploadProgrammaticMediaFromUrl";
import { uploadProgrammaticMediaFromUrl } from "../media/uploadProgrammaticMediaFromUrl";
import { getMcpContext } from "../context";
import {
    formatSchedulePostToolOutput,
    mapSchedulePostToolInput,
    type SchedulePostToolInput,
} from "./schedulePostTool.adapter";

const socialPostSchema = z.object({
    integration: z.string(),
    postsAndComments: z.array(z.string()).optional(),
    settings: z.record(z.unknown()).optional(),
    attachments: z.array(z.string()).optional(),
});

export function registerSchedulePostTool(
    server: McpServer,
    deps: {
        integrationConnectionService: IntegrationConnectionService;
        postsService: PostsService;
        mediaUploadDeps: ProgrammaticMediaUploadDeps;
    }
): void {
    server.registerTool(
        "schedulePostTool",
        {
            description:
                "Create or schedule social posts across connected channels. Supports draft, schedule, and publish-now modes.",
            inputSchema: {
                type: z.enum(["draft", "schedule", "now"]).describe("draft | schedule | now"),
                date: z.string().optional().describe("ISO-8601 time when type is schedule"),
                socialPost: z
                    .array(socialPostSchema)
                    .min(1)
                    .describe("Per-channel post payloads"),
            },
        },
        async (input) => {
            const { organizationId, publicUserId } = getMcpContext();
            const scheduleInput = input as SchedulePostToolInput;

            const integrations = await deps.integrationConnectionService.publicListIntegrations(organizationId);
            const integrationProviderById: Record<string, string> = {};
            for (const row of integrations) {
                integrationProviderById[row.id] = row.identifier;
            }

            const mediaByIntegrationId: Record<string, { id: string; path: string }[]> = {};
            for (const entry of scheduleInput.socialPost) {
                const integrationId = String(entry.integration ?? "").trim();
                const urls = entry.attachments ?? [];
                if (urls.length === 0) continue;
                const uploaded: { id: string; path: string }[] = [];
                for (const url of urls) {
                    const saved = await uploadProgrammaticMediaFromUrl(organizationId, url, deps.mediaUploadDeps);
                    uploaded.push(saved);
                }
                mediaByIntegrationId[integrationId] = uploaded;
            }

            const mapped = mapSchedulePostToolInput({
                input: scheduleInput,
                integrationProviderById,
                mediaByIntegrationId,
            });

            const result = await deps.postsService.createPostProgrammatic({
                organizationId,
                ...mapped.createInput,
                publicUserId,
            });

            const output = formatSchedulePostToolOutput(result.posts, mapped.integrationIdentifiers);
            return {
                content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
                structuredContent: output,
            };
        }
    );
}
