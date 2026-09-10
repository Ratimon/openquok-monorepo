import { describe, expect, it } from "@jest/globals";

import { captureMcpToolHandler } from "./mcpToolTestUtils";
import { registerPostsListTool } from "./postsList";

describe("postsList MCP tool", () => {
    it("lists posts with explicit date window and filters", async () => {
        const listPostsForCalendarProgrammatic = jest.fn().mockResolvedValue([{ id: "post-1" }]);
        const run = captureMcpToolHandler("postsList", registerPostsListTool, {
            postsService: { listPostsForCalendarProgrammatic },
        });

        const result = await run({
            start: "2026-01-01T00:00:00.000Z",
            end: "2026-02-01T00:00:00.000Z",
            integrationIds: ["int-1"],
            customerGroupId: "grp-1",
        });

        expect(listPostsForCalendarProgrammatic).toHaveBeenCalledWith({
            organizationId: "org-1",
            startIso: "2026-01-01T00:00:00.000Z",
            endIso: "2026-02-01T00:00:00.000Z",
            integrationIds: ["int-1"],
            customerGroupId: "grp-1",
        });
        expect(result.structuredContent).toEqual({
            success: true,
            data: { posts: expect.any(Array) },
        });
    });

    it("applies default ±30 day window when start and end are omitted", async () => {
        const listPostsForCalendarProgrammatic = jest.fn().mockResolvedValue([]);
        const run = captureMcpToolHandler("postsList", registerPostsListTool, {
            postsService: { listPostsForCalendarProgrammatic },
        });

        await run({});

        const call = listPostsForCalendarProgrammatic.mock.calls[0]![0] as {
            startIso: string;
            endIso: string;
        };
        const start = new Date(call.startIso);
        const end = new Date(call.endIso);
        const dayMs = 24 * 60 * 60 * 1000;
        expect(Math.round((end.getTime() - start.getTime()) / dayMs)).toBe(60);
    });
});
