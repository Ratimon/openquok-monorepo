import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PostsService } from "../../services/PostsService";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";

export function registerPostsConnectTool(server: McpServer, deps: { postsService: PostsService }): void {
    server.registerTool(
        "postsConnect",
        {
            description: "Link a post row to a provider release_id for per-post analytics.",
            inputSchema: {
                postId: z.string().describe("Post row id"),
                releaseId: z.string().describe("Provider release id from postsMissing candidates"),
            },
        },
        async ({ postId, releaseId }) => {
            const id = postId?.trim();
            const release = releaseId?.trim();
            if (!id) {
                throw new Error("postId is required");
            }
            if (!release) {
                throw new Error("releaseId is required");
            }

            const { organizationId } = getMcpContext();
            const data = await deps.postsService.updatePostReleaseIdProgrammatic({
                organizationId,
                postId: id,
                releaseId: release,
            });
            return mcpJsonResult({ success: true, data });
        }
    );
}
