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
import { blotatoCompareProduct } from '$lib/content/constants/competitors/scheduler/blotato';
import { bufferCompareProduct } from '$lib/content/constants/competitors/scheduler/buffer';
import { breakreachCompareProduct } from '$lib/content/constants/competitors/scheduler/breakreach';
import { clawPostCompareProduct } from '$lib/content/constants/competitors/scheduler/claw-post';
import { hopperHqCompareProduct } from '$lib/content/constants/competitors/scheduler/hopper-hq';
import { influenceCompareProduct } from '$lib/content/constants/competitors/scheduler/influence';
import { heropostCompareProduct } from '$lib/content/constants/competitors/scheduler/heropost';
import { hootsuiteCompareProduct } from '$lib/content/constants/competitors/scheduler/hootsuite';
import { laterCompareProduct } from '$lib/content/constants/competitors/scheduler/later';
import { mixpostCompareProduct } from '$lib/content/constants/competitors/scheduler/mixpost';
import { openpostCompareProduct } from '$lib/content/constants/competitors/scheduler/openpost';
import { openquokCompareProduct } from '$lib/content/constants/competitors/scheduler/openquok';
import { postBridgeCompareProduct } from '$lib/content/constants/competitors/scheduler/post-bridge';
import { postfastCompareProduct } from '$lib/content/constants/competitors/scheduler/postfast';
import { post2allCompareProduct } from '$lib/content/constants/competitors/scheduler/post2all';
import { postpeerCompareProduct } from '$lib/content/constants/competitors/scheduler/postpeer';
import { postizCompareProduct } from '$lib/content/constants/competitors/scheduler/postiz';
import { publerCompareProduct } from '$lib/content/constants/competitors/scheduler/publer';
import { recurpostCompareProduct } from '$lib/content/constants/competitors/scheduler/recurpost';
import { socialclawCompareProduct } from '$lib/content/constants/competitors/scheduler/socialclaw';
import { socialyncCompareProduct } from '$lib/content/constants/competitors/scheduler/socialync';
import { sproutSocialCompareProduct } from '$lib/content/constants/competitors/scheduler/sprout-social';
import { typefullyCompareProduct } from '$lib/content/constants/competitors/scheduler/typefully';
import { usebardCompareProduct } from '$lib/content/constants/competitors/scheduler/usebard';
import { boringlaunchCompareProduct } from '$lib/content/constants/competitors/submission/boringlaunch';
import { getmorebacklinksCompareProduct } from '$lib/content/constants/competitors/submission/getmorebacklinks';
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
export { openquokCompareProduct } from '$lib/content/constants/competitors/scheduler/openquok';
export { hopperHqCompareProduct } from '$lib/content/constants/competitors/scheduler/hopper-hq';
export { influenceCompareProduct } from '$lib/content/constants/competitors/scheduler/influence';
export { getmorebacklinksCompareProduct } from '$lib/content/constants/competitors/submission/getmorebacklinks';
export { heropostCompareProduct } from '$lib/content/constants/competitors/scheduler/heropost';
export { hootsuiteCompareProduct } from '$lib/content/constants/competitors/scheduler/hootsuite';
export { laterCompareProduct } from '$lib/content/constants/competitors/scheduler/later';
export { mixpostCompareProduct } from '$lib/content/constants/competitors/scheduler/mixpost';
export { openpostCompareProduct } from '$lib/content/constants/competitors/scheduler/openpost';
export { blotatoCompareProduct } from '$lib/content/constants/competitors/scheduler/blotato';
export { boringlaunchCompareProduct } from '$lib/content/constants/competitors/submission/boringlaunch';
export { bufferCompareProduct } from '$lib/content/constants/competitors/scheduler/buffer';
export { breakreachCompareProduct } from '$lib/content/constants/competitors/scheduler/breakreach';
export { clawPostCompareProduct } from '$lib/content/constants/competitors/scheduler/claw-post';
export { postBridgeCompareProduct } from '$lib/content/constants/competitors/scheduler/post-bridge';
export { postfastCompareProduct } from '$lib/content/constants/competitors/scheduler/postfast';
export { post2allCompareProduct } from '$lib/content/constants/competitors/scheduler/post2all';
export { postpeerCompareProduct } from '$lib/content/constants/competitors/scheduler/postpeer';
export { postizCompareProduct } from '$lib/content/constants/competitors/scheduler/postiz';
export { publerCompareProduct } from '$lib/content/constants/competitors/scheduler/publer';
export { recurpostCompareProduct } from '$lib/content/constants/competitors/scheduler/recurpost';
export { socialclawCompareProduct } from '$lib/content/constants/competitors/scheduler/socialclaw';
export { socialyncCompareProduct } from '$lib/content/constants/competitors/scheduler/socialync';
export { sproutSocialCompareProduct } from '$lib/content/constants/competitors/scheduler/sprout-social';
export { typefullyCompareProduct } from '$lib/content/constants/competitors/scheduler/typefully';
export { usebardCompareProduct } from '$lib/content/constants/competitors/scheduler/usebard';

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
