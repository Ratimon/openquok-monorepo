import { describe, expect, it } from 'vitest';

import { getComparePair, getCompareProductWebsiteUrl } from '$lib/content/constants/competitors';
import { trypostCompareProduct } from '$lib/content/constants/competitors/scheduler/trypost';

describe('trypostCompareProduct', () => {
	it('exposes slug, website URL, social category, and flat pricing', () => {
		expect(trypostCompareProduct.slug).toBe('trypost');
		expect(trypostCompareProduct.categories).toEqual(['social_scheduling']);
		expect(getCompareProductWebsiteUrl('trypost')).toBe('https://trypost.it/en');
		expect(trypostCompareProduct.pricingPlans.map((plan) => plan.monthlyPrice)).toEqual([19, 99]);
	});

	it('pairs with OpenQuok on the social matrix layout', () => {
		const pair = getComparePair('openquok', 'trypost');
		expect(pair).not.toBeNull();
		expect(pair!.layout).toBe('social_matrix');
	});
});