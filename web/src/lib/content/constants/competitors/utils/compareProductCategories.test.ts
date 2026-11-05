import { describe, expect, it } from 'vitest';

import type { CompareProduct } from '$lib/content/constants/competitors/types';
import {
	bufferCompareProduct,
	boringlaunchCompareProduct,
	getComparePair,
	listComparePairsForHub,
	openquokCompareProduct
} from '$lib/content/constants/competitors/index';
import { buildComparePair } from '$lib/content/constants/competitors/buildComparePair';
import {
	canCompareProducts,
	categoriesOverlap,
	filterCompareProductsForCategory,
	getCompareProductCategory,
	listComparePairsForCategory,
	resolveComparePairLayout
} from '$lib/content/constants/competitors/utils/compareProductCategories';
import { publicComparePagePresenter } from '$lib/area-public/index';

const directoryOnlyProduct: CompareProduct = {
	slug: 'buffer',
	name: 'Directory Stub',
	icon: bufferCompareProduct.icon,
	categories: ['directory_submission'],
	tagline: 'stub',
	overview: 'stub',
	pricingPlans: [],
	channels: [],
	featureSupport: {},
	comparison: bufferCompareProduct.comparison
};

describe('compareProductCategories', () => {
	it('categoriesOverlap is true when products share a category', () => {
		expect(
			categoriesOverlap(openquokCompareProduct.categories, bufferCompareProduct.categories)
		).toBe(true);
	});

	it('canCompareProducts rejects same slug and cross-category pairs', () => {
		expect(canCompareProducts(openquokCompareProduct, openquokCompareProduct)).toBe(false);
		expect(canCompareProducts(openquokCompareProduct, bufferCompareProduct)).toBe(true);

		const socialOnly = { ...directoryOnlyProduct, categories: ['social_scheduling'] as const };
		const directoryOnly = { ...directoryOnlyProduct, categories: ['directory_submission'] as const };
		expect(canCompareProducts(socialOnly, directoryOnly)).toBe(false);
	});

	it('getCompareProductCategory prefers directory when that is the only category', () => {
		expect(getCompareProductCategory(openquokCompareProduct)).toBe('social_scheduling');
		expect(
			getCompareProductCategory({ ...openquokCompareProduct, categories: ['directory_submission'] })
		).toBe('directory_submission');
	});

	it('listComparePairsForCategory filters by category and compatibility', () => {
		const socialPairs = listComparePairsForCategory(
			[openquokCompareProduct, bufferCompareProduct, directoryOnlyProduct],
			openquokCompareProduct,
			'social_scheduling'
		);
		expect(socialPairs.map((pair) => pair.productBSlug)).toEqual(['buffer']);

		const directoryPairs = listComparePairsForCategory(
			[openquokCompareProduct, bufferCompareProduct, directoryOnlyProduct],
			openquokCompareProduct,
			'directory_submission'
		);
		expect(directoryPairs.map((pair) => pair.productBSlug)).toEqual(['buffer']);
	});

	it('filterCompareProductsForCategory lists OpenQuok in both hub sections', () => {
		const social = filterCompareProductsForCategory(
			[openquokCompareProduct, bufferCompareProduct],
			'social_scheduling'
		);
		expect(social.map((product) => product.slug)).toContain('openquok');

		const directory = filterCompareProductsForCategory(
			[openquokCompareProduct, bufferCompareProduct],
			'directory_submission'
		);
		expect(directory.map((product) => product.slug)).toEqual(['openquok']);
	});

	it('getComparePair returns null for unknown or incompatible slugs', () => {
		expect(getComparePair('buffer', 'boringlaunch')).toBeNull();
		expect(canCompareProducts(bufferCompareProduct, directoryOnlyProduct)).toBe(false);
	});

	it('listComparePairsForHub scopes directory_submission to directory peers only', () => {
		const directoryPairs = listComparePairsForHub('openquok', 'directory_submission');
		expect(directoryPairs.map((pair) => pair.productBSlug).sort()).toEqual([
			'boringlaunch',
			'getmorebacklinks'
		]);

		const socialPairs = listComparePairsForHub('openquok', 'social_scheduling');
		expect(socialPairs.map((pair) => pair.productBSlug)).toContain('buffer');
		expect(socialPairs.map((pair) => pair.productBSlug)).not.toContain('boringlaunch');
	});

	it('getComparePair resolves OpenQuok vs BoringLaunch for directory compare URLs', () => {
		const pair = getComparePair('openquok', 'boringlaunch');
		expect(pair).not.toBeNull();
		expect(pair!.layout).toBe('directory_long_form');
		expect(pair!.productASlug).toBe('openquok');
		expect(pair!.productBSlug).toBe('boringlaunch');
	});

	it('resolveComparePairLayout uses long-form layout for directory-only competitors', () => {
		expect(resolveComparePairLayout(openquokCompareProduct, bufferCompareProduct)).toBe(
			'social_matrix'
		);
		expect(resolveComparePairLayout(openquokCompareProduct, boringlaunchCompareProduct)).toBe(
			'directory_long_form'
		);
	});

	it('buildComparePair and buildDetailVm attach directory long-form data', () => {
		const pair = buildComparePair(openquokCompareProduct, boringlaunchCompareProduct);
		expect(pair.layout).toBe('directory_long_form');
		expect(pair.longForm?.competitorSlug).toBe('boringlaunch');

		const vm = publicComparePagePresenter.buildDetailVm(pair);
		expect(vm?.layout).toBe('directory_long_form');
		expect(vm?.channelsSection).not.toBeNull();
		expect(vm?.directoryCoverageSection).not.toBeNull();
		expect(vm?.compareRows.every((row) => row.id.startsWith('directory_'))).toBe(true);
		expect(vm?.longForm?.otherAlternativePeers.map((peer) => peer.slug)).toEqual([
			'getmorebacklinks'
		]);
		expect(vm?.faqItems.some((item) => item.title.includes('Domain Rating'))).toBe(true);
		expect(vm?.faqItems.length).toBeGreaterThan(3);
	});
});
