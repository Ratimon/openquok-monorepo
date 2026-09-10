import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PostsService } from "../../services/PostsService";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";

export function registerPostsFindSlotTool(server: McpServer, deps: { postsService: PostsService }): void {
    server.registerTool(
        "postsFindSlot",
        {
            description:
                "Suggest a free schedule slot for the workspace or a specific connected channel.",
            inputSchema: {
                integrationId: z
                    .string()
                    .optional()
                    .describe("Connected channel id from integrationList; omit to consider all channels"),
            },
        },
        async ({ integrationId }) => {
            const { organizationId } = getMcpContext();
            const channelId =
                typeof integrationId === "string" && integrationId.trim() ? integrationId.trim() : null;
            const date = await deps.postsService.findFreeSlotProgrammatic(organizationId, channelId);
            return mcpJsonResult({ success: true, data: { date } });
        }
    );
}
