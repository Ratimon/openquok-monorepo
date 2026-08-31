import { describe, expect, it } from 'vitest';

import {
	buildAgentFaqLinks,
	buildChannelFaqLinks,
	buildToolChannelFaqLinks,
	faqHrefAgent,
	faqLink,
	faqLinkSelfHostChannelSetup,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';

describe('publicFaqLinks', () => {
	it('wraps labels in root-relative anchors', () => {
		expect(faqLink('/pricing', 'Pricing')).toBe('<a href="/pricing">Pricing</a>');
	});

	it('labels self-host channel setup docs', () => {
		expect(faqLinkSelfHostChannelSetup('/docs/social-integration/youtube', 'YouTube')).toBe(
			'<a href="/docs/social-integration/youtube">self-host YouTube setup guide</a>'
		);
	});

	it('exposes funnel and shared hub hrefs', () => {
		expect(publicFaqHref.signUp).toBe('/sign-up');
		expect(publicFaqHref.connectChannelsGuide).toBe('/docs/channels/connect');
		expect(publicFaqHref.pricing).toBe('/pricing');
		expect(publicFaqHref.channels).toBe('/channels');
		expect(publicFaqHref.cliGettingStarted).toBe('/docs/getting-started-for-cli');
		expect(publicFaqHref.compareOpenquokBuffer).toBe('/compare/openquok/buffer');
		expect(publicFaqHref.humanizerTool).toBe('/tools/humanizer');
		expect(publicFaqHref.skillBuilderTool).toBe('/tools/skill-builder');
		expect(faqHrefAgent('grok-bot')).toBe('/agents/grok-bot');
	});

	it('builds channel-tailored FAQ destinations', () => {
		const links = buildChannelFaqLinks('linkedin', '/docs/social-integration/linkedin');
		expect(links).toEqual({
			docs: '/docs/social-integration/linkedin',
			channelLanding: '/channels/linkedin',
			playbooksTag: '/playbooks/tags/linkedin',
			buildingBlocksTag: '/building-blocks/tags/linkedin'
		});
	});

	it('builds agent-tailored FAQ destinations', () => {
		const links = buildAgentFaqLinks('openclaw', '/docs/agent-setup-guides/openclaw');
		expect(links.agentLanding).toBe('/agents/openclaw');
		expect(links.docs).toBe('/docs/agent-setup-guides/openclaw');
		expect(links.agentChannel('facebook')).toBe('/agents/openclaw/facebook');
	});

	it('builds tool×channel FAQ destinations', () => {
		const links = buildToolChannelFaqLinks('humanizer', 'linkedin');
		expect(links).toEqual({
			toolLanding: '/tools/humanizer',
			toolChannel: '/tools/humanizer/linkedin'
		});
	});

	it('rejects unknown tool slugs', () => {
		expect(() => buildToolChannelFaqLinks('unknown-tool', 'linkedin')).toThrow(
			/Unknown tool slug/
		);
	});
});
