import { describe, expect, it } from "@jest/globals";

import { captureMcpToolHandler } from "./mcpToolTestUtils";
import { registerPostsConnectTool } from "./postsConnect";

describe("postsConnect MCP tool", () => {
    it("links release id", async () => {
        const updatePostReleaseIdProgrammatic = jest
            .fn()
            .mockResolvedValue({ id: "post-1", releaseId: "rel-1" });
        const run = captureMcpToolHandler("postsConnect", registerPostsConnectTool, {
            postsService: { updatePostReleaseIdProgrammatic },
        });

        const result = await run({ postId: "post-1", releaseId: "rel-1" });

        expect(updatePostReleaseIdProgrammatic).toHaveBeenCalledWith({
            organizationId: "org-1",
            postId: "post-1",
            releaseId: "rel-1",
        });
        expect(result.structuredContent).toEqual({
            success: true,
            data: { id: "post-1", releaseId: "rel-1" },
        });
    });

    it("requires releaseId", async () => {
        const run = captureMcpToolHandler("postsConnect", registerPostsConnectTool, {
            postsService: { updatePostReleaseIdProgrammatic: jest.fn() },
        });

        await expect(run({ postId: "post-1", releaseId: " " })).rejects.toThrow("releaseId is required");
    });
});
