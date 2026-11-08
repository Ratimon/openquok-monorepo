import { describe, expect, it } from 'vitest';

import { COMPARE_PRODUCT_WEBSITE_URLS, getCompareProduct } from '$lib/content/constants/competitors';
import { launchrepoCompareProduct } from '$lib/content/constants/competitors/submission/launchrepo';

describe('launchrepoCompareProduct', () => {
	it('registers slug, website URL, category, and one-time pricing', () => {
		expect(launchrepoCompareProduct.slug).toBe('launchrepo');
		expect(launchrepoCompareProduct.categories).toEqual(['directory_submission']);
		expect(COMPARE_PRODUCT_WEBSITE_URLS.launchrepo).toBe('https://launchrepo.dev/');
		expect(getCompareProduct('launchrepo')).toBe(launchrepoCompareProduct);
		expect(launchrepoCompareProduct.pricingPlans).toHaveLength(1);
		expect(launchrepoCompareProduct.pricingPlans[0]?.pricePeriod).toBe('one_time');
		expect(launchrepoCompareProduct.pricingPlans[0]?.monthlyPrice).toBe(130);
	});
});
