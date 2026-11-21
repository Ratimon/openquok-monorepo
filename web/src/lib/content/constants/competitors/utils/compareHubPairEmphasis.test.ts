import { describe, expect, it } from 'vitest';

import {
	getComparePair,
	listComparePairsForHub
} from '$lib/content/constants/competitors';

import {
	canonicalPeerComparePairKey,
	EMPHASIZED_OPENQUOK_COMPARE_PEER_SLUGS,
	EMPHASIZED_PEER_COMPARE_BY_TARGET,
	HIGH_CTR_PEER_COMPARE_PAIR_KEYS,
	isHighCtrPeerComparePair,
	sortCompareHubPairsWithEmphasis
} from '$lib/content/constants/competitors/utils/compareHubPairEmphasis';

describe('compareHubPairEmphasis', () => {
	it('resolves every high-CTR peer pair key with getComparePair', () => {
		for (const key of HIGH_CTR_PEER_COMPARE_PAIR_KEYS) {
			const [productA, productB] = key.split('/');
			expect(getComparePair(productA, productB), key).not.toBeNull();
		}
	});

	it('canonicalPeerComparePairKey matches sitemap slug order', () => {
		expect(canonicalPeerComparePairKey('buffer', 'blotato')).toBe('blotato/buffer');
		expect(canonicalPeerComparePairKey('postiz', 'mixpost')).toBe('mixpost/postiz');
		expect(canonicalPeerComparePairKey('openquok', 'buffer')).toBe('openquok/buffer');
	});

	it('isHighCtrPeerComparePair matches measured winner pairs only', () => {
		expect(isHighCtrPeerComparePair('blotato', 'buffer')).toBe(true);
		expect(isHighCtrPeerComparePair('openquok', 'buffer')).toBe(false);
		expect(isHighCtrPeerComparePair('hootsuite', 'buffer')).toBe(false);
	});

	it('sortCompareHubPairsWithEmphasis surfaces Postiz and Mixpost before alphabetical tail', () => {
		const pairs = listComparePairsForHub('openquok', 'social_scheduling');
		const slugs = pairs.map((pair) => pair.productBSlug);
		expect(slugs.indexOf('postiz')).toBeLessThan(slugs.indexOf('hootsuite'));
		expect(slugs.indexOf('mixpost')).toBeLessThan(slugs.indexOf('hootsuite'));
		expect(slugs.indexOf('recurpost')).toBeLessThan(slugs.indexOf('typefully'));
	});

	it('sortCompareHubPairsWithEmphasis ranks Postiz first on the OpenQuok hub (WS9.2 / WS11)', () => {
		const pairs = listComparePairsForHub('openquok', 'social_scheduling');
		const sorted = sortCompareHubPairsWithEmphasis(pairs, 'openquok');
		const emphasized = sorted.filter((pair) =>
			EMPHASIZED_OPENQUOK_COMPARE_PEER_SLUGS.includes(pair.productBSlug)
		);
		expect(emphasized[0]?.productBSlug).toBe('postiz');
	});

	it('resolves every emphasized peer compare mapping with getComparePair', () => {
		for (const [targetSlug, peerSlugs] of Object.entries(EMPHASIZED_PEER_COMPARE_BY_TARGET)) {
			for (const peerSlug of peerSlugs ?? []) {
				expect(getComparePair(targetSlug, peerSlug), `${targetSlug}/${peerSlug}`).not.toBeNull();
			}
		}
	});
});