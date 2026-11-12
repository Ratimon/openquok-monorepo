import { publicComparePagePresenter } from '$lib/area-public';
import {
	PUBLIC_COMPARE_PRODUCTS,
	canCompareProducts,
	getComparePair
} from '$lib/content/constants/competitors';
import { COMPARE_HUB_BASE_SLUG } from '$lib/content/constants/competitors/shared';
import type { CompareProductSlug } from '$lib/content/constants/competitors/types';

export type CompareDetailPrerenderParams = {
	productA: CompareProductSlug;
	productB: CompareProductSlug;
};

/** Stable URL slug order for prerender entries — matches hub cards (OpenQuok left) and dedupes peer pairs. */
export function canonicalCompareDetailParamSlugs(
	slugA: CompareProductSlug,
	slugB: CompareProductSlug
): [CompareProductSlug, CompareProductSlug] {
	if (slugA === COMPARE_HUB_BASE_SLUG) return [slugA, slugB];
	if (slugB === COMPARE_HUB_BASE_SLUG) return [slugB, slugA];
	return slugA < slugB ? [slugA, slugB] : [slugB, slugA];
}

export function listPrerenderableCompareDetailParams(): CompareDetailPrerenderParams[] {
	const entries: CompareDetailPrerenderParams[] = [];
	const seen = new Set<string>();

	for (const left of PUBLIC_COMPARE_PRODUCTS) {
		for (const right of PUBLIC_COMPARE_PRODUCTS) {
			if (left.slug === right.slug || !canCompareProducts(left, right)) continue;

			const [productA, productB] = canonicalCompareDetailParamSlugs(left.slug, right.slug);
			const key = `${productA}/${productB}`;
			if (seen.has(key)) continue;
			seen.add(key);

			const pair = getComparePair(productA, productB);
			if (!pair) continue;

			const detailVm = publicComparePagePresenter.buildDetailVm(pair);
			if (!detailVm) continue;

			entries.push({ productA, productB });
		}
	}

	return entries;
}
