import { describe, expect, it } from 'vitest';

import { createComparePricingOffers } from '$lib/content/constants/competitors/utils/createComparePricingOffersSchema';

describe('createComparePricingOffers', () => {
	it('scales Buffer Essentials and adds UnitPriceSpecification for list rate', () => {
		const offers = createComparePricingOffers({
			canonical: 'https://www.openquok.com/compare/openquok/buffer',
			productASlug: 'openquok',
			productBSlug: 'buffer',
			leftPricingUnit: 'flat',
			rightPricingUnit: 'per_channel',
			product: {
				slug: 'buffer',
				pricingUnit: 'per_channel',
				pricingPlans: [
					{
						name: 'Essentials',
						monthlyPrice: 6,
						tagline: 'Paid tier'
					}
				]
			}
		});

		expect(offers).toHaveLength(1);
		expect(offers[0]?.price).toBe('90');
		expect(offers[0]?.priceSpecification).toMatchObject({
			'@type': 'UnitPriceSpecification',
			price: '6'
		});
	});

	it('keeps OpenQuok Solo flat price at baseline channel count', () => {
		const offers = createComparePricingOffers({
			canonical: 'https://www.openquok.com/compare/openquok/buffer',
			productASlug: 'openquok',
			productBSlug: 'buffer',
			leftPricingUnit: 'flat',
			rightPricingUnit: 'per_channel',
			product: {
				slug: 'openquok',
				pricingUnit: 'flat',
				pricingPlans: [{ name: 'Solo', monthlyPrice: 29, tagline: 'Solo plan' }]
			}
		});

		expect(offers[0]?.price).toBe('29');
		expect(offers[0]?.priceSpecification).toBeUndefined();
	});
});
