import { describe, expect, it } from 'vitest';

import { PUBLIC_SELF_HOST_PRICING_FOOTNOTE_CONFIG } from '$lib/content/constants/publicSelfHostingLandingConfig';
import {
	createPublicPaidPlanOffers,
	createPublicPricingOffers,
	createPublicPricingSectionSEOSchema,
	createPublicSelfHostPricingOffer
} from '$lib/content/utils/createPublicPricingSEOSchema';

describe('createPublicPricingSEOSchema', () => {
	const pageUrl = 'https://www.openquok.com/social-media-posting-api';

	it('builds paid plan offers from the public pricing presenter', () => {
		const offers = createPublicPaidPlanOffers({ pageUrl });

		expect(offers.length).toBeGreaterThanOrEqual(4);
		expect(offers[0]).toMatchObject({
			'@type': 'Offer',
			category: 'subscription',
			priceCurrency: 'USD'
		});
	});

	it('includes the self-host $0 offer from footnote config', () => {
		const offer = createPublicSelfHostPricingOffer({
			pageUrl,
			origin: 'https://www.openquok.com'
		});

		expect(offer).toMatchObject({
			'@type': 'Offer',
			name: PUBLIC_SELF_HOST_PRICING_FOOTNOTE_CONFIG.headline,
			description: PUBLIC_SELF_HOST_PRICING_FOOTNOTE_CONFIG.body,
			price: '0',
			priceCurrency: 'USD',
			category: 'self-host'
		});
		expect(String(offer.url)).toContain('/self-hosting');
	});

	it('merges paid tiers and self-host into one offers list', () => {
		const offers = createPublicPricingOffers({ pageUrl, origin: 'https://www.openquok.com' });

		expect(offers).toHaveLength(createPublicPaidPlanOffers({ pageUrl }).length + 1);
		expect(offers.at(-1)?.price).toBe('0');
	});

	it('emits a WebPage node at #pricing for marketing landing sections', () => {
		const node = createPublicPricingSectionSEOSchema({
			pageUrl,
			origin: 'https://www.openquok.com'
		});

		expect(node).toMatchObject({
			'@type': 'WebPage',
			'@id': `${pageUrl}#pricing`,
			url: `${pageUrl}#pricing`
		});
		expect(Array.isArray(node.offers)).toBe(true);
		expect(node.offers?.length).toBeGreaterThanOrEqual(5);
	});
});
