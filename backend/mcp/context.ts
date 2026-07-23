import { AsyncLocalStorage } from "node:async_hooks";

export type McpRequestContext = {
    organizationId: string;
    tokenId: string;
    /** Token owner `public.users.id` for platform-admin billing bypass. */
    publicUserId: string;
};

const mcpContextStorage = new AsyncLocalStorage<McpRequestContext>();

export function runWithMcpContext<T>(context: McpRequestContext, fn: () => T): T {
    return mcpContextStorage.run(context, fn);
}

export function getMcpContext(): McpRequestContext {
    const ctx = mcpContextStorage.getStore();
    if (!ctx) {
        throw new Error("MCP context is not available for this request");
    }
    return ctx;
}

export function tryGetMcpContext(): McpRequestContext | undefined {
    return mcpContextStorage.getStore();
}
