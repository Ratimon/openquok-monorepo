import { describe, expect, it } from "@jest/globals";

import { captureMcpToolHandler } from "./mcpToolTestUtils";
import { registerPostsMissingTool } from "./postsMissing";

describe("postsMissing MCP tool", () => {
    it("returns missing publish candidates", async () => {
        const getMissingPublishCandidatesProgrammatic = jest
            .fn()
            .mockResolvedValue([{ id: "rel-1", url: "https://example.com/p/1" }]);
        const run = captureMcpToolHandler("postsMissing", registerPostsMissingTool, {
            postsService: { getMissingPublishCandidatesProgrammatic },
        });

        const result = await run({ postId: "post-1" });

        expect(getMissingPublishCandidatesProgrammatic).toHaveBeenCalledWith({
            organizationId: "org-1",
            postId: "post-1",
        });
        expect(result.structuredContent).toEqual({
            success: true,
            data: { items: [{ id: "rel-1", url: "https://example.com/p/1" }] },
        });
    });

    it("requires postId", async () => {
        const run = captureMcpToolHandler("postsMissing", registerPostsMissingTool, {
            postsService: { getMissingPublishCandidatesProgrammatic: jest.fn() },
        });

        await expect(run({ postId: "" })).rejects.toThrow("postId is required");
    });
});
