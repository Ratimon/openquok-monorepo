import { describe, expect, it } from "@jest/globals";

import { captureMcpToolHandler } from "./mcpToolTestUtils";
import { registerPlugsDeleteTool } from "./plugsDelete";

describe("plugsDelete MCP tool", () => {
    it("deletes a plug", async () => {
        const publicDeleteIntegrationPlug = jest.fn().mockResolvedValue({ id: "plug-1" });
        const run = captureMcpToolHandler("plugsDelete", registerPlugsDeleteTool, {
            integrationConnectionService: { publicDeleteIntegrationPlug },
        });

        const result = await run({ plugId: "plug-1" });

        expect(publicDeleteIntegrationPlug).toHaveBeenCalledWith("org-1", "plug-1");
        expect(result.structuredContent).toEqual({ id: "plug-1" });
    });

    it("requires plugId", async () => {
        const run = captureMcpToolHandler("plugsDelete", registerPlugsDeleteTool, {
            integrationConnectionService: { publicDeleteIntegrationPlug: jest.fn() },
        });

        await expect(run({ plugId: " " })).rejects.toThrow("plugId is required");
    });
});
