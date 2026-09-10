import { describe, expect, it } from "@jest/globals";

import { captureMcpToolHandler } from "./mcpToolTestUtils";
import { registerPostsDeleteTool } from "./postsDelete";

describe("postsDelete MCP tool", () => {
    it("deletes a post row", async () => {
        const deletePostByIdProgrammatic = jest.fn().mockResolvedValue({ id: "post-1", postGroup: "grp-1" });
        const run = captureMcpToolHandler("postsDelete", registerPostsDeleteTool, {
            postsService: { deletePostByIdProgrammatic },
        });

        const result = await run({ postId: "post-1" });

        expect(deletePostByIdProgrammatic).toHaveBeenCalledWith("post-1", "org-1");
        expect(result.structuredContent).toEqual({
            success: true,
            data: { id: "post-1", postGroup: "grp-1" },
        });
    });

    it("requires postId", async () => {
        const run = captureMcpToolHandler("postsDelete", registerPostsDeleteTool, {
            postsService: { deletePostByIdProgrammatic: jest.fn() },
        });

        await expect(run({ postId: "" })).rejects.toThrow("postId is required");
    });
});
