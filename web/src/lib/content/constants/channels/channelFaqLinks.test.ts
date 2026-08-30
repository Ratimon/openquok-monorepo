import { describe, expect, it } from 'vitest';

import { PUBLIC_CHANNEL_LANDING_PAGES } from '$lib/content/constants/channels/index';
import {
	assertConnectFaqsHaveFunnelLinks,
	assertFaqJsonLdPlainTextAnswers,
	assertNoNofollowOnFirstPartyFaqLinks,
	assertSelfHostLabelsOnSocialIntegrationLinks
} from '$lib/content/utils/publicFaqFunnel.test-utils';

describe('channel landing FAQ funnel links', () => {
	for (const channel of PUBLIC_CHANNEL_LANDING_PAGES) {
		describe(channel.slug, () => {
			it('labels every social-integration link with self-host', () => {
				assertSelfHostLabelsOnSocialIntegrationLinks(channel.faqItems);
			});

			it('prioritizes sign-up or connect guide in connect FAQs', () => {
				assertConnectFaqsHaveFunnelLinks(channel.faqItems);
			});

			it('avoids nofollow on first-party anchors', () => {
				assertNoNofollowOnFirstPartyFaqLinks(channel.faqItems);
			});
		});
	}

	it('youtube connect FAQ JSON-LD matches visible accordion text', () => {
		const youtube = PUBLIC_CHANNEL_LANDING_PAGES.find((channel) => channel.slug === 'youtube');
		expect(youtube).toBeDefined();

		assertFaqJsonLdPlainTextAnswers({
			pageUrl: 'https://www.openquok.com/channels/youtube#faq',
			items: youtube!.faqItems
		});
	});
});
