import { describe, expect, it } from "@jest/globals";

import { captureMcpToolHandler } from "./mcpToolTestUtils";
import { registerPostsFindSlotTool } from "./postsFindSlot";

describe("postsFindSlot MCP tool", () => {
    it("returns a suggested slot for a channel", async () => {
        const findFreeSlotProgrammatic = jest.fn().mockResolvedValue("2026-03-01T12:00:00.000Z");
        const run = captureMcpToolHandler("postsFindSlot", registerPostsFindSlotTool, {
            postsService: { findFreeSlotProgrammatic },
        });

        const result = await run({ integrationId: "int-1" });

        expect(findFreeSlotProgrammatic).toHaveBeenCalledWith("org-1", "int-1");
        expect(result.structuredContent).toEqual({
            success: true,
            data: { date: "2026-03-01T12:00:00.000Z" },
        });
    });
});
