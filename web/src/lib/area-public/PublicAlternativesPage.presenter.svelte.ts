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
import { formatAlternativesHubPriceRange } from '$lib/content/constants/competitors/utils/comparePricing';
import { PUBLIC_ALTERNATIVES_HUB } from '$lib/content/constants/hubs/alternatives';
import {
	ALTERNATIVES_PATH_CATEGORY_SLUGS,
	PUBLIC_ALTERNATIVES_PATH_CATEGORIES,
	type AlternativesPathCategorySlug
} from '$lib/content/constants/hubs/alternativesPathCategories';
import type {
	AlternativesDetailFilters,
	AlternativesHubFilters,
	AlternativesHubSort
} from '$lib/content/constants/hubs/alternativesHubFilters';
import { DEFAULT_ALTERNATIVES_HUB_SORT } from '$lib/content/constants/hubs/alternativesHubFilters';
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
import { getRootPathPublicComparePair } from '$lib/area-public/constants/getRootPathPublicCompare';
import { publicFaqHref } from '$lib/content/utils/publicFaqLinks';

export type AlternativesHubEntryViewModel = {
	slug: CompareProductSlug;
	name: string;
	icon: IconName;
	href: string;
	title: string;
	description: string;
	/** Public list-price span across pricing plans (e.g. `$0–$49/mo`). */
	priceRangeLabel: string;
	/** Channel count or directory positioning for hub cards. */
	platformSupportLabel: string;
};

export type AlternativesHubSectionViewModel = {
	sectionId: string;
	subtitle: string;
	titlePrefix: string;
	titleHighlight: string;
	description: string;
	learnMoreHref: string;
	learnMoreLabel: string;
	entries: AlternativesHubEntryViewModel[];
};

