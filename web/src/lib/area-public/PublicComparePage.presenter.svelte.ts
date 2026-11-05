import type { PublicAgentComparisonSection } from '$lib/content/constants/agents';
import {
	COMPARE_HUB_BASE_SLUG,
	getCompareProduct,
	listComparePairsForHub,
	listCompareProductsForHubDropdown,
	PUBLIC_COMPARE_PRODUCTS,
	resolvePublicFaqItemsByIds,
	type CompareDetailLongFormViewModel,
	type CompareFeatureCell,
	type ComparePair,
	type ComparePairLayout,
	type ComparePricingPlan,
	type ComparePricingUnit,
	type CompareProductCategory,
	type CompareProductSlug
} from '$lib/content/constants/competitors';
import {
	buildCompareChannelSectionsForPair,
	type CompareDirectoryCoverageViewModel
} from '$lib/content/constants/competitors/utils/compareChannelSections';
import type { PublicFaqItem } from '$lib/content/constants/faq';
import { insertDirectoryLaunchDrGuaranteeFaqItems } from '$lib/content/constants/faq/marketing/directory-submission';
import { PUBLIC_COMPARE_HUB } from '$lib/content/constants/hubs/compare';
import type { IconName } from '$data/icons';

import { PUBLIC_PRICING_COMPARE_ROWS } from '$lib/billing/constants/publicPricingCatalog';
import { route, url } from '$lib/utils/path';

