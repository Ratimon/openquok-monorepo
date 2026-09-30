import { describe, expect, it } from 'vitest';

import { getPublicChannelBySlug } from '$lib/content/constants/channels/index';
import { PUBLIC_CHANNEL_LANDING_PAGES } from '$lib/content/constants/channels/catalog/seeds';
import {
	assertConnectFaqsHaveFunnelLinks,
	assertNoNofollowOnFirstPartyFaqLinks,
	assertSelfHostLabelsOnSocialIntegrationLinks
} from '$lib/content/utils/publicFaqFunnel.test-utils';

describe('channel catalog FAQ funnel links', () => {
	it('each channel page has connect FAQ funnel + self-host labels on setup links', () => {
		for (const seed of PUBLIC_CHANNEL_LANDING_PAGES) {
			const page = getPublicChannelBySlug(seed.slug);
			expect(page, `missing getter for ${seed.slug}`).toBeDefined();
			if (!page) continue;

			assertConnectFaqsHaveFunnelLinks(page.faqItems);
			assertSelfHostLabelsOnSocialIntegrationLinks(page.faqItems);
			assertNoNofollowOnFirstPartyFaqLinks(page.faqItems);
		}
	});
});
