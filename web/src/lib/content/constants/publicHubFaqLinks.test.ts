import { describe, expect, it } from 'vitest';

import { PUBLIC_CHANNELS_HUB_FAQ } from '$lib/content/constants/publicChannelsHubFaqConfig';
import {
	PUBLIC_API_POSTING_HUB_FAQ,
	PUBLIC_API_SCHEDULING_HUB_FAQ
} from '$lib/content/constants/apis/publicApiCapabilityHubFaqConfig';
import { PUBLIC_COMPARE_HUB_FAQ } from '$lib/content/constants/publicCompareHubFaqConfig';
import { PUBLIC_CREATORS_HUB_FAQ } from '$lib/content/constants/publicCreatorsHubFaqConfig';
import { PUBLIC_ROADMAP_HUB_FAQ } from '$lib/content/constants/publicRoadmapHubFaqConfig';
import { PUBLIC_TOOLS_HUB_FAQ } from '$lib/content/constants/publicToolsHubFaqConfig';
import {
	assertConnectFaqsHaveFunnelLinks,
	assertNoNofollowOnFirstPartyFaqLinks,
	assertSelfHostLabelsOnSocialIntegrationLinks,
	extractFaqAnchors
} from '$lib/content/utils/publicFaqFunnel.test-utils';
import { publicFaqHref } from '$lib/content/utils/publicFaqLinks';

const HUB_FAQ_SECTIONS = [
	{ name: '/channels hub', section: PUBLIC_CHANNELS_HUB_FAQ },
	{ name: '/tools hub', section: PUBLIC_TOOLS_HUB_FAQ },
	{ name: '/compare hub', section: PUBLIC_COMPARE_HUB_FAQ },
	{ name: '/creators hub', section: PUBLIC_CREATORS_HUB_FAQ },
	{ name: '/roadmap hub', section: PUBLIC_ROADMAP_HUB_FAQ },
	{ name: '/social-media-posting-api hub', section: PUBLIC_API_POSTING_HUB_FAQ },
	{ name: '/social-media-scheduling-api hub', section: PUBLIC_API_SCHEDULING_HUB_FAQ }
] as const;

describe('pSEO hub FAQ funnel links', () => {
	for (const { name, section } of HUB_FAQ_SECTIONS) {
		describe(name, () => {
			it('labels social-integration links with self-host', () => {
				assertSelfHostLabelsOnSocialIntegrationLinks(section.faqItems);
			});

			it('avoids nofollow on first-party anchors', () => {
				assertNoNofollowOnFirstPartyFaqLinks(section.faqItems);
			});
		});
	}

	it('channels hub provider-settings FAQ links public API provider docs', () => {
		const providerSettingsAnswer = PUBLIC_CHANNELS_HUB_FAQ.faqItems[3]?.description ?? '';
		expect(providerSettingsAnswer).toContain('href="/docs/public-api-providers"');
		expect(providerSettingsAnswer).toContain('href="/docs/public-api-providers/youtube"');
		expect(providerSettingsAnswer).not.toContain('href="/channels"');
	});

	it('channels hub connect FAQ prioritizes sign-up and connect guide', () => {
		assertConnectFaqsHaveFunnelLinks(PUBLIC_CHANNELS_HUB_FAQ.faqItems, (title) =>
			title.startsWith('How do I connect a social channel')
		);

		const connectAnswer = PUBLIC_CHANNELS_HUB_FAQ.faqItems[0]?.description ?? '';
		const anchors = extractFaqAnchors(connectAnswer);
		expect(anchors.some((anchor) => anchor.href === publicFaqHref.signUp)).toBe(true);
		expect(anchors.some((anchor) => anchor.href === publicFaqHref.connectChannelsGuide)).toBe(
			true
		);
		expect(anchors.some((anchor) => anchor.href.startsWith('/docs/social-integration/'))).toBe(
			false
		);
	});

	it('tools hub links each tool route and sign-up for scheduling', () => {
		const html = PUBLIC_TOOLS_HUB_FAQ.faqItems.map((item) => item.description).join('\n');
		expect(html).toContain(`href="${publicFaqHref.skillBuilderTool}"`);
		expect(html).toContain(`href="${publicFaqHref.photoEditorTool}"`);
		expect(html).toContain(`href="${publicFaqHref.humanizerTool}"`);
		expect(html).toContain(`href="${publicFaqHref.bestTimeToPostTool}"`);

		const scheduleFaq = PUBLIC_TOOLS_HUB_FAQ.faqItems.find((item) =>
			item.title.startsWith('How do I schedule a post')
		);
		expect(scheduleFaq?.description).toContain(`href="${publicFaqHref.signUp}"`);
		expect(scheduleFaq?.description).toContain(`href="${publicFaqHref.connectChannelsGuide}"`);
	});

	it('compare hub links buffer compare, later compare, pricing, and alternatives', () => {
		const html = PUBLIC_COMPARE_HUB_FAQ.faqItems.map((item) => item.description).join('\n');
		expect(html).toContain(`href="${publicFaqHref.compareOpenquokBuffer}"`);
		expect(html).toContain(`href="${publicFaqHref.compareOpenquokLater}"`);
		expect(html).toContain(`href="${publicFaqHref.alternativesLater}"`);
		expect(html).toContain(`href="${publicFaqHref.pricing}"`);
		expect(html).toContain(`href="${publicFaqHref.alternatives}"`);
	});

	it('creators hub links playbooks, building blocks, and sign-up to publish', () => {
		const html = PUBLIC_CREATORS_HUB_FAQ.faqItems.map((item) => item.description).join('\n');
		expect(html).toContain(`href="${publicFaqHref.playbooks}"`);
		expect(html).toContain(`href="${publicFaqHref.buildingBlocks}"`);
		expect(html).toContain(`href="${publicFaqHref.signUp}"`);
	});

	it('roadmap hub links the roadmap page and Discord', () => {
		const html = PUBLIC_ROADMAP_HUB_FAQ.faqItems.map((item) => item.description).join('\n');
		expect(html).toContain('href="/roadmap"');
		expect(html).toMatch(/href="https:\/\/discord\.gg\//);
	});

	it('API marketing hubs link pricing and cloud limits for rate-limit FAQs', () => {
		for (const section of [PUBLIC_API_POSTING_HUB_FAQ, PUBLIC_API_SCHEDULING_HUB_FAQ]) {
			const html = section.faqItems.map((item) => item.description).join('\n');
			expect(html).toContain(`href="${publicFaqHref.pricing}"`);
			expect(html).toContain('href="/docs/cloud/limits"');
			expect(html).toContain('30 requests per hour');
		}
	});
});
