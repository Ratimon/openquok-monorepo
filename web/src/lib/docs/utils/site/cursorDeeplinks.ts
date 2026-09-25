/** Cursor app deeplink handler (see cursor.com/docs/mcp/install-links). */
const CURSOR_DEEPLINK_HOST = 'anysphere.cursor-deeplink';

export type CursorHttpMcpServerConfig = {
	url: string;
	headers?: Record<string, string>;
};

/**
 * One-click MCP install link for Cursor.
 * `serverConfig` is the inner server object (e.g. `{ url }` or `{ command, args }`), not a full `mcp.json` wrapper.
 */
function base64EncodeUtf8(text: string): string {
	const bytes = new TextEncoder().encode(text);
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary);
}

export function buildCursorMcpInstallDeeplink(
	serverDisplayName: string,
	serverConfig: CursorHttpMcpServerConfig | Record<string, unknown>
): string {
	const configB64 = base64EncodeUtf8(JSON.stringify(serverConfig));

	const url = new URL(`cursor://${CURSOR_DEEPLINK_HOST}/mcp/install`);
	url.searchParams.set('name', serverDisplayName);
	url.searchParams.set('config', configB64);
	return url.href;
}

/** Opens Cursor chat with a pre-filled prompt (user must confirm before send). */
export function buildCursorPromptDeeplink(promptText: string): string {
	const url = new URL(`cursor://${CURSOR_DEEPLINK_HOST}/prompt`);
	url.searchParams.set('text', promptText);
	return url.href;
}
