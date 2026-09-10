import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runWithMcpContext } from "../context";

export type ToolHandler = (input: Record<string, unknown>) => Promise<{ structuredContent: unknown }>;

export function captureMcpToolHandler(
    toolName: string,
    register: (server: McpServer, deps: never) => void,
    deps: unknown
): ToolHandler {
    const handlers: Record<string, ToolHandler> = {};
    const server = {
        registerTool: (name: string, _meta: unknown, handler: ToolHandler) => {
            handlers[name] = handler;
        },
    };

    register(server as unknown as McpServer, deps as never);

    const handler = handlers[toolName];
    if (!handler) {
        throw new Error(`Tool ${toolName} was not registered`);
    }

    return (input) =>
        runWithMcpContext({ organizationId: "org-1", tokenId: "tok-1", publicUserId: "user-1" }, () =>
            handler(input)
        );
}
