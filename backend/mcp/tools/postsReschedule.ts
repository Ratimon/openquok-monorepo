import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PostsService } from "../../services/PostsService";
import { PostDTOMapper } from "../../utils/dtos/PostDTO";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";

export function registerPostsRescheduleTool(server: McpServer, deps: { postsService: PostsService }): void {
    server.registerTool(
        "postsReschedule",
        {
            description:
                "Move a post group to a new publish time. action update preserves state; schedule re-queues and clears publish results.",
            inputSchema: {
                postId: z.string().describe("Post row id from postsList or schedulePostTool"),
                scheduledAt: z.string().describe("New publish time (ISO-8601)"),
                action: z
                    .enum(["update", "schedule"])
                    .optional()
                    .describe("update (default) moves time only; schedule re-queues publishing"),
                republish: z
                    .boolean()
                    .optional()
                    .describe("Required true when action is schedule and the group has published rows"),
            },
        },
        async ({ postId, scheduledAt, action, republish }) => {
            const id = postId?.trim();
            if (!id) {
                throw new Error("postId is required");
            }
            const at = scheduledAt?.trim();
            if (!at) {
                throw new Error("scheduledAt is required");
            }

            const { organizationId, publicUserId } = getMcpContext();
            const result = await deps.postsService.reschedulePostGroupByPostIdProgrammatic(
                id,
                organizationId,
                at,
                action ?? "update",
                republish,
                publicUserId
            );

            return mcpJsonResult({
                success: true,
                data: {
                    postGroup: result.postGroup,
                    posts: PostDTOMapper.toDTOCollection(result.posts),
                },
            });
        }
    );
}
