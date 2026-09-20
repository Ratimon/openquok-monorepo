import { describe, expect, it } from 'vitest';

import {
	getPublicAgentSetupStepsFooter,
	getPublicApiSetupStepsFooter,
	getPublicMcpSetupStepsFooter
} from '$lib/content/constants/publicSetupStepsFooterConfig';

describe('publicSetupStepsFooterConfig', () => {
	it('links API marketing setup steps to the public API guide', () => {
		const footer = getPublicApiSetupStepsFooter();

		expect(footer.footerLinkHref).toBe('/docs/getting-started-for-public-api');
		expect(footer.footerLinkLabel).toContain('getting started');
	});

	it('links agent setup steps to the host setup guide', () => {
		const footer = getPublicAgentSetupStepsFooter('/docs/agent-setup-guides/openclaw');

		expect(footer.footerLinkHref).toBe('/docs/agent-setup-guides/openclaw');
		expect(footer.footerLinkLabel).toContain('agent setup');
	});

	it('links MCP skill setup steps to the CLI guide', () => {
		const footer = getPublicMcpSetupStepsFooter('skill', '/docs/mcp-setup-guides/cursor');

		expect(footer.footerLinkHref).toBe('/docs/getting-started-for-cli');
	});

	it('links MCP client setup steps to the client setup guide', () => {
		const footer = getPublicMcpSetupStepsFooter('mcp', '/docs/mcp-setup-guides/cursor');

		expect(footer.footerLinkHref).toBe('/docs/mcp-setup-guides/cursor');
		expect(footer.footerLinkLabel).toContain('MCP client');
	});
});
