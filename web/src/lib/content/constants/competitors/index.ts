import { PUBLIC_FAQ_ITEMS, type PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import { PUBLIC_PRICING_COMPARE_ROWS } from '$lib/billing/constants/publicPricingCatalog';

import type {
	CompareHubPairViewModel,
	ComparePair,
	CompareProduct,
	CompareProductSlug,
	PublicFaqItemId
} from '$lib/content/constants/competitors/types';
import { hootsuiteCompareProduct, openquokWithHootsuiteComparison } from '$lib/content/constants/competitors/hootsuite';
import { openquokCompareProduct } from '$lib/content/constants/competitors/openquok';

export * from '$lib/content/constants/competitors/types';
export * from '$lib/content/constants/competitors/shared';
export { openquokCompareProduct } from '$lib/content/constants/competitors/openquok';
export { hootsuiteCompareProduct, openquokWithHootsuiteComparison } from '$lib/content/constants/competitors/hootsuite';

export const PUBLIC_COMPARE_PRODUCTS: readonly CompareProduct[] = [
	openquokCompareProduct,
	hootsuiteCompareProduct
];

export const PUBLIC_COMPARE_PAIRS: readonly ComparePair[] = [
	{
		productASlug: 'openquok',
		productBSlug: 'hootsuite',
		metaTitle: 'OpenQuok vs Hootsuite — Social Media Scheduler Comparison',
		metaDescription:
			'Compare OpenQuok and Hootsuite on pricing, channels, agent workspaces, MCP access, and scheduling features. See which social media scheduler fits your team.',
		keywords: [
			'OpenQuok vs Hootsuite',
			'Hootsuite alternative',
			'social media scheduler comparison',
			'agent social media scheduling',
			'Hootsuite pricing',
			'OpenQuok pricing',
			'AI agent social media',
			'multi-workspace scheduler'
		],
		heroTitle: 'OpenQuok vs Hootsuite comparison',
		heroDescription:
			'See how OpenQuok stacks up against Hootsuite on pricing, channels, team workflows, and agent-native features. Start with a 7-day free trial — no credit card required.',
		withWithoutSection: openquokWithHootsuiteComparison,
		faqItemIds: ['switch-from-buffer-hootsuite', 'try-free', 'multi-workspace']
	}
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
	const a = productA.trim().toLowerCase();
	const b = productB.trim().toLowerCase();
	if (a !== 'openquok') return null;

	return (
		PUBLIC_COMPARE_PAIRS.find(
			(pair) => pair.productASlug === a && pair.productBSlug === (b as CompareProductSlug)
		) ?? null
	);
}

export function listComparePairsForHub(baseSlug: CompareProductSlug = 'openquok'): CompareHubPairViewModel[] {
	return PUBLIC_COMPARE_PAIRS.filter((pair) => pair.productASlug === baseSlug).map((pair) => {
		const competitor = getCompareProduct(pair.productBSlug);
		return {
			productASlug: pair.productASlug,
			competitorSlug: pair.productBSlug,
			competitorName: competitor?.name ?? pair.productBSlug
		};
	});
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
