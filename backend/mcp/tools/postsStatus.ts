import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PostsService } from "../../services/PostsService";
import { PostDTOMapper } from "../../utils/dtos/PostDTO";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";

export function registerPostsStatusTool(server: McpServer, deps: { postsService: PostsService }): void {
    server.registerTool(
        "postsStatus",
        {
            description: "Flip a post row between draft and scheduled at the stored publish time.",
            inputSchema: {
                postId: z.string().describe("Post row id from postsList or schedulePostTool"),
                status: z
                    .enum(["draft", "schedule", "scheduled"])
                    .describe("draft | schedule | scheduled (schedule and scheduled both mean scheduled)"),
            },
        },
        async ({ postId, status }) => {
            const id = postId?.trim();
            if (!id) {
                throw new Error("postId is required");
            }

            const { organizationId, publicUserId } = getMcpContext();
            const normalizedStatus: "draft" | "scheduled" = status === "draft" ? "draft" : "scheduled";
            const result = await deps.postsService.flipPostGroupStatusByPostIdProgrammatic(
                id,
                organizationId,
                normalizedStatus,
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
