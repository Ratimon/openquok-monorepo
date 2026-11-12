import { describe, expect, it } from 'vitest';

import { publicComparePagePresenter } from '$lib/area-public';
import {
	PUBLIC_COMPARE_PRODUCTS,
	canCompareProducts,
	getComparePair,
	listComparePairsForHub
} from '$lib/content/constants/competitors';
import {
	canonicalCompareDetailParamSlugs,
	listPrerenderableCompareDetailParams
} from '$lib/seo/prerender/listPrerenderableCompareDetailParams';

describe('canonicalCompareDetailParamSlugs', () => {
	it('keeps OpenQuok as productA like hub compare cards', () => {
		expect(canonicalCompareDetailParamSlugs('openquok', 'buffer')).toEqual(['openquok', 'buffer']);
		expect(canonicalCompareDetailParamSlugs('buffer', 'openquok')).toEqual(['openquok', 'buffer']);
	});

	it('uses lexicographic order for peer pairs without OpenQuok', () => {
		expect(canonicalCompareDetailParamSlugs('hootsuite', 'buffer')).toEqual(['buffer', 'hootsuite']);
	});
});

describe('listPrerenderableCompareDetailParams', () => {
	const entries = listPrerenderableCompareDetailParams();

	it('returns a non-empty list within the valid pair bound', () => {
		const maxPairs = (PUBLIC_COMPARE_PRODUCTS.length * (PUBLIC_COMPARE_PRODUCTS.length - 1)) / 2;
		expect(entries.length).toBeGreaterThan(0);
		expect(entries.length).toBeLessThanOrEqual(maxPairs);
	});

	it('includes a known OpenQuok vs social scheduler smoke path', () => {
		expect(entries).toContainEqual({ productA: 'openquok', productB: 'buffer' });
	});

	it('resolves every entry with getComparePair and buildDetailVm', () => {
		for (const { productA, productB } of entries) {
			const pair = getComparePair(productA, productB);
			expect(pair, `${productA}/${productB}`).not.toBeNull();
			expect(publicComparePagePresenter.buildDetailVm(pair!)).not.toBeNull();
		}
	});

	it('has no duplicate canonical paths', () => {
		const keys = entries.map(({ productA, productB }) => `${productA}/${productB}`);
		expect(new Set(keys).size).toBe(keys.length);
	});

	it('matches hub-listed OpenQuok pairs for both categories', () => {
		const hubSlugs = new Set(
			[
				...listComparePairsForHub('openquok', 'social_scheduling'),
				...listComparePairsForHub('openquok', 'directory_submission')
			].map((pair) => `${pair.productASlug}/${pair.productBSlug}`)
		);

		for (const hubKey of hubSlugs) {
			expect(entries.map((e) => `${e.productA}/${e.productB}`)).toContain(hubKey);
		}
	});

	it('only emits pairs that canCompareProducts', () => {
		for (const { productA, productB } of entries) {
			const left = PUBLIC_COMPARE_PRODUCTS.find((p) => p.slug === productA);
			const right = PUBLIC_COMPARE_PRODUCTS.find((p) => p.slug === productB);
			expect(left && right && canCompareProducts(left, right)).toBe(true);
		}
	});
});
