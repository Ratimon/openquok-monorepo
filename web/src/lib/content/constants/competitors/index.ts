import { PUBLIC_FAQ_ITEMS, type PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import { PUBLIC_PRICING_COMPARE_ROWS } from '$lib/billing/constants/publicPricingCatalog';

import type {
	CompareHubPairViewModel,
	ComparePair,
	CompareProduct,
	CompareProductSlug,
	PublicFaqItemId
} from '$lib/content/constants/competitors/types';
import { buildComparePair } from '$lib/content/constants/competitors/buildComparePair';
import { bufferCompareProduct } from '$lib/content/constants/competitors/buffer';
import { hootsuiteCompareProduct } from '$lib/content/constants/competitors/hootsuite';
import { openquokCompareProduct } from '$lib/content/constants/competitors/openquok';
import {
	COMPARE_HUB_BASE_SLUG,
	COMPARE_PRODUCT_WEBSITE_URLS
} from '$lib/content/constants/competitors/shared';

export * from '$lib/content/constants/competitors/types';
export * from '$lib/content/constants/competitors/shared';
export { buildComparePair } from '$lib/content/constants/competitors/buildComparePair';
export { openquokCompareProduct } from '$lib/content/constants/competitors/openquok';
export { hootsuiteCompareProduct } from '$lib/content/constants/competitors/hootsuite';
export { bufferCompareProduct } from '$lib/content/constants/competitors/buffer';

export const PUBLIC_COMPARE_PRODUCTS: readonly CompareProduct[] = [
	openquokCompareProduct,
	hootsuiteCompareProduct,
	bufferCompareProduct
];

const FAQ_ITEM_INDEX_BY_ID: Record<PublicFaqItemId, number> = {
	'switch-from-buffer-hootsuite': 0,
	'try-free': 1,
	'multi-workspace': 5
};

const productBySlug = new Map(PUBLIC_COMPARE_PRODUCTS.map((product) => [product.slug, product]));

export function getCompareProduct(slug: string): CompareProduct | undefined {
	const key = slug.trim().toLowerCase() as CompareProductSlug;
	return productBySlug.get(key);
}

export function getComparePair(productA: string, productB: string): ComparePair | null {
	const left = getCompareProduct(productA);
	const right = getCompareProduct(productB);
	if (!left || !right || left.slug === right.slug) return null;

	return buildComparePair(left, right);
}

export function listComparePairsForHub(
	baseSlug: CompareProductSlug = COMPARE_HUB_BASE_SLUG
): CompareHubPairViewModel[] {
	const baseProduct = getCompareProduct(baseSlug);
	if (!baseProduct) return [];

	return PUBLIC_COMPARE_PRODUCTS.filter((product) => product.slug !== baseSlug).map((rightProduct) => ({
		productASlug: baseProduct.slug,
		productBSlug: rightProduct.slug,
		productBName: rightProduct.name
	}));
}

export function resolvePublicFaqItemsByIds(ids: readonly PublicFaqItemId[]): PublicFaqItem[] {
	return ids
		.map((id) => {
			const index = FAQ_ITEM_INDEX_BY_ID[id];
			return PUBLIC_FAQ_ITEMS[index];
		})
		.filter((item): item is PublicFaqItem => item != null);
}

/** Row labels shared with the pricing comparison table. */
export const PUBLIC_COMPARE_FEATURE_ROW_IDS = PUBLIC_PRICING_COMPARE_ROWS.map((row) => row.id);

/** Competitor slugs that have a public `/alternatives/{slug}` directory page. */
export const ALTERNATIVES_TARGET_SLUGS = PUBLIC_COMPARE_PRODUCTS.filter(
	(product) => product.slug !== COMPARE_HUB_BASE_SLUG
).map((product) => product.slug);

export function getCompareProductWebsiteUrl(slug: CompareProductSlug): string {
	return COMPARE_PRODUCT_WEBSITE_URLS[slug];
}

export function isAlternativesTargetSlug(slug: string): slug is CompareProductSlug {
	return ALTERNATIVES_TARGET_SLUGS.includes(slug.trim().toLowerCase() as CompareProductSlug);
}

/** Alternatives to `targetSlug`, with OpenQuok ranked first when present. */
export function listAlternativeProductsFor(targetSlug: CompareProductSlug): CompareProduct[] {
	const target = getCompareProduct(targetSlug);
	if (!target) return [];

	return PUBLIC_COMPARE_PRODUCTS.filter((product) => product.slug !== target.slug).sort((left, right) => {
		if (left.slug === COMPARE_HUB_BASE_SLUG) return -1;
		if (right.slug === COMPARE_HUB_BASE_SLUG) return 1;
		return left.name.localeCompare(right.name);
	});
}
