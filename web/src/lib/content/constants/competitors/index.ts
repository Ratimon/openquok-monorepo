import {
	resolvePublicFaqItemsByIds,
	type PublicFaqItem
} from '$lib/content/constants/faq';
import { PUBLIC_PRICING_COMPARE_ROWS } from '$lib/billing/constants/publicPricingCatalog';

import type {
	CompareHubPairViewModel,
	ComparePair,
	CompareProduct,
	CompareProductCategory,
	CompareProductSlug,
	PublicFaqItemId
} from '$lib/content/constants/competitors/types';
import { buildComparePair } from '$lib/content/constants/competitors/buildComparePair';
import {
	canCompareProducts,
	filterCompareProductsForCategory,
	getCompareProductCategory,
	listComparePairsForCategory
} from '$lib/content/constants/competitors/utils/compareProductCategories';
import { blotatoCompareProduct } from '$lib/content/constants/competitors/blotato';
import { boringlaunchCompareProduct } from '$lib/content/constants/competitors/boringlaunch';
import { bufferCompareProduct } from '$lib/content/constants/competitors/buffer';
import { breakreachCompareProduct } from '$lib/content/constants/competitors/breakreach';
import { clawPostCompareProduct } from '$lib/content/constants/competitors/claw-post';
import { hopperHqCompareProduct } from '$lib/content/constants/competitors/hopper-hq';
import { influenceCompareProduct } from '$lib/content/constants/competitors/influence';
import { getmorebacklinksCompareProduct } from '$lib/content/constants/competitors/getmorebacklinks';
import { heropostCompareProduct } from '$lib/content/constants/competitors/heropost';
import { hootsuiteCompareProduct } from '$lib/content/constants/competitors/hootsuite';
import { laterCompareProduct } from '$lib/content/constants/competitors/later';
import { mixpostCompareProduct } from '$lib/content/constants/competitors/mixpost';
import { openpostCompareProduct } from '$lib/content/constants/competitors/openpost';
import { openquokCompareProduct } from '$lib/content/constants/competitors/openquok';
import { postBridgeCompareProduct } from '$lib/content/constants/competitors/post-bridge';
import { postfastCompareProduct } from '$lib/content/constants/competitors/postfast';
import { post2allCompareProduct } from '$lib/content/constants/competitors/post2all';
import { postpeerCompareProduct } from '$lib/content/constants/competitors/postpeer';
import { postizCompareProduct } from '$lib/content/constants/competitors/postiz';
import { publerCompareProduct } from '$lib/content/constants/competitors/publer';
import { recurpostCompareProduct } from '$lib/content/constants/competitors/recurpost';
import { socialclawCompareProduct } from '$lib/content/constants/competitors/socialclaw';
import { socialyncCompareProduct } from '$lib/content/constants/competitors/socialync';
import { sproutSocialCompareProduct } from '$lib/content/constants/competitors/sprout-social';
import { typefullyCompareProduct } from '$lib/content/constants/competitors/typefully';
import { usebardCompareProduct } from '$lib/content/constants/competitors/usebard';
import {
	COMPARE_HUB_BASE_SLUG,
	COMPARE_PRODUCT_WEBSITE_URLS
} from '$lib/content/constants/competitors/shared';

