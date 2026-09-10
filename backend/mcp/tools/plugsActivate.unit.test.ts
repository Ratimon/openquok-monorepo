import { describe, expect, it } from "@jest/globals";

import { captureMcpToolHandler } from "./mcpToolTestUtils";
import { registerPlugsActivateTool } from "./plugsActivate";

describe("plugsActivate MCP tool", () => {
    it("activates a plug", async () => {
        const publicSetIntegrationPlugActivated = jest.fn().mockResolvedValue({ id: "plug-1", activated: true });
        const run = captureMcpToolHandler("plugsActivate", registerPlugsActivateTool, {
            integrationConnectionService: { publicSetIntegrationPlugActivated },
        });

        const result = await run({ plugId: "plug-1", activated: true });

        expect(publicSetIntegrationPlugActivated).toHaveBeenCalledWith("org-1", "plug-1", true);
        expect(result.structuredContent).toEqual({ id: "plug-1", activated: true });
    });

    it("requires plugId", async () => {
        const run = captureMcpToolHandler("plugsActivate", registerPlugsActivateTool, {
            integrationConnectionService: { publicSetIntegrationPlugActivated: jest.fn() },
        });

        await expect(run({ plugId: "", activated: false })).rejects.toThrow("plugId is required");
    });
});
