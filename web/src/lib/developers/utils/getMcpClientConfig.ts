import { CONFIG_SCHEMA_BACKEND } from '$lib/config/constants/config';
import { normalizeApiBaseUrl } from '$lib/utils/path';

export const MCP_CLIENTS = [
	'Claude Code',
	'Claude Cowork',
	'Cursor',
	'VS Code / Copilot',
	'Windsurf',
	'Amp',
	'Codex',
	'Gemini CLI',
	'Warp'
] as const;

export type McpClient = (typeof MCP_CLIENTS)[number];
export type McpAuthMethod = 'header' | 'path';

export const MCP_SERVER_NAME = 'openquok';
export const MCP_TOKEN_PLACEHOLDER = 'opo_your_programmatic_token';

const json = (obj: object) => JSON.stringify(obj, null, 2);

/** Backend origin for MCP (`/mcp` lives on the API host, not under `/api/v1`). */
export function resolveMcpBaseUrl(explicitApiBase?: string): string {
	const configured = normalizeApiBaseUrl(
		explicitApiBase ?? String(CONFIG_SCHEMA_BACKEND.API_BASE_URL.default ?? '')
	);
	if (configured) return configured;
	const isDev = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV);
	if (isDev) return 'http://localhost:3000';
	return 'https://api.openquok.com';
}

export function getMcpClientConfig(
	client: McpClient,
	method: McpAuthMethod,
	mcpBase: string,
	apiKey: string
): { config: string; hint: string } {
	const base = normalizeApiBaseUrl(mcpBase);
	const urlWithKey = `${base}/mcp/${apiKey}`;
	const urlBase = `${base}/mcp`;
	const bearer = `Bearer ${apiKey}`;

	if (method === 'path') {
		switch (client) {
			case 'Claude Code':
				return {
					config: `claude mcp add ${MCP_SERVER_NAME} --transport http --url "${urlWithKey}"`,
					hint: 'Run this command in your terminal.'
				};
			case 'Claude Cowork':
				return {
					config: json([
						{
							name: MCP_SERVER_NAME,
							url: urlWithKey,
							transport: 'http'
						}
					]),
					hint: 'Add via Custom connectors or managedMcpServers in Cowork organization settings.'
				};
			case 'Cursor':
				return {
					config: json({ mcpServers: { [MCP_SERVER_NAME]: { url: urlWithKey } } }),
					hint: 'Add to .cursor/mcp.json in your project root.'
				};
			case 'VS Code / Copilot':
				return {
					config: json({
						servers: { [MCP_SERVER_NAME]: { type: 'http', url: urlWithKey } }
					}),
					hint: 'Add to .vscode/mcp.json in your project root.'
				};
			case 'Windsurf':
				return {
					config: json({
						mcpServers: { [MCP_SERVER_NAME]: { serverUrl: urlWithKey } }
					}),
					hint: 'Add to ~/.codeium/windsurf/mcp_config.json'
				};
			case 'Amp':
				return {
					config: `amp mcp add ${MCP_SERVER_NAME} ${urlWithKey}`,
					hint: 'Run this command in your terminal.'
				};
			case 'Codex':
				return {
					config: `# ~/.codex/config.toml\n\n[mcp_servers.${MCP_SERVER_NAME}]\nurl = "${urlWithKey}"`,
					hint: 'Add to ~/.codex/config.toml'
				};
			case 'Gemini CLI':
				return {
					config: json({ mcpServers: { [MCP_SERVER_NAME]: { url: urlWithKey } } }),
					hint: 'Add to ~/.gemini/settings.json'
				};
			case 'Warp':
				return {
					config: json({ [MCP_SERVER_NAME]: { url: urlWithKey } }),
					hint: 'Settings > MCP Servers > + Add, then paste this config.'
				};
		}
	}

	switch (client) {
		case 'Claude Code':
			return {
				config: `claude mcp add ${MCP_SERVER_NAME} \\\n  --transport http \\\n  --header "Authorization: ${bearer}" \\\n  "${urlBase}"`,
				hint: 'Run this command in your terminal.'
			};
		case 'Claude Cowork':
			return {
				config: json([
					{
						name: MCP_SERVER_NAME,
						url: urlBase,
						transport: 'http',
						headers: { Authorization: bearer }
					}
				]),
				hint: 'Add via Custom connectors or managedMcpServers in Cowork organization settings.'
			};
		case 'Cursor':
			return {
				config: json({
					mcpServers: {
						[MCP_SERVER_NAME]: { url: urlBase, headers: { Authorization: bearer } }
					}
				}),
				hint: 'Add to .cursor/mcp.json in your project root.'
			};
		case 'VS Code / Copilot':
			return {
				config: json({
					servers: {
						[MCP_SERVER_NAME]: {
							type: 'http',
							url: urlBase,
							headers: { Authorization: bearer }
						}
					}
				}),
				hint: 'Add to .vscode/mcp.json in your project root.'
			};
		case 'Windsurf':
			return {
				config: json({
					mcpServers: {
						[MCP_SERVER_NAME]: {
							serverUrl: urlBase,
							headers: { Authorization: bearer }
						}
					}
				}),
				hint: 'Add to ~/.codeium/windsurf/mcp_config.json'
			};
		case 'Amp':
			return {
				config: json({
					'amp.mcpServers': {
						[MCP_SERVER_NAME]: { url: urlBase, headers: { Authorization: bearer } }
					}
				}),
				hint: 'Add to your Amp settings.json'
			};
		case 'Codex':
			return {
				config: `# ~/.codex/config.toml\n\n[mcp_servers.${MCP_SERVER_NAME}]\nurl = "${urlBase}"\nhttp_headers = { "Authorization" = "${bearer}" }`,
				hint: 'Add to ~/.codex/config.toml'
			};
		case 'Gemini CLI':
			return {
				config: json({
					mcpServers: {
						[MCP_SERVER_NAME]: { url: urlBase, headers: { Authorization: bearer } }
					}
				}),
				hint: 'Add to ~/.gemini/settings.json'
			};
		case 'Warp':
			return {
				config: json({
					[MCP_SERVER_NAME]: { url: urlBase, headers: { Authorization: bearer } }
				}),
				hint: 'Settings > MCP Servers > + Add, then paste this config.'
			};
	}
}

export function maskApiKeyInConfig(config: string, apiKey: string): string {
	if (!apiKey || apiKey === MCP_TOKEN_PLACEHOLDER) return config;
	const escaped = apiKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return config.replace(new RegExp(escaped, 'g'), '•'.repeat(Math.max(8, apiKey.length)));
}
