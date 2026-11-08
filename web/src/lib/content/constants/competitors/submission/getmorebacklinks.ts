import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import { COMPARE_PRODUCT_CATEGORIES_DIRECTORY_SUBMISSION } from '$lib/content/constants/competitors/shared';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { buildDirectorySubmissionAlternativesLongForm } from '$lib/content/constants/competitors/buildCompareLongFormSections';
import { icons } from '$data/icons';

const GETMOREBACKLINKS_ALTERNATIVES_LONG_FORM = buildDirectorySubmissionAlternativesLongForm(
	'GetMoreBacklinks',
	[
		'GetMoreBacklinks charges per website. Each new product pays the full package fee again.',
		'Delivery takes about fourteen working days. You receive a report, not a live dashboard.',
		'Orders may pause when the queue is full. You wait for intake to reopen.'
	],
	[
		'You want experts to pick directories and deliver SEO plus landing page reports.',
		'Pro bundles hand-written blog posts with two hundred submissions on the vendor site.',
		'You prefer one payment and no browser extension during launch week.'
	]
);

const GETMOREBACKLINKS_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Advanced',
		monthlyPrice: 379,
		pricePeriod: 'one_time',
		tagline: '100 backlink submissions per website',
		footnote:
			'Per website · 100 backlink submissions · 25 paid platforms · basic SEO and landing page reports · 0 blog posts'
	},
	{
		name: 'Business',
		monthlyPrice: 579,
		pricePeriod: 'one_time',
		tagline: '200 backlink submissions per website',
		footnote:
			'Per website · 200 backlink submissions · 50 paid platforms · basic SEO and landing page reports · 0 blog posts'
	},
	{
		name: 'Pro',
		monthlyPrice: 779,
		pricePeriod: 'one_time',
		tagline: '200 submissions plus five hand-written blog posts',
		footnote:
			'Per website · 200 backlink submissions · 75 paid platforms · basic SEO and landing page reports · 5 blog posts'
	}
];

const GETMOREBACKLINKS_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	official_api: { kind: 'text', text: 'No Info' },
	public_api: { kind: 'excluded' },
	directory_business_profiles: {
		kind: 'text',
		text: 'One intake form — vendor team submits listings for you'
	},
	directory_extension_autofill: { kind: 'excluded' },
	directory_submission_tracking: {
		kind: 'text',
		text: 'Delivery report with directory data and proof screenshots'
	},
	directory_profile_variants: { kind: 'excluded' },
	directory_analytics: {
		kind: 'text',
		text: 'Basic SEO and landing page reports — not in-app DR analytics'
	},
	directory_competitor_domains: { kind: 'excluded' },
	directory_catalog_dr: { kind: 'excluded' }
};

export const getmorebacklinksCompareProduct: CompareProduct = {
	slug: 'getmorebacklinks',
	categories: COMPARE_PRODUCT_CATEGORIES_DIRECTORY_SUBMISSION,
	name: 'GetMoreBacklinks',
	icon: icons.GetMoreBacklinks.name,
	tagline: 'Done-for-you directory and backlink packages per website in about 14 working days',
	overview:
		'GetMoreBacklinks sells done-for-you directory packages for SaaS and tech sites. Pay once per site for 100 or 200 submissions in about 14 working days. You get a report with listing data and screenshots.',
	pricingPlans: GETMOREBACKLINKS_PRICING_PLANS,
	channels: [],
	featureSupport: GETMOREBACKLINKS_FEATURE_SUPPORT,
	directoryLongForm: GETMOREBACKLINKS_ALTERNATIVES_LONG_FORM,
	directoryCoverageSummary:
		'100 backlink submissions per website on Advanced ($379). 200 submissions on Business ($579) and Pro ($779). The vendor hand-picks directories and does not publish a fixed site list — verify packages on getmorebacklinks.org.',
	comparison: {
		headline: 'managed backlink campaigns',
		notAnother: 'self-serve directory workspace',
		builtFor:
			'founders who want a human team to submit hundreds of directories with reports and optional blog content',
		positioningWhenLeft:
			'sells per-website packages with expert directory picks and delivery in about 14 working days',
		talkingPoints: {
			submission_model: {
				weakness:
					'You pay per site and send copy to a vendor. No reusable profiles or self-submit.'
			},
			pace_and_control: {
				weakness: 'You wait on vendor queues and paused orders. The next site waits for the report.'
			},
			dr_outcomes: {
				weakness: 'Results depend on their list. No ongoing DR charts in your workspace.'
			},
			pricing_model: {
				strength: 'One-time packages bundle 100–200 submissions without a monthly fee for that campaign.',
				weakness: 'Each new site starts at $379 again. Many products multiply cost.'
			},
			product_focus: {
				strength: 'SEO and landing reports and optional blog posts — not directories alone.',
				weakness: 'No social scheduling, agents, or autofill after the campaign.'
			}
		}
	}
};
