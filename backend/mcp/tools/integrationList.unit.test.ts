import { describe, expect, it } from "@jest/globals";

import { runWithMcpContext } from "../context";
import { registerIntegrationListTool } from "./integrationList";

type ToolHandler = (input: Record<string, unknown>) => Promise<{ structuredContent: unknown }>;

function captureIntegrationListHandler(listIntegrations: jest.Mock): ToolHandler {
    const handlers: Record<string, ToolHandler> = {};
    const server = {
        registerTool: (name: string, _meta: unknown, handler: ToolHandler) => {
            handlers[name] = handler;
        },
    };

    registerIntegrationListTool(server as never, {
        integrationConnectionService: {
            publicListIntegrations: listIntegrations,
        } as never,
    });

    return (input) =>
        runWithMcpContext({ organizationId: "org-1", tokenId: "tok-1", publicUserId: "user-1" }, () =>
            handlers.integrationList(input)
        );
}

describe("integrationList MCP tool", () => {
    it("adds platform alias and returns all channels when group is omitted", async () => {
        const listIntegrations = jest.fn().mockResolvedValue([
            {
                id: "int-1",
                name: "Threads",
                identifier: "threads",
                picture: "/pic.jpg",
                disabled: false,
                profile: null,
                customer: null,
            },
        ]);

        const run = captureIntegrationListHandler(listIntegrations);
        const result = await run({});

        expect(listIntegrations).toHaveBeenCalledTimes(1);
        expect(listIntegrations).toHaveBeenCalledWith("org-1", undefined);
        expect(result.structuredContent).toEqual({
            integrations: [
                expect.objectContaining({
                    id: "int-1",
                    identifier: "threads",
                    platform: "threads",
                }),
            ],
        });
    });

    it("filters channels by group id", async () => {
        const listIntegrations = jest.fn().mockResolvedValue([
            {
                id: "int-1",
                name: "In group",
                identifier: "x",
                picture: "/pic.jpg",
                disabled: false,
                profile: null,
                customer: { id: "grp-1", name: "Client A" },
            },
        ]);

        const run = captureIntegrationListHandler(listIntegrations);
        const result = await run({ group: "grp-1" });

        expect(listIntegrations).toHaveBeenCalledWith("org-1", "grp-1");
        expect(result.structuredContent).toEqual({
            integrations: [expect.objectContaining({ id: "int-1", platform: "x" })],
        });
    });
});
