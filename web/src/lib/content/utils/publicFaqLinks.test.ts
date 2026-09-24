import { describe, expect, it } from 'vitest';

import {
	PUBLIC_API_POSTING_HUB_FAQ,
	PUBLIC_API_POSTING_PLATFORM_SLUGS,
	PUBLIC_API_SCHEDULING_HUB_FAQ,
	getPublicApiPostingPlatformBySlug,
	getPublicApiSchedulingPlatformBySlug
} from '$lib/content/constants/apis/index';
import {
	assertConnectFaqsHaveFunnelLinks,
	assertSelfHostLabelsOnSocialIntegrationLinks
} from '$lib/content/utils/publicFaqFunnel.test-utils';
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
		expect(publicFaqHref.billing).toBe('/docs/billing');
		expect(publicFaqHref.billingLimits).toBe('/docs/billing/limits');
		expect(publicFaqHref.cloud).toBe('/docs/cloud');
		expect(publicFaqHref.cloudTrial).toBe('/docs/cloud/trial');
		expect(publicFaqHref.docsSchedulingRepeat).toBe(
			'/docs/creating-posts/scheduling#repeating-a-post'
		);
		expect(publicFaqHref.docsChannelGroups).toBe('/docs/channels/channel-groups');
		expect(publicFaqHref.channels).toBe('/channels');
		expect(publicFaqHref.cliGettingStarted).toBe('/docs/getting-started-for-cli');
		expect(publicFaqHref.cliSetupGuides).toBe('/docs/getting-started-for-cli');
		expect(publicFaqHref.compareOpenquokBuffer).toBe('/compare/openquok/buffer');
		expect(publicFaqHref.humanizerTool).toBe('/tools/humanizer');
		expect(publicFaqHref.skillBuilderTool).toBe('/tools/skill-builder');
		expect(publicFaqHref.docsPlaybooks).toBe('/docs/playbooks');
		expect(publicFaqHref.docsPlaybooksCompose).toBe('/docs/playbooks/compose-a-playbook');
		expect(publicFaqHref.selfHostingLanding).toBe('/self-hosting');
		expect(publicFaqHref.dockerCompose).toBe('/docs/installation/docker-compose');
		expect(publicFaqHref.productionDeployment).toBe('/docs/installation/production-deployment');
		expect(publicFaqHref.publicApiProviders).toBe('/docs/public-api-providers');
		expect(publicFaqHref.socialMediaPostingApi).toBe('/social-media-posting-api');
		expect(publicFaqHref.socialMediaSchedulingApi).toBe('/social-media-scheduling-api');
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

	it('builds payload wizard tool×channel FAQ destinations', () => {
		const links = buildToolChannelFaqLinks('payload-wizard', 'tiktok');
		expect(links).toEqual({
			toolLanding: '/tools/payload-wizard',
			toolChannel: '/tools/payload-wizard/tiktok'
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

	it('API hub FAQs append git-default items with pricing and scheduling links', () => {
		for (const hubFaq of [PUBLIC_API_POSTING_HUB_FAQ, PUBLIC_API_SCHEDULING_HUB_FAQ]) {
			expect(hubFaq.faqItems.length).toBeGreaterThan(3);
			const html = hubFaq.faqItems.map((item) => item.description).join('\n');
			expect(html).toContain(`href="${publicFaqHref.pricing}"`);
			expect(html).toContain(`href="${publicFaqHref.connectChannelsGuide}"`);
		}
	});

	it('API platform FAQs reuse the shared platform git-default set', () => {
		for (const slug of PUBLIC_API_POSTING_PLATFORM_SLUGS) {
			const postingPlatform = getPublicApiPostingPlatformBySlug(slug);
			const schedulingPlatform = getPublicApiSchedulingPlatformBySlug(slug);

			expect(postingPlatform).toBeDefined();
			expect(schedulingPlatform).toBeDefined();

			for (const platform of [postingPlatform!, schedulingPlatform!]) {
				expect(platform.faqItems.length).toBeGreaterThan(3);
				const tailIds = platform.faqItems.slice(-3).map((item) => item.id);
				expect(tailIds).toEqual(['what-is-channel', 'oauth-app-counts', 'schedule-posts']);
				assertSelfHostLabelsOnSocialIntegrationLinks(platform.faqItems);
			}
		}
	});
});
