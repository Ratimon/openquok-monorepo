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
import { PUBLIC_PRICING_COMPARE_ROWS } from '$lib/billing/constants/publicPricingCatalog';
import { route, url } from '$lib/utils/path';

import { getRootPathPublicComparePair } from '$lib/area-public/constants/getRootPathPublicCompare';

export type CompareFeatureCellViewModel = CompareFeatureCell;

export type ComparePricingPlanViewModel = ComparePricingPlan;

export type CompareProductSummaryViewModel = {
	slug: string;
	name: string;
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
	slug: string;
	href: string;
};

export type CompareHubProductOptionViewModel = {
	slug: CompareProductSlug;
	name: string;
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
		const pairCount = pairs.length;
		const otherCountLabel =
			pairCount === 1 ? '1 other tool' : `${pairCount} other tools`;

		return {
			metaTitle: `${baseProduct.name} vs the rest`,
			metaDescription:
				pairCount === 1
					? `See how ${baseProduct.name} stacks up against another social media scheduler on pricing, channels, workspaces, and scheduling features.`
					: `See how ${baseProduct.name} stacks up against ${otherCountLabel} on pricing, channels, workspaces, and scheduling features.`,
			eyebrow: 'Compare',
			title: `${baseProduct.name} vs the rest`,
			description:
				pairCount === 1
					? `See how ${baseProduct.name} stacks up against 1 other tool.`
					: `See how ${baseProduct.name} stacks up against ${otherCountLabel}.`,
			baseSlug: baseProduct.slug,
			baseProductName: baseProduct.name,
			products: PUBLIC_COMPARE_PRODUCTS.map((product) => ({
				slug: product.slug,
				name: product.name
			})),
			pairs: pairs.map((pair) => ({
				name: pair.productBName,
				slug: pair.productBSlug,
				href: url(route(getRootPathPublicComparePair(pair.productASlug, pair.productBSlug)))
			}))
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
			.map((hubPair) => ({
				name: hubPair.productBName,
				slug: hubPair.productBSlug,
				href: url(route(getRootPathPublicComparePair(hubPair.productASlug, hubPair.productBSlug)))
			}));

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

function toProductSummary(product: NonNullable<ReturnType<typeof getCompareProduct>>): CompareProductSummaryViewModel {
	return {
		slug: product.slug,
		name: product.name,
		tagline: product.tagline,
		overview: product.overview,
		pricingPlans: product.pricingPlans,
		channels: product.channels
	};
}