import { getRootPathPublicComparePair } from '$lib/area-public/constants/getRootPathPublicCompare';
import { buildCompareHubMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';

export type CompareFeatureCellViewModel = CompareFeatureCell;

export type ComparePricingPlanViewModel = ComparePricingPlan;

export type CompareProductSummaryViewModel = {
	slug: CompareProductSlug;
	name: string;
	icon: IconName;
	tagline: string;
	overview: string;
	pricingUnit: ComparePricingUnit;
	pricingPlans: ComparePricingPlanViewModel[];
	channels: string[];
};

export type CompareFeatureRowViewModel = {
	id: string;
	label: string;
	tooltip?: string;
	left: CompareFeatureCellViewModel;
	right: CompareFeatureCellViewModel;
};

export type CompareHubPairCardViewModel = {
	name: string;
	icon: IconName;
	slug: string;
	href: string;
	description: string;
};

export type CompareHubProductOptionViewModel = {
	slug: CompareProductSlug;
	name: string;
	icon: IconName;
};

export type CompareHubSectionViewModel = {
	sectionId: string;
	subtitle: string;
	/** Full title for SEO / tests — `{product} vs {titlePeerSuffix}`. */
	title: string;
	/** Gradient clause after the product picker (e.g. `other social schedulers`). */
	titlePeerSuffix: string;
	description: string;
	learnMoreHref: string;
	learnMoreLabel: string;
	baseSlug: CompareProductSlug;
	baseProductName: string;
	products: CompareHubProductOptionViewModel[];
	pairs: CompareHubPairCardViewModel[];
};

export type CompareHubViewModel = {
	metaTitle: string;
	metaDescription: string;
	keywords: string[];
	eyebrow: string;
	/** Gradient hero clause after `vs.` (e.g. `the rest`). */
	heroHighlightText: string;
	description: string;
	baseSlug: CompareProductSlug;
	baseProductName: string;
	products: CompareHubProductOptionViewModel[];
	socialSection: CompareHubSectionViewModel;
	directorySection: CompareHubSectionViewModel;
};

export type CompareDetailViewModel = {
	layout: ComparePairLayout;
	metaTitle: string;
	metaDescription: string;
	keywords: string[];
	heroTitle: string;
	heroDescription: string;
	leftProduct: CompareProductSummaryViewModel;
	rightProduct: CompareProductSummaryViewModel;
	compareRows: CompareFeatureRowViewModel[];
	channelsSection: PublicAgentComparisonSection | null;
	directoryCoverageSection: CompareDirectoryCoverageViewModel | null;
	withWithoutSection: PublicAgentComparisonSection;
	faqItems: PublicFaqItem[];
	longForm: CompareDetailLongFormViewModel | null;
	relatedPairs: CompareHubPairCardViewModel[];
};

export class PublicComparePagePresenter {

	buildHubVm(baseSlug: CompareProductSlug = COMPARE_HUB_BASE_SLUG): CompareHubViewModel {
		const baseProduct = getCompareProduct(baseSlug);
		if (!baseProduct) {
			return this.buildHubVm(COMPARE_HUB_BASE_SLUG);
		}

		const isOpenQuokHub = baseProduct.slug === COMPARE_HUB_BASE_SLUG;
		const socialPairCount = listComparePairsForHub(baseProduct.slug, 'social_scheduling').length;
		const directoryPairCount = listComparePairsForHub(
			baseProduct.slug,
			'directory_submission'
		).length;
		const hubSeo = buildCompareHubSeoCopy(
			baseProduct,
			socialPairCount + directoryPairCount,
			isOpenQuokHub
		);

		return {
			metaTitle: isOpenQuokHub ? PUBLIC_COMPARE_HUB.metaTitle : hubSeo.metaTitle,
			metaDescription: isOpenQuokHub ? PUBLIC_COMPARE_HUB.metaDescription : hubSeo.metaDescription,
			keywords: isOpenQuokHub ? [...PUBLIC_COMPARE_HUB.keywords] : [...hubSeo.keywords],
			eyebrow: hubSeo.eyebrow,
			heroHighlightText: hubSeo.heroHighlightText,
			description: hubSeo.description,
			baseSlug: baseProduct.slug,
			baseProductName: baseProduct.name,
			products: PUBLIC_COMPARE_PRODUCTS.map((product) => ({
				slug: product.slug,
				name: product.name,
				icon: product.icon
			})),
			socialSection: buildCompareHubSection(baseProduct, 'social_scheduling'),
			directorySection: buildCompareHubSection(baseProduct, 'directory_submission')
		};
	}

	buildDetailVm(pair: ComparePair): CompareDetailViewModel | null {
		const leftProduct = getCompareProduct(pair.productASlug);
		const rightProduct = getCompareProduct(pair.productBSlug);
		if (!leftProduct || !rightProduct) return null;

		const isDirectoryLongForm = pair.layout === 'directory_long_form';
		const compareRowSource = isDirectoryLongForm
			? PUBLIC_PRICING_COMPARE_ROWS.filter((row) => row.line === 'directory')
			: PUBLIC_PRICING_COMPARE_ROWS;

		const compareRows = compareRowSource.map((row) => ({
			id: row.id,
			label: row.label,
			tooltip: row.tooltip,
			left: leftProduct.featureSupport[row.id] ?? { kind: 'excluded' as const },
			right: rightProduct.featureSupport[row.id] ?? { kind: 'excluded' as const }
		}));

		const faqFromIds = pair.faqItemIds?.length
			? resolvePublicFaqItemsByIds(pair.faqItemIds)
			: [];
		const faqItems = isDirectoryLongForm
			? insertDirectoryLaunchDrGuaranteeFaqItems(faqFromIds)
			: faqFromIds;

		const relatedCategory = isDirectoryLongForm
			? ('directory_submission' as const)
			: ('social_scheduling' as const);
		const relatedPairs = listComparePairsForHub(COMPARE_HUB_BASE_SLUG, relatedCategory)
			.filter((hubPair) => hubPair.productBSlug !== pair.productBSlug)
			.map((hubPair) => {
				const pairProduct = getCompareProduct(hubPair.productBSlug);
				return {
					name: hubPair.productBName,
					icon: pairProduct?.icon ?? leftProduct.icon,
					slug: hubPair.productBSlug,
					href: url(route(getRootPathPublicComparePair(hubPair.productASlug, hubPair.productBSlug))),
					description: buildCompareHubPairCardDescription(leftProduct, pairProduct ?? leftProduct)
				};
			});

		const channelSections = buildCompareChannelSectionsForPair(leftProduct, rightProduct);

		const longForm =
			pair.longForm != null
				? {
						...pair.longForm,
						otherAlternativePeers: relatedPairs
					}
				: null;

		return {
			layout: pair.layout,
			metaTitle: pair.metaTitle,
			metaDescription: pair.metaDescription,
			keywords: [...pair.keywords],
			heroTitle: pair.heroTitle,
			heroDescription: pair.heroDescription,
			leftProduct: toProductSummary(leftProduct),
			rightProduct: toProductSummary(rightProduct),
			compareRows,
			channelsSection: channelSections.socialChannelsSection,
			directoryCoverageSection: channelSections.directoryCoverageSection,
			withWithoutSection: pair.withWithoutSection,
			faqItems,
			longForm,
			relatedPairs
		};
	}
}

function buildCompareHubSection(
	baseProduct: NonNullable<ReturnType<typeof getCompareProduct>>,
	category: CompareProductCategory
): CompareHubSectionViewModel {
	const sectionConfig =
		category === 'directory_submission'
			? PUBLIC_COMPARE_HUB.directorySection
			: PUBLIC_COMPARE_HUB.socialSection;
	const titlePeerSuffix =
		category === 'directory_submission'
			? 'other submission services'
			: 'other social schedulers';
	const pairs = listComparePairsForHub(baseProduct.slug, category);
	const products = listCompareProductsForHubDropdown(category);
	const productsForPicker = products.some((product) => product.slug === baseProduct.slug)
		? products
		: [
				{ slug: baseProduct.slug, name: baseProduct.name, icon: baseProduct.icon },
				...products
			];

	return {
		sectionId: sectionConfig.sectionId,
		subtitle: sectionConfig.subtitle,
		title: `${baseProduct.name} vs ${titlePeerSuffix}`,
		titlePeerSuffix,
		description: sectionConfig.description,
		learnMoreHref: sectionConfig.learnMoreHref,
		learnMoreLabel: sectionConfig.learnMoreLabel,
		baseSlug: baseProduct.slug,
		baseProductName: baseProduct.name,
		products: productsForPicker.map((product) => ({
			slug: product.slug,
			name: product.name,
			icon: product.icon
		})),
		pairs: pairs.map((pair) => {
			const pairProduct = getCompareProduct(pair.productBSlug);
			return {
				name: pair.productBName,
				icon: pairProduct?.icon ?? baseProduct.icon,
				slug: pair.productBSlug,
				href: url(route(getRootPathPublicComparePair(pair.productASlug, pair.productBSlug))),
				description: buildCompareHubPairCardDescription(
					baseProduct,
					pairProduct ?? baseProduct,
					category
				)
			};
		})
	};
}

function buildCompareHubPairCardDescription(
	baseProduct: NonNullable<ReturnType<typeof getCompareProduct>>,
	pairProduct: NonNullable<ReturnType<typeof getCompareProduct>>,
	category: CompareProductCategory = 'social_scheduling'
): string {
	if (category === 'directory_submission') {
		if (baseProduct.slug === COMPARE_HUB_BASE_SLUG) {
			return `Compare DIY directory launch, pricing, and outcomes for ${baseProduct.name} and ${pairProduct.name}.`;
		}
		if (pairProduct.slug === COMPARE_HUB_BASE_SLUG) {
			return `See how ${pairProduct.name} DIY launch compares to ${baseProduct.name} on pace, control, and fees.`;
		}
		return `Compare directory submission pricing and delivery models for ${baseProduct.name} and ${pairProduct.name}.`;
	}

	if (baseProduct.slug === COMPARE_HUB_BASE_SLUG) {
		return `Compare prices, channels, workspaces, and agent tools for ${baseProduct.name} and ${pairProduct.name}.`;
	}

	if (pairProduct.slug === COMPARE_HUB_BASE_SLUG) {
		return `See why teams use ${pairProduct.name} instead of ${baseProduct.name}. You get agent workflows and separate workspaces.`;
	}

	return `Compare prices, channels, and scheduling features for ${baseProduct.name} and ${pairProduct.name}.`;
}

function toProductSummary(product: NonNullable<ReturnType<typeof getCompareProduct>>): CompareProductSummaryViewModel {
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

type CompareHubSeoCopy = {
	metaTitle: string;
	metaDescription: string;
	keywords: string[];
	eyebrow: string;
	heroHighlightText: string;
	description: string;
};

const COMPARE_HUB_SOCIAL_KEYWORDS = [
	'social media scheduler comparison',
	'compare social media scheduling tools',
	'buffer vs hootsuite alternative',
	'agent social media scheduling',
	'multi-workspace social media scheduler',
	'social media management tool comparison',
	'programmatic social media scheduling',
	'open source social media scheduler'
] as const;

function buildCompareHubSeoCopy(
	baseProduct: NonNullable<ReturnType<typeof getCompareProduct>>,
	pairCount: number,
	isOpenQuokHub: boolean
): CompareHubSeoCopy {
	const otherCountLabel = pairCount === 1 ? '1 other tool' : `${pairCount} other tools`;

	if (isOpenQuokHub) {
		return {
			metaTitle: buildCompareHubMetaTitle(baseProduct.name, true),
			metaDescription: PUBLIC_COMPARE_HUB.metaDescription,
			keywords: [...PUBLIC_COMPARE_HUB.keywords],
			eyebrow: 'Compare',
			heroHighlightText: 'the rest',
			description:
				'See how the most popular social media scheduling platforms compare — and why teams are switching to OpenQuok for agent workflows, multi-workspace publishing, and programmatic scheduling. Open directory submission comparisons below when you want DIY launch vs done-for-you services.'
		};
	}

	return {
		metaTitle: buildCompareHubMetaTitle(baseProduct.name, false),
		metaDescription: `Discover the best alternatives to ${baseProduct.name} for social media scheduling, agent workflows, and multi-workspace publishing. Compare top tools side by side on pricing, channels, and features.`,
		keywords: [
			`${baseProduct.name} alternatives comparison`,
			`best ${baseProduct.name} alternative`,
			...COMPARE_HUB_SOCIAL_KEYWORDS
		],
		eyebrow: 'Alternatives',
		heroHighlightText: 'the rest',
		description:
			pairCount === 1
				? `Compare the best ${baseProduct.name} alternative for social media management, scheduling, and agent-driven publishing.`
				: `Compare the top ${baseProduct.name} alternatives for social media management, scheduling, and agent-driven publishing — ${otherCountLabel} to explore.`
	};
}
