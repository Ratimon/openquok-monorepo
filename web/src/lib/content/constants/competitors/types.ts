import type { PublicAgentComparisonSection } from '$lib/content/constants/agents/types';
import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';

export type CompareProductSlug = 'openquok' | 'hootsuite';

export type CompareFeatureCell =
	| { kind: 'included' }
	| { kind: 'excluded' }
	| { kind: 'text'; text: string };

export type ComparePricingPlan = {
	name: string;
	/** Monthly price in USD; `null` for custom or contact-sales tiers. */
	monthlyPrice: number | null;
	/** Short line under the plan name (e.g. tagline or audience). */
	tagline: string;
	/** Price footnote (e.g. per-user billing or trial copy). */
	footnote?: string;
};

export type CompareProduct = {
	slug: CompareProductSlug;
	name: string;
	tagline: string;
	overview: string;
	pricingPlans: ComparePricingPlan[];
	channels: string[];
	featureSupport: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>>;
};

export type PublicFaqItemId =
	| 'switch-from-buffer-hootsuite'
	| 'try-free'
	| 'multi-workspace';

export type ComparePair = {
	productASlug: 'openquok';
	productBSlug: CompareProductSlug;
	metaTitle: string;
	metaDescription: string;
	keywords: string[];
	heroTitle: string;
	heroDescription: string;
	withWithoutSection: PublicAgentComparisonSection;
	faqItemIds?: PublicFaqItemId[];
};

export type CompareHubPairViewModel = {
	productASlug: 'openquok';
	competitorSlug: CompareProductSlug;
	competitorName: string;
};

