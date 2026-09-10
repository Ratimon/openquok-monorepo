import { describe, expect, it } from "@jest/globals";

import { captureMcpToolHandler } from "./mcpToolTestUtils";
import { registerPostsStatusTool } from "./postsStatus";

describe("postsStatus MCP tool", () => {
    it("flips status to scheduled", async () => {
        const flipPostGroupStatusByPostIdProgrammatic = jest.fn().mockResolvedValue({
            postGroup: "grp-1",
            posts: [{ id: "post-1" }],
        });
        const run = captureMcpToolHandler("postsStatus", registerPostsStatusTool, {
            postsService: { flipPostGroupStatusByPostIdProgrammatic },
        });

        const result = await run({ postId: "post-1", status: "schedule" });

        expect(flipPostGroupStatusByPostIdProgrammatic).toHaveBeenCalledWith(
            "post-1",
            "org-1",
            "scheduled",
            "user-1"
        );
        expect(result.structuredContent).toEqual({
            success: true,
            data: { postGroup: "grp-1", posts: expect.any(Array) },
        });
    });

    it("requires postId", async () => {
        const run = captureMcpToolHandler("postsStatus", registerPostsStatusTool, {
            postsService: { flipPostGroupStatusByPostIdProgrammatic: jest.fn() },
        });

        await expect(run({ postId: "  ", status: "draft" })).rejects.toThrow("postId is required");
    });
});
