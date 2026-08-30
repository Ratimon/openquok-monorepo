import { describe, expect, it } from 'vitest';

import { buildHumanizeFaqSection } from '$lib/ai-humanize/constants/publicHumanizeFaqConfig';
import { publicChannelByPagePresenter } from '$lib/area-public';
import { PUBLIC_CHANNELS_HUB_FAQ } from '$lib/content/constants/publicChannelsHubFaqConfig';
import { PUBLIC_TOOLS_HUB_FAQ } from '$lib/content/constants/publicToolsHubFaqConfig';
import {
	assertConnectFaqsHaveFunnelLinks,
	assertFaqJsonLdPlainTextAnswers,
	assertNoNofollowOnFirstPartyFaqLinks,
	assertSelfHostLabelsOnSocialIntegrationLinks,
	extractFaqAnchors
} from '$lib/content/utils/publicFaqFunnel.test-utils';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/seo/jsonLdSchema';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';

const SAMPLE_CANONICAL = 'https://www.openquok.com';

describe('pSEO FAQ SSR spot-check', () => {
	it('/channels/youtube ships funnel-first connect FAQ and plain-text JSON-LD', () => {
		const channelVm = publicChannelByPagePresenter.loadChannelBySlugStateless('youtube');
		expect(channelVm).toBeDefined();

		assertConnectFaqsHaveFunnelLinks(channelVm!.faqItems);
		assertSelfHostLabelsOnSocialIntegrationLinks(channelVm!.faqItems);
		assertNoNofollowOnFirstPartyFaqLinks(channelVm!.faqItems);

		const connectFaq = channelVm!.faqItems.find((item) =>
			item.title.startsWith('How do I connect my YouTube channel')
		);
		expect(connectFaq?.description).toContain('href="/sign-up"');
		expect(connectFaq?.description).toContain('self-host YouTube setup guide');

		assertFaqJsonLdPlainTextAnswers({
			pageUrl: `${SAMPLE_CANONICAL}/channels/youtube#faq`,
			items: channelVm!.faqItems
		});
	});

	it('/tools/humanizer/linkedin ships channel-tailored FAQ links and JSON-LD parity', () => {
		const faqSection = buildHumanizeFaqSection('linkedin', 'LinkedIn');

		expect(faqSection.faqItems.length).toBeGreaterThan(0);
		assertNoNofollowOnFirstPartyFaqLinks(faqSection.faqItems);

		const whatIsFaq = faqSection.faqItems.find(
			(item) => item.title === 'What is OpenQuok Humanizer?'
		);
		expect(whatIsFaq?.description).toMatch(/href="\/tools\/humanizer\/linkedin"/);

		assertFaqJsonLdPlainTextAnswers({
			pageUrl: `${SAMPLE_CANONICAL}/tools/humanizer/linkedin#faq`,
			items: faqSection.faqItems
		});
	});

	it('/channels hub FAQ graph includes FAQPage with funnel links', () => {
		assertConnectFaqsHaveFunnelLinks(PUBLIC_CHANNELS_HUB_FAQ.faqItems, (title) =>
			title.startsWith('How do I connect a social channel')
		);

		const schemaData = createJsonLdGraph(
			filterNonEmptyJsonLdNodes([
				createPublicFaqSEOSchema({
					pageUrl: `${SAMPLE_CANONICAL}/channels#faq`,
					name: PUBLIC_CHANNELS_HUB_FAQ.faqTitle,
					description: PUBLIC_CHANNELS_HUB_FAQ.faqDescription,
					items: PUBLIC_CHANNELS_HUB_FAQ.faqItems
				})
			])
		);

		const faqNode = schemaData['@graph'].find((node) => node['@type'] === 'FAQPage');
		expect(faqNode).toBeDefined();

		const firstAnswer = (
			faqNode as { mainEntity: { acceptedAnswer: { text: string } }[] }
		).mainEntity[0]?.acceptedAnswer.text;
		expect(firstAnswer).toContain('Sign up for free');
		expect(firstAnswer).toContain('connect channels guide');
		expect(firstAnswer).not.toContain('<a');
	});

	it('/tools hub FAQ includes sign-up and tool landing hrefs', () => {
		const scheduleFaq = PUBLIC_TOOLS_HUB_FAQ.faqItems.find((item) =>
			item.title.startsWith('How do I schedule a post')
		);
		expect(scheduleFaq).toBeDefined();

		const anchors = extractFaqAnchors(scheduleFaq!.description);
		expect(anchors.some((anchor) => anchor.href === '/sign-up')).toBe(true);
		expect(anchors.some((anchor) => anchor.href === '/docs/channels/connect')).toBe(true);
	});
});
