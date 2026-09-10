import { describe, expect, it } from "@jest/globals";

import { captureMcpToolHandler } from "./mcpToolTestUtils";
import { registerPlugsListTool } from "./plugsList";

describe("plugsList MCP tool", () => {
    it("lists plugs for a channel", async () => {
        const publicListIntegrationPlugs = jest.fn().mockResolvedValue([{ id: "plug-1" }]);
        const run = captureMcpToolHandler("plugsList", registerPlugsListTool, {
            integrationConnectionService: { publicListIntegrationPlugs },
        });

        const result = await run({ integrationId: "int-1" });

        expect(publicListIntegrationPlugs).toHaveBeenCalledWith("org-1", "int-1");
        expect(result.structuredContent).toEqual({ plugs: [{ id: "plug-1" }] });
    });

    it("requires integrationId", async () => {
        const run = captureMcpToolHandler("plugsList", registerPlugsListTool, {
            integrationConnectionService: { publicListIntegrationPlugs: jest.fn() },
        });

        await expect(run({ integrationId: "" })).rejects.toThrow("integrationId is required");
    });
});