export * from '$lib/content/constants/competitors/types';
export * from '$lib/content/constants/competitors/shared';
export * from '$lib/content/constants/competitors/utils/comparePricing';
export {
	canCompareProducts,
	getCompareProductCategory,
	isDirectoryOnlyCompareProduct,
	resolveComparePairLayout
} from '$lib/content/constants/competitors/utils/compareProductCategories';
export { openquokCompareProduct } from '$lib/content/constants/competitors/openquok';
export { hopperHqCompareProduct } from '$lib/content/constants/competitors/hopper-hq';
export { influenceCompareProduct } from '$lib/content/constants/competitors/influence';
export { getmorebacklinksCompareProduct } from '$lib/content/constants/competitors/getmorebacklinks';
export { heropostCompareProduct } from '$lib/content/constants/competitors/heropost';
export { hootsuiteCompareProduct } from '$lib/content/constants/competitors/hootsuite';
export { laterCompareProduct } from '$lib/content/constants/competitors/later';
export { mixpostCompareProduct } from '$lib/content/constants/competitors/mixpost';
export { openpostCompareProduct } from '$lib/content/constants/competitors/openpost';
export { blotatoCompareProduct } from '$lib/content/constants/competitors/blotato';
export { boringlaunchCompareProduct } from '$lib/content/constants/competitors/boringlaunch';
export { bufferCompareProduct } from '$lib/content/constants/competitors/buffer';
export { breakreachCompareProduct } from '$lib/content/constants/competitors/breakreach';
export { clawPostCompareProduct } from '$lib/content/constants/competitors/claw-post';
export { postBridgeCompareProduct } from '$lib/content/constants/competitors/post-bridge';
export { postfastCompareProduct } from '$lib/content/constants/competitors/postfast';
export { post2allCompareProduct } from '$lib/content/constants/competitors/post2all';
export { postpeerCompareProduct } from '$lib/content/constants/competitors/postpeer';
export { postizCompareProduct } from '$lib/content/constants/competitors/postiz';
export { publerCompareProduct } from '$lib/content/constants/competitors/publer';
export { recurpostCompareProduct } from '$lib/content/constants/competitors/recurpost';
export { socialclawCompareProduct } from '$lib/content/constants/competitors/socialclaw';
export { socialyncCompareProduct } from '$lib/content/constants/competitors/socialync';
export { sproutSocialCompareProduct } from '$lib/content/constants/competitors/sprout-social';
export { typefullyCompareProduct } from '$lib/content/constants/competitors/typefully';
export { usebardCompareProduct } from '$lib/content/constants/competitors/usebard';

export const PUBLIC_COMPARE_PRODUCTS: readonly CompareProduct[] = [
	openquokCompareProduct,
	hootsuiteCompareProduct,
	heropostCompareProduct,
	hopperHqCompareProduct,
	influenceCompareProduct,
	laterCompareProduct,
	bufferCompareProduct,
	blotatoCompareProduct,
	boringlaunchCompareProduct,
	getmorebacklinksCompareProduct,
	breakreachCompareProduct,
	clawPostCompareProduct,
	recurpostCompareProduct,
	mixpostCompareProduct,
	openpostCompareProduct,
	postBridgeCompareProduct,
	postfastCompareProduct,
	postpeerCompareProduct,
	post2allCompareProduct,
	postizCompareProduct,
	publerCompareProduct,
	socialclawCompareProduct,
	socialyncCompareProduct,
	sproutSocialCompareProduct,
	typefullyCompareProduct,
	usebardCompareProduct
];

const productBySlug = new Map(PUBLIC_COMPARE_PRODUCTS.map((product) => [product.slug, product]));

export function getCompareProduct(slug: string): CompareProduct | undefined {
	const key = slug.trim().toLowerCase() as CompareProductSlug;
	return productBySlug.get(key);
}

export function getComparePair(productA: string, productB: string): ComparePair | null {
	const left = getCompareProduct(productA);
	const right = getCompareProduct(productB);
	if (!left || !right || !canCompareProducts(left, right)) return null;

	return buildComparePair(left, right);
}

export function listComparePairsForHub(
	baseSlug: CompareProductSlug = COMPARE_HUB_BASE_SLUG,
	category?: CompareProductCategory
): CompareHubPairViewModel[] {
	const baseProduct = getCompareProduct(baseSlug);
	if (!baseProduct) return [];

	return listComparePairsForCategory(PUBLIC_COMPARE_PRODUCTS, baseProduct, category);
}

export function listCompareProductsForHubDropdown(
	category: CompareProductCategory
): CompareProduct[] {
	return filterCompareProductsForCategory(PUBLIC_COMPARE_PRODUCTS, category);
}

export { resolvePublicFaqItemsByIds };

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

	return PUBLIC_COMPARE_PRODUCTS.filter((product) => {
		if (product.slug === target.slug) return false;
		if (product.slug === COMPARE_HUB_BASE_SLUG) return true;
		return canCompareProducts(target, product);
	}).sort((left, right) => {
		if (left.slug === COMPARE_HUB_BASE_SLUG) return -1;
		if (right.slug === COMPARE_HUB_BASE_SLUG) return 1;
		return left.name.localeCompare(right.name);
	});
}
