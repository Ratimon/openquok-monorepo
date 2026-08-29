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
	 * Hub SEO for `/alternatives`. Targets free/open-source alternative intent (e.g.
	 * "free Hootsuite alternative", "open source social media scheduler").
	 *
	 * - `metaTitle` / `metaDescription` / `keywords` → `createMetaData` via hub `+page.server.ts` (`customTags`)
	 * - `title` / `description` → visible H1 and hero paragraph (SSR body copy)
	 *
	 * Per-competitor pages (`/alternatives/{slug}`) use `buildDetailVm` and
	 * `buildAlternativesDetailKeywords`. OpenQuok #1 listing body copy is set in
	 * `buildAlternativeDetailDescription`.
	 * eg. Best alternatives to Hootsuite”
	 */
	buildHubVm(): AlternativesHubViewModel {
		const entries = ALTERNATIVES_TARGET_SLUGS.map((slug) => this.buildHubEntryVm(slug));

		return {
			metaTitle: 'Free & Open-Source Social Media Scheduler Alternatives',
			metaDescription:
				'Compare free and open-source social media management tools. OpenQuok is 100% open source — self-host for free or start a 7-day trial — with agent workflows, multi-workspace publishing, and analytics.',
			keywords: [
				'free social media scheduler',
				'open source social media scheduler',
				'free social media management tools',
				'open source social media management',
				'social media scheduler alternatives',
				'free hootsuite alternative',
				'free buffer alternative',
				'agent social media scheduling',
				'multi-workspace scheduler'
			],
			eyebrow: 'Alternatives',
			title: 'Find a free or the best open-source alternative',
			description:
				'Compare free and open-source social media schedulers — including OpenQuok, which you can self-host at no cost or try hosted with a 7-day trial.',
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
			metaTitle: `Best Free & Open-Source ${targetProduct.name} Alternatives`,
			metaDescription: `Compare free and open-source alternatives to ${targetProduct.name} for social media scheduling. OpenQuok ranks #1 — 100% open source, self-host for free, or start a 7-day trial. See ${alternativeCountLabel} on pricing, channels, and agent workflows.`,
			keywords: buildAlternativesDetailKeywords(targetProduct.name),
			eyebrow: 'Alternatives',
			title: `${targetProduct.name} alternatives`,
			description: `Compare free and open-source alternatives to ${targetProduct.name} for social media management, scheduling, and agent-driven publishing.`,
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
			description: `Discover free and open-source alternatives to ${product.name} for social media management, scheduling, and analytics.`
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
		return `${product.name} is 100% open source — self-host for free or try hosted with a 7-day trial. Teams switch from ${targetProduct.name} for ${product.comparison.headline}, multi-workspace isolation, and programmatic scheduling through skills, MCP, and the Public API.`;
	}

	return `${product.name} is built for ${product.comparison.builtFor}. ${product.comparison.positioningWhenLeft.charAt(0).toUpperCase()}${product.comparison.positioningWhenLeft.slice(1)}.`;
}

function buildAlternativesDetailKeywords(competitorName: string): string[] {
	// Per-slug meta keywords — mirrors GSC head terms for free/open-source competitor alternatives.
	return [
		`${competitorName} alternatives`,
		`best ${competitorName} alternative`,
		`free ${competitorName} alternative`,
		`free ${competitorName} alternatives`,
		`${competitorName} free alternative`,
		`open source ${competitorName} alternative`,
		`${competitorName} open source alternative`,
		`${competitorName} competitor`,
		'free social media scheduler',
		'open source social media scheduler',
		'social media scheduler alternatives',
		'social media management tools',
		'agent social media scheduling',
		'multi-workspace scheduler'
	];
}
