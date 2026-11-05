import {
	ALTERNATIVES_TARGET_SLUGS,
	COMPARE_HUB_BASE_SLUG,
	canCompareProducts,
	getComparePair,
	getCompareProduct,
	getCompareProductWebsiteUrl,
	listAlternativeProductsFor,
	type CompareProduct,
	type CompareProductSlug
} from '$lib/content/constants/competitors';
import {
	buildCompareChannelSectionsForPair,
	type CompareDirectoryCoverageViewModel
} from '$lib/content/constants/competitors/utils/compareChannelSections';
import {
	buildAlternativesLongFormViewModel,
	buildAlternativesPeerHubLinks,
	mergeAlternativePeerLinksBySlug
} from '$lib/content/constants/competitors/buildAlternativesLongForm';
import { getCompareProductCategory } from '$lib/content/constants/competitors/utils/compareProductCategories';
import type { PublicAgentComparisonSection } from '$lib/content/constants/agents/types';
import type {
	CompareDetailLongFormViewModel
} from '$lib/content/constants/competitors/types';
import { PUBLIC_PRICING_COMPARE_ROWS } from '$lib/billing/constants/publicPricingCatalog';
import type {
	CompareFeatureRowViewModel,
	CompareProductSummaryViewModel
} from '$lib/area-public/PublicComparePage.presenter.svelte';
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
	longForm: CompareDetailLongFormViewModel;
	isDirectoryTarget: boolean;
	openQuokProduct: CompareProductSummaryViewModel;
	targetProduct: CompareProductSummaryViewModel;
	compareRows: CompareFeatureRowViewModel[];
	channelsSection: PublicAgentComparisonSection | null;
	directoryCoverageSection: CompareDirectoryCoverageViewModel | null;
	withWithoutSection: PublicAgentComparisonSection;
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

		const otherTargets = ALTERNATIVES_TARGET_SLUGS.filter((slug) => {
			if (slug === targetSlug) return false;
			const peer = getCompareProduct(slug);
			return peer != null && canCompareProducts(targetProduct, peer);
		}).map((slug) => this.buildHubEntryVm(slug));

		const openQuok = getCompareProduct(COMPARE_HUB_BASE_SLUG);
		if (!openQuok) return null;

		const isDirectoryTarget =
			getCompareProductCategory(targetProduct) === 'directory_submission';

		const builtLongForm = buildAlternativesLongFormViewModel(targetProduct);
		if (!builtLongForm) return null;

		const hubPeers = buildAlternativesPeerHubLinks(
			targetSlug,
			otherTargets.map((entry) => entry.slug)
		);
		const longForm: CompareDetailLongFormViewModel = {
			...builtLongForm,
			otherAlternativePeers: mergeAlternativePeerLinksBySlug(
				builtLongForm.otherAlternativePeers,
				hubPeers
			)
		};

		const comparePair = getComparePair(COMPARE_HUB_BASE_SLUG, targetSlug);
		const withWithoutSection =
			comparePair?.withWithoutSection ??
			({
				subtitle: 'comparisons',
				title: `Alternatives to ${targetProduct.name}`,
				description: `See how options compare to ${targetProduct.name}.`,
				withoutTitle: targetProduct.name,
				withTitle: openQuok.name,
				points: []
			} satisfies PublicAgentComparisonSection);

		const compareRowSource = isDirectoryTarget
			? PUBLIC_PRICING_COMPARE_ROWS.filter((row) => row.line === 'directory')
			: PUBLIC_PRICING_COMPARE_ROWS;

		const compareRows = compareRowSource.map((row) => ({
			id: row.id,
			label: row.label,
			tooltip: row.tooltip,
			left: openQuok.featureSupport[row.id] ?? { kind: 'excluded' as const },
			right: targetProduct.featureSupport[row.id] ?? { kind: 'excluded' as const }
		}));

		const channelSections = buildCompareChannelSectionsForPair(openQuok, targetProduct);

		const alternativeCountLabel =
			listings.length === 1 ? '1 top alternative' : `${listings.length} top alternatives`;

		return {
			metaTitle: `Best ${targetProduct.name} Alternatives`,
			metaDescription: `Compare alternatives to ${targetProduct.name}. See prices, channels, and agent tools. OpenQuok ranks first as an open-source option. Self-host for a $0 software fee, or start a 7-day hosted trial. See ${alternativeCountLabel}.`,
			keywords: buildAlternativesDetailKeywords(targetProduct.name, isDirectoryTarget),
			eyebrow: 'Alternatives',
			title: `${targetProduct.name} alternatives`,
			description: `See alternatives to ${targetProduct.name}. You can compare prices, channels, and features.`,
			targetSlug: targetProduct.slug,
			targetName: targetProduct.name,
			targetIcon: targetProduct.icon,
			targetTagline: targetProduct.tagline,
			targetOverview: targetProduct.overview,
			listings,
			otherTargets,
			longForm,
			isDirectoryTarget,
			openQuokProduct: toProductSummary(openQuok),
			targetProduct: toProductSummary(targetProduct),
			compareRows,
			channelsSection: channelSections.socialChannelsSection,
			directoryCoverageSection: channelSections.directoryCoverageSection,
			withWithoutSection
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
			description: `Compare alternatives to ${product.name}. You can compare prices, channels, and features.`
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
		return `${product.name} is open source. Self-host for a $0 software fee (${publicFaqHref.selfHostingLanding}), or start a 7-day hosted trial. Teams leave ${targetProduct.name} for ${product.comparison.headline}, separate workspaces, and scheduling from skills, MCP, and the Public API.`;
	}

	return `${product.name} is for ${product.comparison.builtFor}. ${product.name} ${product.comparison.positioningWhenLeft}.`;
}

function buildAlternativesDetailKeywords(
	competitorName: string,
	isDirectoryTarget: boolean
): string[] {
	if (isDirectoryTarget) {
		return [
			`${competitorName} alternatives`,
			`best ${competitorName} alternative`,
			'directory submission service alternatives',
			'done for you directory submissions',
			'DIY directory launch',
			`${competitorName} pricing`,
			'startup directory launch'
		];
	}

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

function toProductSummary(product: CompareProduct): CompareProductSummaryViewModel {
	return {
		slug: product.slug,
		name: product.name,
		icon: product.icon,
		tagline: product.tagline,
		overview: product.overview,
		pricingUnit: product.pricingUnit ?? 'flat',
		pricingPlans: product.pricingPlans,
		channels: product.channels
	};
}
