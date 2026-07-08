import type { PublicAgentComparisonSection } from '$lib/content/constants/agents/types';
import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';

export type CompareProductSlug = 'openquok' | 'hootsuite' | 'buffer';

/**
 * Comparison angles shared across products. When building a pair, a row is included only
 * when the left product has `strength` and the right product has `weakness` for the same id.
 */
export type CompareTalkingPointId =
	| 'agent_workflow'
	| 'pricing_model'
	| 'workspace_isolation'
	| 'product_focus'
	| 'programmatic_access'
	| 'publishing_control';

export type CompareTalkingPointCopy = {
	/** Green (with / left) column when this product is on the left. */
	strength?: string;
	/** Red (without / right) column when this product is on the right. */
	weakness?: string;
};

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

/** Copy used to build with/without sections and pair descriptions at runtime. */
export type CompareProductComparison = {
	/** Headline fragment for the left product (e.g. "agent-native scheduling"). */
	headline: string;
	/** Right-column headline fragment for OpenQuok-led pairs: "not another {notAnother}". */
	notAnother: string;
	/** Audience/context fragment: "{name} is built for {builtFor}." */
	builtFor: string;
	/** Second sentence when this product is on the left: "{name} {positioningWhenLeft}." */
	positioningWhenLeft: string;
	/** Override for the without column title; defaults to "Typical {name} workflow". */
	withoutTitle?: string;
	/** Strengths and weaknesses keyed by comparison angle. */
	talkingPoints: Partial<Record<CompareTalkingPointId, CompareTalkingPointCopy>>;
};

export type CompareProduct = {
	slug: CompareProductSlug;
	name: string;
	tagline: string;
	overview: string;
	pricingPlans: ComparePricingPlan[];
	channels: string[];
	featureSupport: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>>;
	comparison: CompareProductComparison;
};

export type PublicFaqItemId =
	| 'switch-from-buffer-hootsuite'
	| 'try-free'
	| 'multi-workspace';

export type ComparePair = {
	productASlug: CompareProductSlug;
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
	productASlug: CompareProductSlug;
	productBSlug: CompareProductSlug;
	productBName: string;
};
