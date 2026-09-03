import {
	ALTERNATIVES_TARGET_SLUGS,
	COMPARE_HUB_BASE_SLUG,
	getCompareProduct,
	getCompareProductWebsiteUrl,
	listAlternativeProductsFor,
	type CompareProduct,
	type CompareProductSlug
} from '$lib/content/constants/publicCompareConfig';
import type { IconName } from '$data/icons';

import { route, url } from '$lib/utils/path';

import {
	getRootPathPublicAlternativesComparePair,
	getRootPathPublicAlternativesTarget
} from '$lib/area-public/constants/getRootPathPublicAlternatives';
import { publicFaqHref } from '$lib/content/utils/publicFaqLinks';

export type AlternativesHubEntryViewModel = {
	slug: CompareProductSlug;
	name: string;
	icon: IconName;
	href: string;
	title: string;
	description: string;
};

export type AlternativesHubViewModel = {
	metaTitle: string;
	metaDescription: string;
	keywords: string[];
	eyebrow: string;
	title: string;
	description: string;
	entries: AlternativesHubEntryViewModel[];
};

export type AlternativesListingViewModel = {
	rank: number;
	slug: CompareProductSlug;
	name: string;
	icon: IconName;
	tagline: string;
	overview: string;
	detailDescription: string;
	websiteUrl: string;
	compareHref: string;
	isOpenQuok: boolean;
};

export type AlternativesDetailViewModel = {
	metaTitle: string;
	metaDescription: string;
	keywords: string[];
	eyebrow: string;
	title: string;
	description: string;
	targetSlug: CompareProductSlug;
	targetName: string;
	targetIcon: IconName;
	targetTagline: string;
	targetOverview: string;
	listings: AlternativesListingViewModel[];
	otherTargets: AlternativesHubEntryViewModel[];
};

export class PublicAlternativesPagePresenter {
	/**
	 * Hub SEO for `/alternatives`. Targets competitor-replacement intent (e.g.
	 * "Hootsuite alternatives", "Buffer alternatives") — not the $0 self-host path.
	 * Free-operator positioning lives on `/self-hosting`.
	 *
	 * - `metaTitle` / `metaDescription` / `keywords` → `createMetaData` via hub `+page.server.ts` (`customTags`)
	 * - `title` / `description` → visible H1 and hero paragraph (SSR body copy)
	 *
	 * Per-competitor pages (`/alternatives/{slug}`) use `buildDetailVm` and
	 * `buildAlternativesDetailKeywords`. OpenQuok #1 listing body copy is set in
	 * `buildAlternativeDetailDescription`.
	 */
	buildHubVm(): AlternativesHubViewModel {
		const entries = ALTERNATIVES_TARGET_SLUGS.map((slug) => this.buildHubEntryVm(slug));

		return {
			metaTitle: 'Social Media Scheduler Alternatives',
			metaDescription:
				'Compare Buffer, Hootsuite, Later, and other social media management tools side by side. See pricing, channels, and agent workflows — and how OpenQuok compares for multi-workspace scheduling.',
			keywords: [
				'social media scheduler alternatives',
				'social media management tool alternatives',
				'buffer alternatives',
				'hootsuite alternatives',
				'later alternatives',
				'sprout social alternatives',
				'social media management tools',
				'agent social media scheduling',
				'multi-workspace scheduler',
				'open source social media scheduler'
			],
			eyebrow: 'Alternatives',
			title: 'Compare social media scheduler alternatives',
			description:
				`Side-by-side directories for popular schedulers — pricing, channels, and agent workflows. OpenQuok is open source; for the $0 operator-run path, see ${publicFaqHref.selfHostingLanding}.`,
			entries
		};
	}

