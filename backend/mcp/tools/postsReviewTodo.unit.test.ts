import { describe, expect, it } from "@jest/globals";

import { captureMcpToolHandler } from "./mcpToolTestUtils";
import { registerPostsReviewTodoTool } from "./postsReviewTodo";

describe("postsReviewTodo MCP tool", () => {
    it("updates review fields as an agent", async () => {
        const updatePostReviewTodoProgrammatic = jest.fn().mockResolvedValue([{ id: "post-1" }]);
        const run = captureMcpToolHandler("postsReviewTodo", registerPostsReviewTodoTool, {
            postsService: { updatePostReviewTodoProgrammatic },
        });

        const result = await run({ postId: "post-1", note: "Check CTA", isReviewed: false });

        expect(updatePostReviewTodoProgrammatic).toHaveBeenCalledWith({
            organizationId: "org-1",
            postId: "post-1",
            note: "Check CTA",
            isReviewed: false,
            isAgent: true,
            kanbanManualFinishAcknowledged: undefined,
        });
        expect(result.structuredContent).toEqual({
            success: true,
            data: { posts: expect.any(Array) },
        });
    });

    it("requires postId", async () => {
        const run = captureMcpToolHandler("postsReviewTodo", registerPostsReviewTodoTool, {
            postsService: { updatePostReviewTodoProgrammatic: jest.fn() },
        });

        await expect(run({ postId: " " })).rejects.toThrow("postId is required");
    });
});
