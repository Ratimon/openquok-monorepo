import { describe, expect, it } from "@jest/globals";

import { captureMcpToolHandler } from "./mcpToolTestUtils";
import { registerPostsRescheduleTool } from "./postsReschedule";

describe("postsReschedule MCP tool", () => {
    it("reschedules with schedule action and republish", async () => {
        const reschedulePostGroupByPostIdProgrammatic = jest.fn().mockResolvedValue({
            postGroup: "grp-1",
            posts: [{ id: "post-1" }],
        });
        const run = captureMcpToolHandler("postsReschedule", registerPostsRescheduleTool, {
            postsService: { reschedulePostGroupByPostIdProgrammatic },
        });

        const result = await run({
            postId: "post-1",
            scheduledAt: "2026-06-15T14:30:00.000Z",
            action: "schedule",
            republish: true,
        });

        expect(reschedulePostGroupByPostIdProgrammatic).toHaveBeenCalledWith(
            "post-1",
            "org-1",
            "2026-06-15T14:30:00.000Z",
            "schedule",
            true,
            "user-1"
        );
        expect(result.structuredContent).toEqual({
            success: true,
            data: { postGroup: "grp-1", posts: expect.any(Array) },
        });
    });

    it("defaults action to update", async () => {
        const reschedulePostGroupByPostIdProgrammatic = jest.fn().mockResolvedValue({
            postGroup: "grp-1",
            posts: [{ id: "post-1" }],
        });
        const run = captureMcpToolHandler("postsReschedule", registerPostsRescheduleTool, {
            postsService: { reschedulePostGroupByPostIdProgrammatic },
        });

        await run({ postId: "post-1", scheduledAt: "2026-06-15T14:30:00.000Z" });

        expect(reschedulePostGroupByPostIdProgrammatic).toHaveBeenCalledWith(
            "post-1",
            "org-1",
            "2026-06-15T14:30:00.000Z",
            "update",
            undefined,
            "user-1"
        );
    });

    it("requires postId and scheduledAt", async () => {
        const run = captureMcpToolHandler("postsReschedule", registerPostsRescheduleTool, {
            postsService: { reschedulePostGroupByPostIdProgrammatic: jest.fn() },
        });

        await expect(run({ postId: "  ", scheduledAt: "2026-06-15T14:30:00.000Z" })).rejects.toThrow(
            "postId is required"
        );
        await expect(run({ postId: "post-1", scheduledAt: "  " })).rejects.toThrow("scheduledAt is required");
    });
});
