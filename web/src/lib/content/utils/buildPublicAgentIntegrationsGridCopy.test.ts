import { describe, expect, it } from 'vitest';

import {
	buildPublicAgentIntegrationHubCardDescription,
	buildPublicAgentIntegrationsGridDescription,
	buildPublicAgentIntegrationsGridTitle
} from '$lib/content/utils/buildPublicAgentIntegrationsGridCopy';
import { listPublicAgentIntegrationsForAgentPage } from '$lib/content/utils/listPublicAgentIntegrationsForAgentPage';

describe('buildPublicAgentIntegrationsGridCopy', () => {
	it('builds colon-separated section title for agent hub pages', () => {
		expect(buildPublicAgentIntegrationsGridTitle('Amp')).toBe('Beyond Amp: Every Supported Agent');
		expect(buildPublicAgentIntegrationsGridDescription('Amp')).toContain('Amp');
	});

	it('overrides section description for OpenAI personal-agent hosts', () => {
		const description = buildPublicAgentIntegrationsGridDescription('OpenClaw', 'openclaw');
		expect(description).toContain('Dots and OpenClaw');
	});

	it('overrides section description for xAI Grok Bot', () => {
		const description = buildPublicAgentIntegrationsGridDescription('Grok Bot', 'grok-bot');
		expect(description).toContain('X-first');
	});

	it('builds hub card descriptions', () => {
		expect(buildPublicAgentIntegrationHubCardDescription('OpenClaw', 'agent-host', true)).toContain(
			'openquok-core'
		);
	});
});

describe('listPublicAgentIntegrationsForAgentPage', () => {
	it('links to agent hub routes without a channel slug', () => {
		const { mcpClients } = listPublicAgentIntegrationsForAgentPage();
		const amp = mcpClients.find((item) => item.slug === 'amp');
		expect(amp?.href).toBe('/agents/amp');
	});

	it('links to agent channel routes when a channel slug is set', () => {
		const { agentHosts } = listPublicAgentIntegrationsForAgentPage('tiktok');
		const openclaw = agentHosts.find((item) => item.slug === 'openclaw');
		expect(openclaw?.href).toBe('/agents/openclaw/tiktok');
	});

	it('pins ecosystem-related agent hosts when activeAgentSlug is set', () => {
		const { agentHosts } = listPublicAgentIntegrationsForAgentPage(null, 'dots');
		const slugs = agentHosts.map((item) => item.slug);
		const dotsIndex = slugs.indexOf('dots');
		const openclawIndex = slugs.indexOf('openclaw');
		expect(dotsIndex).toBeGreaterThanOrEqual(0);
		expect(openclawIndex).toBeGreaterThanOrEqual(0);
		expect(dotsIndex).toBeLessThan(openclawIndex);
	});

	it('pins ChatGPT in MCP clients for OpenAI personal-agent hosts', () => {
		const { mcpClients } = listPublicAgentIntegrationsForAgentPage(null, 'openclaw');
		const slugs = mcpClients.map((item) => item.slug);
		expect(slugs.indexOf('chatgpt')).toBe(0);
	});
});
