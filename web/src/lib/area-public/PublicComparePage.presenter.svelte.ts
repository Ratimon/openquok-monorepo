import type { PublicAgentComparisonSection } from '$lib/content/constants/publicAgentConfig';
import {
	buildCompareChannelPoints,
	COMPARE_CHANNELS_SECTION,
	getCompareProduct,
	listComparePairsForHub,
	resolvePublicFaqItemsByIds,
	type CompareFeatureCell,
	type ComparePair,
	type ComparePricingPlan
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

export type CompareHubViewModel = {
	metaTitle: string;
	metaDescription: string;
	eyebrow: string;
	title: string;
	description: string;
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

	buildHubVm(): CompareHubViewModel {
		const pairs = listComparePairsForHub('openquok');
		const pairCount = pairs.length;

		return {
			metaTitle: 'OpenQuok vs the rest',
			metaDescription:
				pairCount === 1
					? 'See how OpenQuok stacks up against Hootsuite on pricing, channels, agent workspaces, and scheduling features.'
					: `See how OpenQuok stacks up against ${pairCount} alternatives on pricing, channels, agent workspaces, and scheduling features.`,
			eyebrow: 'Compare',
			title: 'OpenQuok vs the rest',
			description:
				pairCount === 1
					? 'See how OpenQuok stacks up against the leading enterprise scheduler.'
					: `See how OpenQuok stacks up against ${pairCount} social media schedulers.`,
			pairs: pairs.map((pair) => ({
				name: pair.competitorName,
				slug: pair.competitorSlug,
				href: url(route(getRootPathPublicComparePair(pair.productASlug, pair.competitorSlug)))
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

		const relatedPairs = listComparePairsForHub('openquok')
			.filter((hubPair) => hubPair.competitorSlug !== pair.productBSlug)
			.map((hubPair) => ({
				name: hubPair.competitorName,
				slug: hubPair.competitorSlug,
				href: url(route(getRootPathPublicComparePair(hubPair.productASlug, hubPair.competitorSlug)))
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
