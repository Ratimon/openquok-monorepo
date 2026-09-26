import { describe, expect, it } from 'vitest';

import {
	buildPublicChannelAgentIntegrationCardDescription,
	buildPublicChannelAgentIntegrationsGridDescription,
	buildPublicChannelAgentIntegrationsGridExtensionLabel,
	buildPublicChannelAgentIntegrationsGridSubtitle,
	buildPublicChannelAgentIntegrationsGridTitle
} from '$lib/content/utils/buildPublicChannelAgentIntegrationsGridCopy';
import { listPublicAgentIntegrationsForChannel } from '$lib/content/utils/listPublicAgentIntegrationsForChannel';

describe('buildPublicChannelAgentIntegrationsGridCopy', () => {
	it('builds section subtitle, title, and description for a platform', () => {
		expect(buildPublicChannelAgentIntegrationsGridSubtitle()).toBe('Agents & MCP integrations');
		expect(buildPublicChannelAgentIntegrationsGridTitle('TikTok')).toBe(
			'Schedule TikTok from agents: OpenClaw Cursor and every MCP landing page'
		);
		expect(buildPublicChannelAgentIntegrationsGridDescription('TikTok')).toContain('TikTok workflows');
		expect(buildPublicChannelAgentIntegrationsGridExtensionLabel()).toBe('MCP clients');
	});

	it('builds card descriptions for agent hosts and MCP clients', () => {
		expect(
			buildPublicChannelAgentIntegrationCardDescription('TikTok', 'OpenClaw', 'agent-host', true)
		).toContain('openquok-core');
		expect(
			buildPublicChannelAgentIntegrationCardDescription('TikTok', 'Cursor', 'mcp-client', true)
		).toContain('MCP tools');
		expect(
			buildPublicChannelAgentIntegrationCardDescription('TikTok', 'OpenClaw', 'agent-host', false)
		).toContain('coming soon');
	});
});

describe('listPublicAgentIntegrationsForChannel', () => {
	it('returns agent hosts and MCP clients for a known channel slug', () => {
		const { agentHosts, mcpClients } = listPublicAgentIntegrationsForChannel('tiktok');
		expect(agentHosts.length).toBeGreaterThan(0);
		expect(mcpClients.length).toBeGreaterThan(0);
		expect(agentHosts[0]?.href).toContain('/agents/openclaw/tiktok');
		expect(mcpClients[0]?.href).toMatch(/\/agents\/[^/]+\/tiktok$/);
	});

	it('returns empty lists for an unknown channel slug', () => {
		expect(listPublicAgentIntegrationsForChannel('not-a-channel')).toEqual({
			agentHosts: [],
			mcpClients: []
		});
	});
});
