import type { PublicAgentComparisonSection } from '$lib/content/constants/agents/types';
import type { PublicFaqItem, PublicFaqItemId } from '$lib/content/constants/faq';

export type { PublicFaqItemId };
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import type { IconName } from '$data/icons';

export type CompareProductCategory = 'social_scheduling' | 'directory_submission';

export type CompareProductSlug =
	| 'openquok'
	| 'hootsuite'
	| 'heropost'
	| 'hopper-hq'
	| 'influence'
	| 'later'
	| 'buffer'
	| 'blotato'
	| 'breakreach'
	| 'claw-post'
	| 'mixpost'
	| 'openpost'
	| 'post-bridge'
	| 'postfast'
	| 'postpeer'
	| 'post2all'
	| 'postiz'
	| 'publer'
	| 'recurpost'
	| 'socialclaw'
	| 'socialync'
	| 'sprout-social'
	| 'typefully'
	| 'usebard'
	| 'boringlaunch'
	| 'getmorebacklinks';

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
	| 'publishing_control'
	| 'submission_model'
	| 'pace_and_control'
	| 'dr_outcomes';

export type CompareLongFormSection = {
	id: string;
	/** Sticky “On this page” label. `subtitle` is the section eyebrow; match `navLabel` unless the title makes the eyebrow redundant. */
	navLabel: string;
	subtitle: string;
	title: string;
	body: readonly string[];
};

/** Long-form compare sections for directory submission services (detail page). */
export type CompareDirectoryLongFormContent = {
	whyPeopleLook: CompareLongFormSection;
	yourOptions: CompareLongFormSection;
	whenTheyWin: CompareLongFormSection;
};

export type ComparePairLayout = 'social_matrix' | 'directory_long_form';

/** Sticky long-form compare detail (directory submission pairs). */
export type CompareDetailLongFormViewModel = {
	competitorSlug: CompareProductSlug;
	competitorName: string;
	openQuokName: string;
	directorySubmissionToolPath: string;
	chromeExtensionDocsPath: string;
	whyPeopleLook: CompareLongFormSection;
	yourOptions: CompareLongFormSection;
	whenTheyWin: CompareLongFormSection;
	otherAlternatives: CompareLongFormSection;
	otherAlternativePeers: readonly CompareLongFormPeerLink[];
};

export type CompareLongFormPeerLink = {
	name: string;
	slug: CompareProductSlug;
	href: string;
	description: string;
};

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
	/** Price in USD; `null` for custom or contact-sales tiers. */
	monthlyPrice: number | null;
	/** How to label `monthlyPrice` in compare UI; defaults to monthly when omitted. */
	pricePeriod?: 'month' | 'one_time';
	/** Short line under the plan name (e.g. tagline or audience). */
	tagline: string;
	/** Price footnote (e.g. per-user billing or trial copy). */
	footnote?: string;
};

/** Copy used to build with/without sections and pair descriptions at runtime. */
export type CompareProductComparison = {
	/** Headline fragment for the left product (e.g. "agent-native scheduling"). Keep ASD-STE100. */
	headline: string;
	/** Right-column headline fragment for OpenQuok-led pairs: "not another {notAnother}". */
	notAnother: string;
	/** Audience fragment: "{name} is for {builtFor}." */
	builtFor: string;
	/** Clause when this product is on the left: "{name} {positioningWhenLeft}." */
	positioningWhenLeft: string;
	/** Override for the without column title; defaults to "Typical {name} workflow". */
	/** Optional legacy label for with/without; compare pages use the right product name. */
	withoutTitle?: string;
	/** Strengths and weaknesses keyed by comparison angle. */
	talkingPoints: Partial<Record<CompareTalkingPointId, CompareTalkingPointCopy>>;
};

export type ComparePricingUnit = 'flat' | 'per_channel' | 'per_seat';

export type CompareProduct = {
	slug: CompareProductSlug;
	/** Hub sections and pair URLs: products compare only when categories overlap. */
	categories: readonly CompareProductCategory[];
	name: string;
	icon: IconName;
	tagline: string;
	overview: string;
	/** When `per_channel`, each plan `monthlyPrice` is USD per connected social account. When `per_seat`, USD per user/seat. */
	pricingUnit?: ComparePricingUnit;
	pricingPlans: ComparePricingPlan[];
	channels: string[];
	featureSupport: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>>;
	comparison: CompareProductComparison;
	/** Directory-service competitors: sticky long-form sections on compare detail. */
	directoryLongForm?: CompareDirectoryLongFormContent;
	/** Optional override for `/alternatives/{slug}` long-form (social schedulers). */
	alternativesLongForm?: CompareDirectoryLongFormContent;
	/** Done-for-you directory vendors: bulk package copy when they do not publish a site list. */
	directoryCoverageSummary?: string;
};

export type ComparePair = {
	productASlug: CompareProductSlug;
	productBSlug: CompareProductSlug;
	layout: ComparePairLayout;
	longForm?: CompareDetailLongFormViewModel;
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
