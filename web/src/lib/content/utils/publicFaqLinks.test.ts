import { describe, expect, it } from 'vitest';

import {
	buildAgentFaqLinks,
	buildChannelFaqLinks,
	buildChannelFreeTrialFaqDescription,
	buildChannelProgrammaticSchedulingFaqDescription,
	buildChannelProgrammaticSchedulingFaqTitle,
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
		expect(publicFaqHref.cliSetupGuides).toBe('/docs/getting-started-for-cli');
		expect(publicFaqHref.compareOpenquokBuffer).toBe('/compare/openquok/buffer');
		expect(publicFaqHref.humanizerTool).toBe('/tools/humanizer');
		expect(publicFaqHref.skillBuilderTool).toBe('/tools/skill-builder');
		expect(publicFaqHref.selfHostingLanding).toBe('/self-hosting');
		expect(publicFaqHref.dockerCompose).toBe('/docs/installation/docker-compose');
		expect(publicFaqHref.productionDeployment).toBe('/docs/installation/production-deployment');
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

	it('builds programmatic scheduling FAQ title and answer with MCP, CLI, API, and examples links', () => {
		expect(buildChannelProgrammaticSchedulingFaqTitle('Threads')).toBe(
			'Can I schedule Threads from MCP, the API, or CLI?'
		);
		expect(buildChannelProgrammaticSchedulingFaqDescription({
			connectPhrase: 'Connect Threads in our web dashboard',
			cliExamplesHref: publicFaqHref.cliThreads,
			cliExamplesLabel: 'Threads CLI examples',
			suffix: 'Follow-up replies and Thread-specific settings can also be configured by asking agent in chat.'
		})).toContain('href="/docs/mcp-setup-guides"');
		expect(
			buildChannelProgrammaticSchedulingFaqDescription({
				connectPhrase: 'Connect Threads in our web dashboard',
				cliExamplesHref: publicFaqHref.cliThreads,
				cliExamplesLabel: 'Threads CLI examples'
			})
		).toContain('href="/docs/getting-started-for-cli"');
		expect(
			buildChannelProgrammaticSchedulingFaqDescription({
				connectPhrase: 'Connect Threads in our web dashboard',
				cliExamplesHref: publicFaqHref.cliThreads,
				cliExamplesLabel: 'Threads CLI examples'
			})
		).toContain('href="/docs/cli-examples/threads"');
	});

	it('builds free trial FAQ answer with self-hosting and pricing links', () => {
		const description = buildChannelFreeTrialFaqDescription({
			connectPhrase: 'Connect Threads in our web dashboard'
		});
		expect(description).toContain('href="/self-hosting"');
		expect(description).toContain('href="/pricing"');
		expect(description).toContain('cloud free trial');
	});
});
