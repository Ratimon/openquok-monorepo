import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PostsService } from "../../services/PostsService";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";

const daysSchema = z.union([z.literal(7), z.literal(30), z.literal(90)]);

export function registerAnalyticsPostTool(server: McpServer, deps: { postsService: PostsService }): void {
    server.registerTool(
        "analyticsPost",
        {
            description:
                "Per-post metrics for a published post row. days must be 7, 30, or 90. Empty for drafts.",
            inputSchema: {
                postId: z.string().describe("Published post row id"),
                days: daysSchema.describe("Lookback window in days: 7, 30, or 90"),
            },
        },
        async ({ postId, days }) => {
            const id = postId?.trim();
            if (!id) {
                throw new Error("postId is required");
            }

            const { organizationId } = getMcpContext();
            const data = await deps.postsService.checkPostAnalyticsProgrammatic({
                organizationId,
                postId: id,
                dateWindowDays: days,
            });
            return mcpJsonResult({ success: true, data });
        }
    );
}
