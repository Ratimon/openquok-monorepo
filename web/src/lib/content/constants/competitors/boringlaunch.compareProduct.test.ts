import { describe, expect, it } from 'vitest';

import { icons } from '$data/icons';

import {
	COMPARE_PRODUCT_CATEGORIES_DIRECTORY_SUBMISSION,
	COMPARE_PRODUCT_WEBSITE_URLS
} from '$lib/content/constants/competitors/shared';
import { boringlaunchCompareProduct } from '$lib/content/constants/competitors/boringlaunch';
import { getCompareProductWebsiteUrl } from '$lib/content/constants/competitors/index';

describe('boringlaunchCompareProduct', () => {
	it('registers slug, icon, category, and official website URL', () => {
		expect(boringlaunchCompareProduct.slug).toBe('boringlaunch');
		expect(boringlaunchCompareProduct.icon).toBe(icons.BoringLaunch.name);
		expect(boringlaunchCompareProduct.categories).toEqual(
			COMPARE_PRODUCT_CATEGORIES_DIRECTORY_SUBMISSION
		);
		expect(COMPARE_PRODUCT_WEBSITE_URLS.boringlaunch).toBe('https://www.boringlaunch.com/');
		expect(getCompareProductWebsiteUrl('boringlaunch')).toBe('https://www.boringlaunch.com/');
	});

	it('models done-for-you directory pricing as one-time packages', () => {
		expect(boringlaunchCompareProduct.channels).toEqual([]);
		expect(boringlaunchCompareProduct.pricingPlans.length).toBeGreaterThanOrEqual(3);
		expect(
			boringlaunchCompareProduct.pricingPlans.every((plan) => plan.pricePeriod === 'one_time')
		).toBe(true);
		expect(boringlaunchCompareProduct.pricingPlans[0]?.monthlyPrice).toBe(149);
	});

	it('ships directory long-form sections for compare detail layout', () => {
		const { directoryLongForm } = boringlaunchCompareProduct;
		expect(directoryLongForm).toBeDefined();
		expect(directoryLongForm!.whyPeopleLook.id).toBe('why-people-look');
		expect(directoryLongForm!.yourOptions.navLabel).toBe('Your options');
		expect(directoryLongForm!.switchingChecklist.body.length).toBeGreaterThan(0);
		expect(directoryLongForm!.whenTheyWin.title).toContain('BoringLaunch');
	});

	it('sets directory feature rows without marking official platform APIs as included', () => {
		expect(boringlaunchCompareProduct.featureSupport.official_api).toEqual({
			kind: 'text',
			text: 'No Info'
		});
		expect(boringlaunchCompareProduct.featureSupport.directory_business_profiles?.kind).toBe('text');
	});
});
