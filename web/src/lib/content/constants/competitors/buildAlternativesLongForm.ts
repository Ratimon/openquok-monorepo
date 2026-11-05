import type {
	CompareDetailLongFormViewModel,
	CompareLongFormPeerLink,
	CompareProduct,
	CompareProductCategory,
	CompareProductSlug
} from '$lib/content/constants/competitors/types';

import { getRootPathPublicComparePair } from '$lib/area-public/constants/getRootPathPublicCompare';
import { getRootPathPublicAlternativesTarget } from '$lib/area-public/constants/getRootPathPublicAlternatives';
import {
	assembleDirectoryLongFormViewModel,
	assembleSocialAlternativesLongFormViewModel,
	buildDefaultSocialAlternativesLongFormContent
} from '$lib/content/constants/competitors/buildCompareLongFormSections';
import {
	COMPARE_HUB_BASE_SLUG,
	getCompareProduct,
	listComparePairsForHub
} from '$lib/content/constants/competitors/index';
import { getCompareProductCategory } from '$lib/content/constants/competitors/utils/compareProductCategories';
import { route, url } from '$lib/utils/path';

export function buildAlternativesLongFormViewModel(
	target: CompareProduct
): CompareDetailLongFormViewModel | null {
	const openQuok = getCompareProduct(COMPARE_HUB_BASE_SLUG);
	if (!openQuok) return null;

	const category = primaryAlternativesCategory(target);
	const peers = buildAlternativesLongFormPeers(target.slug, category);

	if (target.directoryLongForm) {
		return assembleDirectoryLongFormViewModel({
			competitor: target,
			openQuok,
			directoryLongForm: target.directoryLongForm,
			otherAlternativePeers: peers
		});
	}

	const content = target.alternativesLongForm ?? buildDefaultSocialAlternativesLongFormContent(target);
	return assembleSocialAlternativesLongFormViewModel({
		competitor: target,
		openQuok,
		content,
		otherAlternativePeers: peers
	});
}

function primaryAlternativesCategory(target: CompareProduct): CompareProductCategory {
	const category = getCompareProductCategory(target);
	return category === 'directory_submission' ? 'directory_submission' : 'social_scheduling';
}

function buildAlternativesLongFormPeers(
	targetSlug: CompareProductSlug,
	category: CompareProductCategory
): CompareLongFormPeerLink[] {
	return listComparePairsForHub(COMPARE_HUB_BASE_SLUG, category)
		.filter((pair) => pair.productBSlug !== targetSlug)
		.map((pair) => {
			const product = getCompareProduct(pair.productBSlug);
			return {
				name: pair.productBName,
				slug: pair.productBSlug,
				href: url(route(getRootPathPublicComparePair(pair.productASlug, pair.productBSlug))),
				description: product?.tagline ?? `Compare OpenQuok vs ${pair.productBName}.`
			};
		});
}

export function buildAlternativesPeerHubLinks(
	targetSlug: CompareProductSlug,
	otherTargetSlugs: readonly CompareProductSlug[]
): CompareLongFormPeerLink[] {
	return otherTargetSlugs
		.filter((slug) => slug !== targetSlug)
		.map((slug) => {
			const product = getCompareProduct(slug);
			if (!product) {
				throw new Error(`Unknown compare product slug: ${slug}`);
			}
			return {
				name: product.name,
				slug: product.slug,
				href: url(route(getRootPathPublicAlternativesTarget(product.slug))),
				description: `Compare alternatives to ${product.name}.`
			};
		});
}

/** Compare + alternatives hub links share slugs; keep one card per competitor (compare links first). */
export function mergeAlternativePeerLinksBySlug(
	comparePeers: readonly CompareLongFormPeerLink[],
	alternativesPeers: readonly CompareLongFormPeerLink[]
): CompareLongFormPeerLink[] {
	const seenSlugs = new Set(comparePeers.map((peer) => peer.slug));
	return [
		...comparePeers,
		...alternativesPeers.filter((peer) => !seenSlugs.has(peer.slug))
	];
}
