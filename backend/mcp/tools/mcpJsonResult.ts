/** Standard MCP tool payload: human-readable JSON text + structured mirror for clients. */
export function mcpJsonResult<T extends Record<string, unknown>>(data: T): {
    content: [{ type: "text"; text: string }];
    structuredContent: T;
} {
    return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: data,
    };
}
