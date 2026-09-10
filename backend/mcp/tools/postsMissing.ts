import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PostsService } from "../../services/PostsService";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";

export function registerPostsMissingTool(server: McpServer, deps: { postsService: PostsService }): void {
    server.registerTool(
        "postsMissing",
        {
            description:
                "List provider candidates when a published post is missing release_id (needed before per-post analytics).",
            inputSchema: {
                postId: z.string().describe("Post row id with release_id missing"),
            },
        },
        async ({ postId }) => {
            const id = postId?.trim();
            if (!id) {
                throw new Error("postId is required");
            }

            const { organizationId } = getMcpContext();
            const items = await deps.postsService.getMissingPublishCandidatesProgrammatic({
                organizationId,
                postId: id,
            });
            return mcpJsonResult({ success: true, data: { items } });
        }
    );
}
