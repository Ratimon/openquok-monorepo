import { describe, expect, it } from "@jest/globals";

import { captureMcpToolHandler } from "./mcpToolTestUtils";
import { registerAnalyticsPostTool } from "./analyticsPost";

describe("analyticsPost MCP tool", () => {
    it("returns post analytics", async () => {
        const checkPostAnalyticsProgrammatic = jest.fn().mockResolvedValue([{ label: "Likes", value: 3 }]);
        const run = captureMcpToolHandler("analyticsPost", registerAnalyticsPostTool, {
            postsService: { checkPostAnalyticsProgrammatic },
        });

        const result = await run({ postId: "post-1", days: 7 });

        expect(checkPostAnalyticsProgrammatic).toHaveBeenCalledWith({
            organizationId: "org-1",
            postId: "post-1",
            dateWindowDays: 7,
        });
        expect(result.structuredContent).toEqual({
            success: true,
            data: [{ label: "Likes", value: 3 }],
        });
    });

    it("requires postId", async () => {
        const run = captureMcpToolHandler("analyticsPost", registerAnalyticsPostTool, {
            postsService: { checkPostAnalyticsProgrammatic: jest.fn() },
        });

        await expect(run({ postId: "", days: 90 })).rejects.toThrow("postId is required");
    });
});
