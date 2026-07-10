import type { PublicAgentComparisonSection } from '$lib/content/constants/publicAgentConfig';
import {
	buildCompareChannelPoints,
	COMPARE_CHANNELS_SECTION,
	COMPARE_HUB_BASE_SLUG,
	getCompareProduct,
	listComparePairsForHub,
	PUBLIC_COMPARE_PRODUCTS,
	resolvePublicFaqItemsByIds,
	type CompareFeatureCell,
	type ComparePair,
	type ComparePricingPlan,
	type CompareProductSlug
} from '$lib/content/constants/publicCompareConfig';
import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import type { IconName } from '$data/icons';

import { PUBLIC_PRICING_COMPARE_ROWS } from '$lib/billing/constants/publicPricingCatalog';
import { route, url } from '$lib/utils/path';

import { getRootPathPublicComparePair } from '$lib/area-public/constants/getRootPathPublicCompare';

export type CompareFeatureCellViewModel = CompareFeatureCell;

export type ComparePricingPlanViewModel = ComparePricingPlan;

export type CompareProductSummaryViewModel = {
	slug: string;
	name: string;
	icon: IconName;
	tagline: string;
	overview: string;
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

export type CompareHubViewModel = {
	metaTitle: string;
	metaDescription: string;
	eyebrow: string;
	title: string;
	description: string;
	baseSlug: CompareProductSlug;
	baseProductName: string;
	products: CompareHubProductOptionViewModel[];
	pairs: CompareHubPairCardViewModel[];
};

export type CompareDetailViewModel = {
	metaTitle: string;
	metaDescription: string;
	keywords: string[];
	heroTitle: string;
	heroDescription: string;
	leftProduct: CompareProductSummaryViewModel;
	rightProduct: CompareProductSummaryViewModel;
	compareRows: CompareFeatureRowViewModel[];
	channelsSection: PublicAgentComparisonSection;
	withWithoutSection: PublicAgentComparisonSection;
	faqItems: PublicFaqItem[];
	relatedPairs: CompareHubPairCardViewModel[];
};

export class PublicComparePagePresenter {

	buildHubVm(baseSlug: CompareProductSlug = COMPARE_HUB_BASE_SLUG): CompareHubViewModel {
		const baseProduct = getCompareProduct(baseSlug);
		if (!baseProduct) {
			return this.buildHubVm(COMPARE_HUB_BASE_SLUG);
		}

		const pairs = listComparePairsForHub(baseSlug);
		const isOpenQuokHub = baseSlug === COMPARE_HUB_BASE_SLUG;
		const hubSeo = buildCompareHubSeoCopy(baseProduct, pairs.length, isOpenQuokHub);

		return {
			metaTitle: hubSeo.metaTitle,
			metaDescription: hubSeo.metaDescription,
			eyebrow: hubSeo.eyebrow,
			title: hubSeo.title,
			description: hubSeo.description,
			baseSlug: baseProduct.slug,
			baseProductName: baseProduct.name,
			products: PUBLIC_COMPARE_PRODUCTS.map((product) => ({
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
						pairProduct ?? baseProduct
					)
				};
			})
		};
	}

	buildDetailVm(pair: ComparePair): CompareDetailViewModel | null {
		const leftProduct = getCompareProduct(pair.productASlug);
		const rightProduct = getCompareProduct(pair.productBSlug);
		if (!leftProduct || !rightProduct) return null;

		const compareRows = PUBLIC_PRICING_COMPARE_ROWS.map((row) => ({
			id: row.id,
			label: row.label,
			tooltip: row.tooltip,
			left: leftProduct.featureSupport[row.id] ?? { kind: 'excluded' as const },
			right: rightProduct.featureSupport[row.id] ?? { kind: 'excluded' as const }
		}));

		const faqItems = pair.faqItemIds?.length
			? resolvePublicFaqItemsByIds(pair.faqItemIds)
			: [];

		const relatedPairs = listComparePairsForHub(COMPARE_HUB_BASE_SLUG)
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

		return {
			metaTitle: pair.metaTitle,
			metaDescription: pair.metaDescription,
			keywords: [...pair.keywords],
			heroTitle: pair.heroTitle,
			heroDescription: pair.heroDescription,
			leftProduct: toProductSummary(leftProduct),
			rightProduct: toProductSummary(rightProduct),
			compareRows,
			channelsSection: {
				...COMPARE_CHANNELS_SECTION,
				withoutTitle: rightProduct.name,
				withTitle: leftProduct.name,
				points: buildCompareChannelPoints(leftProduct.channels, rightProduct.channels)
			},
			withWithoutSection: pair.withWithoutSection,
			faqItems,
			relatedPairs
		};
	}
}

type CompareHubSeoCopy = {
	metaTitle: string;
	metaDescription: string;
	eyebrow: string;
	title: string;
	description: string;
};

function buildCompareHubSeoCopy(
	baseProduct: NonNullable<ReturnType<typeof getCompareProduct>>,
	pairCount: number,
	isOpenQuokHub: boolean
): CompareHubSeoCopy {
	const otherCountLabel = pairCount === 1 ? '1 other tool' : `${pairCount} other tools`;

	if (isOpenQuokHub) {
		return {
			metaTitle: `${baseProduct.name} vs. the rest`,
			metaDescription:
				'Compare the top social media scheduling tools side by side — pricing, channels, workspaces, and agent integrations. See why teams are switching to OpenQuok.',
			eyebrow: 'Compare',
			title: `${baseProduct.name} vs. the rest`,
			description:
				'See how the most popular social media scheduling platforms compare — and why teams are switching to OpenQuok for agent workflows, multi-workspace publishing, and programmatic scheduling.'
		};
	}

	return {
		metaTitle: `Best ${baseProduct.name} Alternatives`,
		metaDescription: `Discover the best alternatives to ${baseProduct.name} for social media scheduling, agent workflows, and multi-workspace publishing. Compare top tools side by side on pricing, channels, and features.`,
		eyebrow: 'Alternatives',
		title: `Best ${baseProduct.name} alternatives`,
		description:
			pairCount === 1
				? `Compare the best ${baseProduct.name} alternative for social media management, scheduling, and agent-driven publishing.`
				: `Compare the top ${baseProduct.name} alternatives for social media management, scheduling, and agent-driven publishing — ${otherCountLabel} to explore.`
	};
}

function buildCompareHubPairCardDescription(
	baseProduct: NonNullable<ReturnType<typeof getCompareProduct>>,
	pairProduct: NonNullable<ReturnType<typeof getCompareProduct>>
): string {
	if (baseProduct.slug === COMPARE_HUB_BASE_SLUG) {
		return `Compare ${baseProduct.name} and ${pairProduct.name} on pricing, channels, workspaces, and agent integrations.`;
	}

	if (pairProduct.slug === COMPARE_HUB_BASE_SLUG) {
		return `Discover why teams choose ${pairProduct.name} as a ${baseProduct.name} alternative for agent workflows and multi-workspace scheduling.`;
	}

	return `Compare ${baseProduct.name} and ${pairProduct.name} on pricing, channels, and scheduling features.`;
}

function toProductSummary(product: NonNullable<ReturnType<typeof getCompareProduct>>): CompareProductSummaryViewModel {
	return {
		slug: product.slug,
		name: product.name,
		icon: product.icon,
		tagline: product.tagline,
		overview: product.overview,
		pricingPlans: product.pricingPlans,
		channels: product.channels
	};
}
