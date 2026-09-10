import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PostsService } from "../../services/PostsService";
import { PostDTOMapper } from "../../utils/dtos/PostDTO";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";

export function registerPostsReviewTodoTool(server: McpServer, deps: { postsService: PostsService }): void {
    server.registerTool(
        "postsReviewTodo",
        {
            description: "Set or update the review-todo note on a post row.",
            inputSchema: {
                postId: z.string().describe("Post row id"),
                note: z.string().nullable().optional().describe("Kanban review note"),
                isReviewed: z.boolean().optional().describe("Mark the review todo as complete"),
                kanbanManualFinishAcknowledged: z
                    .boolean()
                    .optional()
                    .describe("Acknowledge manual kanban finish for the post group"),
            },
        },
        async ({ postId, note, isReviewed, kanbanManualFinishAcknowledged }) => {
            const id = postId?.trim();
            if (!id) {
                throw new Error("postId is required");
            }

            const { organizationId } = getMcpContext();
            const rows = await deps.postsService.updatePostReviewTodoProgrammatic({
                organizationId,
                postId: id,
                note,
                isReviewed,
                isAgent: true,
                kanbanManualFinishAcknowledged,
            });

            return mcpJsonResult({
                success: true,
                data: { posts: PostDTOMapper.toDTOCollection(rows) },
            });
        }
    );
}
