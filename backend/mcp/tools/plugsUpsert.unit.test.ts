import { describe, expect, it } from "@jest/globals";

import { captureMcpToolHandler } from "./mcpToolTestUtils";
import { registerPlugsUpsertTool } from "./plugsUpsert";

describe("plugsUpsert MCP tool", () => {
    it("upserts a plug rule", async () => {
        const publicUpsertIntegrationPlug = jest.fn().mockResolvedValue({ id: "plug-1" });
        const run = captureMcpToolHandler("plugsUpsert", registerPlugsUpsertTool, {
            integrationConnectionService: { publicUpsertIntegrationPlug },
        });

        const result = await run({
            integrationId: "int-1",
            func: "likeThreshold",
            fields: [{ name: "likes", value: "10" }],
        });

        expect(publicUpsertIntegrationPlug).toHaveBeenCalledWith("org-1", "int-1", {
            func: "likeThreshold",
            fields: [{ name: "likes", value: "10" }],
            plugId: undefined,
        });
        expect(result.structuredContent).toEqual({ id: "plug-1" });
    });

    it("requires func", async () => {
        const run = captureMcpToolHandler("plugsUpsert", registerPlugsUpsertTool, {
            integrationConnectionService: { publicUpsertIntegrationPlug: jest.fn() },
        });

        await expect(
            run({ integrationId: "int-1", func: " ", fields: [{ name: "likes", value: "10" }] })
        ).rejects.toThrow("func is required");
    });
});