export type AlternativesHubViewModel = {
	metaTitle: string;
	metaDescription: string;
	keywords: string[];
	eyebrow: string;
	heroTitlePrefix: string;
	heroHighlightText: string;
	description: string;
	socialSection: AlternativesHubSectionViewModel;
	directorySection: AlternativesHubSectionViewModel;
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
	isOpenQuokTarget: boolean;
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
	buildPathCategoryHubVm(categorySlug: AlternativesPathCategorySlug): AlternativesHubViewModel {
		const config = PUBLIC_ALTERNATIVES_PATH_CATEGORIES[categorySlug];
		const base = this.buildHubVm();

		return {
			...base,
			metaTitle: config.metaTitle,
			metaDescription: config.metaDescription,
			keywords: [...config.keywords],
			heroTitlePrefix: config.heroTitlePrefix,
			heroHighlightText: config.heroHighlightText,
			description: config.heroDescription
		};
	}

	listPathCategoriesForIndex(): Array<{
		slug: AlternativesPathCategorySlug;
		name: string;
		description: string;
		entryCount: number;
	}> {
		const hubVm = this.buildHubVm();

		return ALTERNATIVES_PATH_CATEGORY_SLUGS.map((slug) => {
			const config = PUBLIC_ALTERNATIVES_PATH_CATEGORIES[slug];
			const section =
				config.hubFilterCategory === 'social'
					? hubVm.socialSection
					: hubVm.directorySection;

			return {
				slug,
				name: config.name,
				description: config.description,
				entryCount: section.entries.length
			};
		});
	}

	buildHubVm(): AlternativesHubViewModel {
		const allEntries = ALTERNATIVES_TARGET_SLUGS.map((slug) => this.buildHubEntryVm(slug));
		const socialEntries = [
			this.buildOpenQuokHubEntry(),
			...allEntries.filter(
				(entry) =>
					getCompareProductCategory(getCompareProduct(entry.slug)!) === 'social_scheduling'
			)
		];
		const directoryEntries = allEntries.filter(
			(entry) =>
				getCompareProductCategory(getCompareProduct(entry.slug)!) === 'directory_submission'
		);

		return {
			metaTitle: PUBLIC_ALTERNATIVES_HUB.metaTitle,
			metaDescription: PUBLIC_ALTERNATIVES_HUB.metaDescription,
			keywords: [...PUBLIC_ALTERNATIVES_HUB.keywords],
			eyebrow: PUBLIC_ALTERNATIVES_HUB.eyebrow,
			heroTitlePrefix: PUBLIC_ALTERNATIVES_HUB.heroTitlePrefix,
			heroHighlightText: PUBLIC_ALTERNATIVES_HUB.heroHighlightText,
			description: PUBLIC_ALTERNATIVES_HUB.description,
			socialSection: buildAlternativesHubSection('social_scheduling', socialEntries),
			directorySection: buildAlternativesHubSection('directory_submission', directoryEntries)
		};
	}

	buildOpenQuokHubEntry(): AlternativesHubEntryViewModel {
		const product = getCompareProduct(COMPARE_HUB_BASE_SLUG);
		if (!product) {
			throw new Error(`Unknown compare product slug: ${COMPARE_HUB_BASE_SLUG}`);
		}

		return buildAlternativesHubEntryFromProduct(product, {
			title: 'OpenQuok alternatives',
			description:
				'Compare schedulers and directory services teams use instead of OpenQuok. You can compare prices, channels, and features.'
		});
	}

	buildDetailVm(
		targetSlug: CompareProductSlug,
		detailFilters: AlternativesDetailFilters = { sort: DEFAULT_ALTERNATIVES_HUB_SORT }
	): AlternativesDetailViewModel | null {
		const targetProduct = getCompareProduct(targetSlug);
		if (!targetProduct) return null;

		const isOpenQuokTarget = targetSlug === COMPARE_HUB_BASE_SLUG;

		const alternatives = listAlternativeProductsFor(targetSlug);
		let listings = alternatives.map((product, index) =>
			this.buildListingVm(product, targetProduct, index + 1)
		);

		if (detailFilters.sort !== DEFAULT_ALTERNATIVES_HUB_SORT) {
			listings = sortAlternativesDetailListings(listings, detailFilters.sort);
		}

		const otherTargets = ALTERNATIVES_TARGET_SLUGS.filter((slug) => {
			if (slug === targetSlug) return false;
			const peer = getCompareProduct(slug);
			return peer != null && canCompareProducts(targetProduct, peer);
		}).map((slug) => this.buildHubEntryVm(slug));

		const openQuok = getCompareProduct(COMPARE_HUB_BASE_SLUG);
		if (!openQuok) return null;

		const isDirectoryTarget =
			!isOpenQuokTarget &&
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

		const comparePair = isOpenQuokTarget
			? null
			: getComparePair(COMPARE_HUB_BASE_SLUG, targetSlug);
		const withWithoutSection =
			comparePair?.withWithoutSection ??
			({
				subtitle: 'comparisons',
				title: isOpenQuokTarget
					? 'Alternatives to OpenQuok'
					: `Alternatives to ${targetProduct.name}`,
				description: isOpenQuokTarget
					? 'See how schedulers and directory services compare to OpenQuok.'
					: `See how options compare to ${targetProduct.name}.`,
				withoutTitle: isOpenQuokTarget ? 'Other products' : targetProduct.name,
				withTitle: openQuok.name,
				points: []
			} satisfies PublicAgentComparisonSection);

		const compareRowSource = isOpenQuokTarget
			? []
			: isDirectoryTarget
				? PUBLIC_PRICING_COMPARE_ROWS.filter((row) => row.line === 'directory')
				: PUBLIC_PRICING_COMPARE_ROWS;

		const compareRows = compareRowSource.map((row) => ({
			id: row.id,
			label: row.label,
			tooltip: row.tooltip,
			left: openQuok.featureSupport[row.id] ?? { kind: 'excluded' as const },
			right: targetProduct.featureSupport[row.id] ?? { kind: 'excluded' as const }
		}));

		const channelSections = isOpenQuokTarget
			? {
					socialChannelsSection: null,
					directoryCoverageSection: null
				}
			: buildCompareChannelSectionsForPair(openQuok, targetProduct);

		const alternativeCountLabel =
			listings.length === 1 ? '1 top alternative' : `${listings.length} top alternatives`;

		const metaTitle = isOpenQuokTarget
			? 'Best OpenQuok Alternatives'
			: `Best ${targetProduct.name} Alternatives`;
		const metaDescription = isOpenQuokTarget
			? `Compare alternatives to OpenQuok. See social schedulers and directory submission services. Compare prices, channels, and agent tools. See ${alternativeCountLabel}.`
			: `Compare alternatives to ${targetProduct.name}. See ranked schedulers with prices, channels, and agent tools. OpenQuok is the open-source option with a $0 self-host software fee or a 7-day hosted trial. See ${alternativeCountLabel}.`;

		return {
			metaTitle,
			metaDescription,
			keywords: buildAlternativesDetailKeywords(
				targetProduct.name,
				isDirectoryTarget,
				isOpenQuokTarget
			),
			eyebrow: 'Alternatives',
			title: `${targetProduct.name} alternatives`,
			description: isOpenQuokTarget
				? 'See schedulers and directory services teams evaluate instead of OpenQuok. You can compare prices, channels, and features.'
				: `See alternatives to ${targetProduct.name}. You can compare prices, channels, and features.`,
			targetSlug: targetProduct.slug,
			targetName: targetProduct.name,
			targetIcon: targetProduct.icon,
			targetTagline: targetProduct.tagline,
			targetOverview: targetProduct.overview,
			listings,
			otherTargets,
			longForm,
			isDirectoryTarget,
			isOpenQuokTarget,
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

	filterHubVm(hubVm: AlternativesHubViewModel, searchQuery: string): AlternativesHubViewModel {
		return this.applyHubFilters(hubVm, { category: 'all', sort: 'name_asc', search: searchQuery });
	}

	applyHubFilters(
		hubVm: AlternativesHubViewModel,
		filters: AlternativesHubFilters
	): AlternativesHubViewModel {
		const searchQuery = filters.search ?? '';
		const showSocial = filters.category === 'all' || filters.category === 'social';
		const showDirectory = filters.category === 'all' || filters.category === 'directory';

		return {
			...hubVm,
			socialSection: showSocial
				? applyHubFiltersToSection(
						hubVm.socialSection,
						searchQuery,
						filters.sort,
						this.filterHubEntries.bind(this)
					)
				: { ...hubVm.socialSection, entries: [] },
			directorySection: showDirectory
				? applyHubFiltersToSection(
						hubVm.directorySection,
						searchQuery,
						filters.sort,
						this.filterHubEntries.bind(this)
					)
				: { ...hubVm.directorySection, entries: [] }
		};
	}

	private buildHubEntryVm(slug: CompareProductSlug): AlternativesHubEntryViewModel {
		const product = getCompareProduct(slug);
		if (!product) {
			throw new Error(`Unknown compare product slug: ${slug}`);
		}

		return buildAlternativesHubEntryFromProduct(product);
	}

	private buildListingVm(
		product: CompareProduct,
		targetProduct: CompareProduct,
		rank: number
	): AlternativesListingViewModel {
		const pair =
			targetProduct.slug === COMPARE_HUB_BASE_SLUG
				? getComparePair(product.slug, COMPARE_HUB_BASE_SLUG)
				: getComparePair(product.slug, targetProduct.slug);
		const comparePath = pair
			? getRootPathPublicComparePair(pair.productASlug, pair.productBSlug)
			: getRootPathPublicAlternativesComparePair(product.slug, targetProduct.slug);

		return {
			rank,
			slug: product.slug,
			name: product.name,
			icon: product.icon,
			tagline: product.tagline,
			overview: product.overview,
			detailDescription: buildAlternativeDetailDescription(product, targetProduct),
			websiteUrl: getCompareProductWebsiteUrl(product.slug),
			compareHref: url(route(comparePath)),
			isOpenQuok: product.slug === COMPARE_HUB_BASE_SLUG
		};
	}
}

export function formatAlternativesHubPlatformSupport(product: CompareProduct): string {
	if (getCompareProductCategory(product) === 'directory_submission') {
		return '100+ platforms';
	}

	const count = resolveHubEntryPlatformCount(product);
	return count === 1 ? '1 platform' : `${count} platforms`;
}

function buildAlternativesHubEntryFromProduct(
	product: CompareProduct,
	copy?: { title?: string; description?: string }
): AlternativesHubEntryViewModel {
	return {
		slug: product.slug,
		name: product.name,
		icon: product.icon,
		href: url(route(getRootPathPublicAlternativesTarget(product.slug))),
		title: copy?.title ?? `${product.name} alternatives`,
		description:
			copy?.description ??
			`Compare alternatives to ${product.name}. You can compare prices, channels, and features.`,
		priceRangeLabel: formatAlternativesHubPriceRange(product.pricingPlans),
		platformSupportLabel: formatAlternativesHubPlatformSupport(product)
	};
}

export function resolveHubEntryLowestPrice(product: CompareProduct): number | null {
	const prices = product.pricingPlans
		.map((plan) => plan.monthlyPrice)
		.filter((price): price is number => price != null);
	if (prices.length === 0) return null;
	return Math.min(...prices);
}

export function resolveHubEntryPlatformCount(product: CompareProduct): number {
	return product.channels.length;
}

export function sortAlternativesHubEntries(
	entries: AlternativesHubEntryViewModel[],
	sort: AlternativesHubSort,
	resolveProduct: (slug: CompareProductSlug) => CompareProduct | undefined = getCompareProduct
): AlternativesHubEntryViewModel[] {
	return [...entries].sort((left, right) => {
		const leftProduct = resolveProduct(left.slug);
		const rightProduct = resolveProduct(right.slug);

		if (sort === 'name_asc' || !leftProduct || !rightProduct) {
			return left.name.localeCompare(right.name);
		}

		if (sort === 'price_asc') {
			const leftPrice = resolveHubEntryLowestPrice(leftProduct);
			const rightPrice = resolveHubEntryLowestPrice(rightProduct);
			if (leftPrice === null && rightPrice === null) {
				return left.name.localeCompare(right.name);
			}
			if (leftPrice === null) return 1;
			if (rightPrice === null) return -1;
			if (leftPrice !== rightPrice) return leftPrice - rightPrice;
			return left.name.localeCompare(right.name);
		}

		const leftPlatforms = resolveHubEntryPlatformCount(leftProduct);
		const rightPlatforms = resolveHubEntryPlatformCount(rightProduct);
		if (leftPlatforms !== rightPlatforms) return rightPlatforms - leftPlatforms;
		return left.name.localeCompare(right.name);
	});
}

export function sortAlternativesDetailListings(
	listings: AlternativesListingViewModel[],
	sort: AlternativesHubSort
): AlternativesListingViewModel[] {
	const sortedSlugs = sortAlternativesHubEntries(
		listings.map((listing) => {
			const product = getCompareProduct(listing.slug);
			if (!product) {
				throw new Error(`Unknown compare product slug: ${listing.slug}`);
			}
			return buildAlternativesHubEntryFromProduct(product, {
				title: listing.name,
				description: listing.overview
			});
		}),
		sort
	).map((entry) => entry.slug);

	return sortedSlugs.map((slug, index) => {
		const listing = listings.find((row) => row.slug === slug);
		if (!listing) {
			throw new Error(`Missing alternatives listing for slug: ${slug}`);
		}
		return { ...listing, rank: index + 1 };
	});
}

function applyHubFiltersToSection(
	section: AlternativesHubSectionViewModel,
	searchQuery: string,
	sort: AlternativesHubSort,
	filterEntries: (
		entries: AlternativesHubEntryViewModel[],
		query: string
	) => AlternativesHubEntryViewModel[]
): AlternativesHubSectionViewModel {
	const filtered = filterEntries(section.entries, searchQuery);
	const pinnedOpenQuok = filtered.find((entry) => entry.slug === COMPARE_HUB_BASE_SLUG);
	const peers = filtered.filter((entry) => entry.slug !== COMPARE_HUB_BASE_SLUG);
	const sortedPeers = sortAlternativesHubEntries(peers, sort);
	const entries = pinnedOpenQuok ? [pinnedOpenQuok, ...sortedPeers] : sortedPeers;

	return {
		...section,
		entries
	};
}

function buildAlternativeDetailDescription(
	product: CompareProduct,
	targetProduct: CompareProduct
): string {
	if (targetProduct.slug === COMPARE_HUB_BASE_SLUG) {
		return `${product.name} is for ${product.comparison.builtFor}. ${product.name} ${product.comparison.positioningWhenLeft}.`;
	}

	if (product.slug === COMPARE_HUB_BASE_SLUG) {
		if (targetProduct.slug === 'postiz') {
			return `${product.name} is open source. Self-host for a $0 software fee (${publicFaqHref.selfHostingLanding}), or start a 7-day hosted trial. Teams leave ${targetProduct.name} for separate workspaces, unlimited AI writer, directory extension autofill, Reddit drafts you submit yourself, and scheduling from skills, MCP, and the Public API.`;
		}
		return `${product.name} is open source. Self-host for a $0 software fee (${publicFaqHref.selfHostingLanding}), or start a 7-day hosted trial. Teams leave ${targetProduct.name} for ${product.comparison.headline}, separate workspaces, and scheduling from skills, MCP, and the Public API.`;
	}

	return `${product.name} is for ${product.comparison.builtFor}. ${product.name} ${product.comparison.positioningWhenLeft}.`;
}

function buildAlternativesHubSection(
	category: 'social_scheduling' | 'directory_submission',
	entries: AlternativesHubEntryViewModel[]
): AlternativesHubSectionViewModel {
	const config =
		category === 'directory_submission'
			? PUBLIC_ALTERNATIVES_HUB.directorySection
			: PUBLIC_ALTERNATIVES_HUB.socialSection;

	return {
		sectionId: config.sectionId,
		subtitle: config.subtitle,
		titlePrefix: config.titlePrefix,
		titleHighlight: config.titleHighlight,
		description: config.description,
		learnMoreHref: config.learnMoreHref,
		learnMoreLabel: config.learnMoreLabel,
		entries
	};
}

function buildAlternativesDetailKeywords(
	competitorName: string,
	isDirectoryTarget: boolean,
	isOpenQuokTarget = false
): string[] {
	if (isOpenQuokTarget) {
		return [
			'OpenQuok alternatives',
			'best OpenQuok alternative',
			'open source social media scheduler alternatives',
			'directory submission service alternatives',
			'social media scheduler alternatives',
			'agent social media scheduling'
		];
	}

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
