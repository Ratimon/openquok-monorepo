import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PostsService } from "../../services/PostsService";
import { PostDTOMapper } from "../../utils/dtos/PostDTO";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";

function localCalendarDaysFromNowIso(dayDelta: number): string {
    const d = new Date();
    d.setDate(d.getDate() + dayDelta);
    return d.toISOString();
}

export function registerPostsListTool(server: McpServer, deps: { postsService: PostsService }): void {
    server.registerTool(
        "postsList",
        {
            description:
                "List posts in a date window for the workspace (optional integration ids or channel group). Default window matches the public list API.",
            inputSchema: {
                start: z
                    .string()
                    .optional()
                    .describe("Start ISO timestamp. Default: 30 local calendar days before today."),
                end: z
                    .string()
                    .optional()
                    .describe("End ISO timestamp. Default: 30 local calendar days after today."),
                integrationIds: z
                    .array(z.string())
                    .optional()
                    .describe("Optional connected channel ids to filter by"),
                customerGroupId: z
                    .string()
                    .optional()
                    .describe("Optional channel group id from groupList"),
            },
        },
        async ({ start, end, integrationIds, customerGroupId }) => {
            const { organizationId } = getMcpContext();
            const startIso =
                typeof start === "string" && start.trim() ? start.trim() : localCalendarDaysFromNowIso(-30);
            const endIso = typeof end === "string" && end.trim() ? end.trim() : localCalendarDaysFromNowIso(30);
            const integrationIdsNorm =
                integrationIds?.map((id) => id.trim()).filter(Boolean).length
                    ? integrationIds.map((id) => id.trim()).filter(Boolean)
                    : null;
            const groupId =
                typeof customerGroupId === "string" && customerGroupId.trim()
                    ? customerGroupId.trim()
                    : undefined;

            const rows = await deps.postsService.listPostsForCalendarProgrammatic({
                organizationId,
                startIso,
                endIso,
                integrationIds: integrationIdsNorm,
                customerGroupId: groupId,
            });

            return mcpJsonResult({
                success: true,
                data: { posts: PostDTOMapper.toDTOCollection(rows) },
            });
        }
    );
}
