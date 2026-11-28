import { describe, expect, it } from 'vitest';

import { COMPARE_PRODUCT_WEBSITE_URLS } from '$lib/content/constants/competitors/shared';
import { launchdirectoriesCompareProduct } from '$lib/content/constants/competitors/submission/launchdirectories';

describe('launchdirectoriesCompareProduct', () => {
	it('matches directory submission registry expectations', () => {
		expect(launchdirectoriesCompareProduct.slug).toBe('launchdirectories');
		expect(launchdirectoriesCompareProduct.categories).toEqual(['directory_submission']);
		expect(COMPARE_PRODUCT_WEBSITE_URLS.launchdirectories).toBe('https://launchdirectories.com/');
		expect(launchdirectoriesCompareProduct.pricingPlans).toHaveLength(3);
		expect(launchdirectoriesCompareProduct.pricingPlans.every((plan) => plan.pricePeriod === 'one_time')).toBe(
			true
		);
		expect(launchdirectoriesCompareProduct.channels).toEqual([]);
		expect(launchdirectoriesCompareProduct.directoryLongForm).toBeDefined();
	});
});