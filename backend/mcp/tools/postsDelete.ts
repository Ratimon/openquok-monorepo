import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PostsService } from "../../services/PostsService";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";

export function registerPostsDeleteTool(server: McpServer, deps: { postsService: PostsService }): void {
    server.registerTool(
        "postsDelete",
        {
            description: "Delete a post row by id.",
            inputSchema: {
                postId: z.string().describe("Post row id to delete"),
            },
        },
        async ({ postId }) => {
            const id = postId?.trim();
            if (!id) {
                throw new Error("postId is required");
            }

            const { organizationId } = getMcpContext();
            const result = await deps.postsService.deletePostByIdProgrammatic(id, organizationId);
            return mcpJsonResult({ success: true, data: result });
        }
    );
}
