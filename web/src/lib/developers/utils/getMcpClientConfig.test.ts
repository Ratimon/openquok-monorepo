import { describe, expect, it } from 'vitest';

import {
	getMcpClientConfig,
	maskApiKeyInConfig,
	MCP_SERVER_NAME,
	MCP_TOKEN_PLACEHOLDER,
	resolveMcpBaseUrl
} from '$lib/developers/utils/getMcpClientConfig';

const MCP_BASE = 'https://api.openquok.com';
const API_KEY = 'opo_test_token_abc123';

describe('resolveMcpBaseUrl', () => {
	it('uses explicit API base when provided', () => {
		expect(resolveMcpBaseUrl('https://custom.example.com/')).toBe('https://custom.example.com');
	});
});

describe('getMcpClientConfig', () => {
	it('generates Cursor header auth with openquok server name', () => {
		const { config, hint } = getMcpClientConfig('Cursor', 'header', MCP_BASE, API_KEY);
		expect(hint).toContain('.cursor/mcp.json');
		const parsed = JSON.parse(config) as {
			mcpServers: Record<string, { url: string; headers: { Authorization: string } }>;
		};
		expect(parsed.mcpServers[MCP_SERVER_NAME].url).toBe(`${MCP_BASE}/mcp`);
		expect(parsed.mcpServers[MCP_SERVER_NAME].headers.Authorization).toBe(`Bearer ${API_KEY}`);
	});

	it('generates Cursor path auth with token in URL', () => {
		const { config } = getMcpClientConfig('Cursor', 'path', MCP_BASE, API_KEY);
		const parsed = JSON.parse(config) as { mcpServers: Record<string, { url: string }> };
		expect(parsed.mcpServers[MCP_SERVER_NAME].url).toBe(`${MCP_BASE}/mcp/${API_KEY}`);
	});

	it('generates Claude Code CLI for path auth', () => {
		const { config } = getMcpClientConfig('Claude Code', 'path', MCP_BASE, API_KEY);
		expect(config).toContain(`claude mcp add ${MCP_SERVER_NAME}`);
		expect(config).toContain(`${MCP_BASE}/mcp/${API_KEY}`);
	});

	it('generates Claude Cowork managed server entry', () => {
		const { config } = getMcpClientConfig('Claude Cowork', 'header', MCP_BASE, API_KEY);
		const parsed = JSON.parse(config) as Array<{
			name: string;
			url: string;
			headers: { Authorization: string };
		}>;
		expect(parsed[0]?.name).toBe(MCP_SERVER_NAME);
		expect(parsed[0]?.url).toBe(`${MCP_BASE}/mcp`);
		expect(parsed[0]?.headers.Authorization).toBe(`Bearer ${API_KEY}`);
	});

	it('generates Devin Desktop header auth with global mcp_config.json hint', () => {
		const { config, hint } = getMcpClientConfig('Devin Desktop', 'header', MCP_BASE, API_KEY);
		expect(hint).toContain('~/.codeium/mcp_config.json');
		const parsed = JSON.parse(config) as {
			mcpServers: Record<string, { serverUrl: string; headers: { Authorization: string } }>;
		};
		expect(parsed.mcpServers[MCP_SERVER_NAME].serverUrl).toBe(`${MCP_BASE}/mcp`);
		expect(parsed.mcpServers[MCP_SERVER_NAME].headers.Authorization).toBe(`Bearer ${API_KEY}`);
	});
});

describe('maskApiKeyInConfig', () => {
	it('masks the API key in generated config', () => {
		const { config } = getMcpClientConfig('Cursor', 'path', MCP_BASE, API_KEY);
		const masked = maskApiKeyInConfig(config, API_KEY);
		expect(masked).not.toContain(API_KEY);
		expect(masked).toContain('•');
	});

	it('leaves placeholder configs unchanged', () => {
		const { config } = getMcpClientConfig('Cursor', 'path', MCP_BASE, MCP_TOKEN_PLACEHOLDER);
		expect(maskApiKeyInConfig(config, MCP_TOKEN_PLACEHOLDER)).toBe(config);
	});
});
