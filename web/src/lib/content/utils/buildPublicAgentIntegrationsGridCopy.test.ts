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
});
