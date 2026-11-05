import { describe, expect, it } from 'vitest';

import { icons } from '$data/icons';

import {
	COMPARE_PRODUCT_CATEGORIES_DIRECTORY_SUBMISSION,
	COMPARE_PRODUCT_WEBSITE_URLS
} from '$lib/content/constants/competitors/shared';
import { getmorebacklinksCompareProduct } from '$lib/content/constants/competitors/getmorebacklinks';
import { getCompareProductWebsiteUrl } from '$lib/content/constants/competitors/index';

describe('getmorebacklinksCompareProduct', () => {
	it('registers slug, icon, category, and official website URL', () => {
		expect(getmorebacklinksCompareProduct.slug).toBe('getmorebacklinks');
		expect(getmorebacklinksCompareProduct.icon).toBe(icons.GetMoreBacklinks.name);
		expect(getmorebacklinksCompareProduct.categories).toEqual(
			COMPARE_PRODUCT_CATEGORIES_DIRECTORY_SUBMISSION
		);
		expect(COMPARE_PRODUCT_WEBSITE_URLS.getmorebacklinks).toBe('https://www.getmorebacklinks.org/');
		expect(getCompareProductWebsiteUrl('getmorebacklinks')).toBe(
			'https://www.getmorebacklinks.org/'
		);
	});

	it('models per-website one-time directory packages from public pricing tiers', () => {
		expect(getmorebacklinksCompareProduct.channels).toEqual([]);
		expect(getmorebacklinksCompareProduct.pricingPlans.map((plan) => plan.monthlyPrice)).toEqual([
			379, 579, 779
		]);
		expect(
			getmorebacklinksCompareProduct.pricingPlans.every((plan) => plan.pricePeriod === 'one_time')
		).toBe(true);
	});

	it('ships directory long-form sections for compare and alternatives layouts', () => {
		const { directoryLongForm } = getmorebacklinksCompareProduct;
		expect(directoryLongForm).toBeDefined();
		expect(directoryLongForm!.whyPeopleLook.navLabel).toBe('Why people look');
		expect(directoryLongForm!.whenTheyWin.title).toContain('GetMoreBacklinks');
	});
});
