import type {
	CompareHubPairViewModel,
	CompareProductSlug
} from '$lib/content/constants/competitors/types';

import { COMPARE_HUB_BASE_SLUG } from '$lib/content/constants/competitors/shared';

/** Canonical `productA/productB` keys for measured high-CTR peer compare URLs (no OpenQuok). */
export const HIGH_CTR_PEER_COMPARE_PAIR_KEYS: readonly string[] = [
	'blotato/buffer',
	'buffer/recurpost',
	'mixpost/postiz',
	'post-bridge/postiz'
] as const;

const highCtrPeerPairKeySet = new Set<string>(HIGH_CTR_PEER_COMPARE_PAIR_KEYS);

/** Peer slugs to cross-link from each `/alternatives/{slug}` detail page (Workstream 9.2). */
export const EMPHASIZED_PEER_COMPARE_BY_TARGET: Partial<
	Record<CompareProductSlug, readonly CompareProductSlug[]>
> = {
	blotato: ['buffer'],
	recurpost: ['buffer'],
	postiz: ['mixpost', 'post-bridge'],
	mixpost: ['postiz']
};

/** OpenQuok hub cards to surface first on `/compare` (social section). */
export const EMPHASIZED_OPENQUOK_COMPARE_PEER_SLUGS: readonly CompareProductSlug[] = [
	'postiz',
	'mixpost',
	'buffer',
	'recurpost',
	'blotato'
];

export function canonicalPeerComparePairKey(
	slugA: CompareProductSlug,
	slugB: CompareProductSlug
): string {
	if (slugA === slugB) return slugA;
	if (slugA === COMPARE_HUB_BASE_SLUG) return `${slugA}/${slugB}`;
	if (slugB === COMPARE_HUB_BASE_SLUG) return `${slugB}/${slugA}`;
	return slugA < slugB ? `${slugA}/${slugB}` : `${slugB}/${slugA}`;
}

export function isHighCtrPeerComparePair(
	leftSlug: CompareProductSlug,
	rightSlug: CompareProductSlug
): boolean {
	if (leftSlug === COMPARE_HUB_BASE_SLUG || rightSlug === COMPARE_HUB_BASE_SLUG) {
		return false;
	}
	return highCtrPeerPairKeySet.has(canonicalPeerComparePairKey(leftSlug, rightSlug));
}

export function sortCompareHubPairsWithEmphasis(
	pairs: CompareHubPairViewModel[],
	baseSlug: CompareProductSlug
): CompareHubPairViewModel[] {
	if (baseSlug !== COMPARE_HUB_BASE_SLUG) {
		return pairs;
	}

	const rank = new Map(
		EMPHASIZED_OPENQUOK_COMPARE_PEER_SLUGS.map((slug, index) => [slug, index])
	);
	const tailRank = rank.size;

	return [...pairs].sort((left, right) => {
		const leftRank = rank.get(left.productBSlug) ?? tailRank;
		const rightRank = rank.get(right.productBSlug) ?? tailRank;
		if (leftRank !== rightRank) return leftRank - rightRank;
		return left.productBName.localeCompare(right.productBName);
	});
}