	buildDetailVm(targetSlug: CompareProductSlug): AlternativesDetailViewModel | null {
		const targetProduct = getCompareProduct(targetSlug);
		if (!targetProduct || targetSlug === COMPARE_HUB_BASE_SLUG) return null;

		const alternatives = listAlternativeProductsFor(targetSlug);
		const listings = alternatives.map((product, index) =>
			this.buildListingVm(product, targetProduct, index + 1)
		);

		const otherTargets = ALTERNATIVES_TARGET_SLUGS.filter((slug) => slug !== targetSlug).map((slug) =>
			this.buildHubEntryVm(slug)
		);

		const alternativeCountLabel =
			listings.length === 1 ? '1 top alternative' : `${listings.length} top alternatives`;

		return {
			metaTitle: `Best ${targetProduct.name} Alternatives`,
			metaDescription: `Compare alternatives to ${targetProduct.name} for social media scheduling — pricing, channels, and agent workflows. OpenQuok ranks #1 as an open-source option; self-host for a $0 software fee or start a hosted 7-day trial. See ${alternativeCountLabel}.`,
			keywords: buildAlternativesDetailKeywords(targetProduct.name),
			eyebrow: 'Alternatives',
			title: `${targetProduct.name} alternatives`,
			description: `Compare alternatives to ${targetProduct.name} for social media management, scheduling, and agent-driven publishing.`,
			targetSlug: targetProduct.slug,
			targetName: targetProduct.name,
			targetIcon: targetProduct.icon,
			targetTagline: targetProduct.tagline,
			targetOverview: targetProduct.overview,
			listings,
			otherTargets
		};
	}

	filterHubEntries(
		entries: AlternativesHubEntryViewModel[],
		searchQuery: string
	): AlternativesHubEntryViewModel[] {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return entries;

		return entries.filter((entry) => {
			const haystack = `${entry.name} ${entry.title} ${entry.description}`.toLowerCase();
			return haystack.includes(query);
		});
	}

	private buildHubEntryVm(slug: CompareProductSlug): AlternativesHubEntryViewModel {
		const product = getCompareProduct(slug);
		if (!product) {
			throw new Error(`Unknown compare product slug: ${slug}`);
		}

		return {
			slug: product.slug,
			name: product.name,
			icon: product.icon,
			href: url(route(getRootPathPublicAlternativesTarget(product.slug))),
			title: `${product.name} alternatives`,
			description: `Compare alternatives to ${product.name} for social media management, scheduling, and analytics.`
		};
	}

	private buildListingVm(
		product: CompareProduct,
		targetProduct: CompareProduct,
		rank: number
	): AlternativesListingViewModel {
		return {
			rank,
			slug: product.slug,
			name: product.name,
			icon: product.icon,
			tagline: product.tagline,
			overview: product.overview,
			detailDescription: buildAlternativeDetailDescription(product, targetProduct),
			websiteUrl: getCompareProductWebsiteUrl(product.slug),
			compareHref: url(
				route(getRootPathPublicAlternativesComparePair(product.slug, targetProduct.slug))
			),
			isOpenQuok: product.slug === COMPARE_HUB_BASE_SLUG
		};
	}
}

function buildAlternativeDetailDescription(
	product: CompareProduct,
	targetProduct: CompareProduct
): string {
	if (product.slug === COMPARE_HUB_BASE_SLUG) {
		return `${product.name} is 100% open source — self-host for a $0 software fee (${publicFaqHref.selfHostingLanding}) or try hosted with a 7-day trial. Teams switch from ${targetProduct.name} for ${product.comparison.headline}, multi-workspace isolation, and programmatic scheduling through skills, MCP, and the Public API.`;
	}

	return `${product.name} is built for ${product.comparison.builtFor}. ${product.comparison.positioningWhenLeft.charAt(0).toUpperCase()}${product.comparison.positioningWhenLeft.slice(1)}.`;
}

function buildAlternativesDetailKeywords(competitorName: string): string[] {
	return [
		`${competitorName} alternatives`,
		`best ${competitorName} alternative`,
		`${competitorName} competitor`,
		`open source ${competitorName} alternative`,
		`${competitorName} open source alternative`,
		'social media scheduler alternatives',
		'social media management tools',
		'agent social media scheduling',
		'multi-workspace scheduler'
	];
}
