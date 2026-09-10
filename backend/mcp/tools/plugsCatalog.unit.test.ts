import { describe, expect, it } from "@jest/globals";

import { captureMcpToolHandler } from "./mcpToolTestUtils";
import { registerPlugsCatalogTool } from "./plugsCatalog";

describe("plugsCatalog MCP tool", () => {
    it("returns plug catalog", async () => {
        const catalog = { threads: { plugs: [] } };
        const getPlugCatalog = jest.fn().mockReturnValue(catalog);
        const run = captureMcpToolHandler("plugsCatalog", registerPlugsCatalogTool, {
            integrationConnectionService: { getPlugCatalog },
        });

        const result = await run({});

        expect(getPlugCatalog).toHaveBeenCalledTimes(1);
        expect(result.structuredContent).toEqual(catalog);
    });
});
