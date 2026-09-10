import { describe, expect, it } from "@jest/globals";

import { captureMcpToolHandler } from "./mcpToolTestUtils";
import { registerAnalyticsPlatformTool } from "./analyticsPlatform";

describe("analyticsPlatform MCP tool", () => {
    it("returns platform analytics", async () => {
        const getIntegrationAnalyticsProgrammatic = jest.fn().mockResolvedValue([{ label: "Views", value: 10 }]);
        const run = captureMcpToolHandler("analyticsPlatform", registerAnalyticsPlatformTool, {
            analyticsService: { getIntegrationAnalyticsProgrammatic },
        });

        const result = await run({ integrationId: "int-1", days: 30 });

        expect(getIntegrationAnalyticsProgrammatic).toHaveBeenCalledWith({
            organizationId: "org-1",
            integrationId: "int-1",
            date: 30,
        });
        expect(result.structuredContent).toEqual({
            success: true,
            data: [{ label: "Views", value: 10 }],
        });
    });

    it("requires integrationId", async () => {
        const run = captureMcpToolHandler("analyticsPlatform", registerAnalyticsPlatformTool, {
            analyticsService: { getIntegrationAnalyticsProgrammatic: jest.fn() },
        });

        await expect(run({ integrationId: "", days: 7 })).rejects.toThrow("integrationId is required");
    });
});
