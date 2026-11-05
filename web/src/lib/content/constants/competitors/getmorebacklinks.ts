import type {
	CompareDirectoryLongFormContent,
	CompareFeatureCell,
	ComparePricingPlan,
	CompareProduct
} from '$lib/content/constants/competitors/types';
import { COMPARE_PRODUCT_CATEGORIES_DIRECTORY_SUBMISSION } from '$lib/content/constants/competitors/shared';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const GETMOREBACKLINKS_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Advanced',
		monthlyPrice: 379,
		pricePeriod: 'one_time',
		tagline: '100 backlink submissions per website',
		footnote:
			'Per website · 25 paid platforms · basic SEO and landing page reports · 0 blog posts · verify live pricing'
	},
	{
		name: 'Business',
		monthlyPrice: 579,
		pricePeriod: 'one_time',
		tagline: '200 backlink submissions per website',
		footnote:
			'Per website · 50 paid platforms · basic SEO and landing reports · 0 blog posts · verify live pricing'
	},
	{
		name: 'Pro',
		monthlyPrice: 779,
		pricePeriod: 'one_time',
		tagline: '200 submissions plus five hand-written blog posts',
		footnote:
			'Per website · 75 paid platforms · basic SEO and landing reports · 5 blog posts · verify live pricing'
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

const GETMOREBACKLINKS_DIRECTORY_LONG_FORM: CompareDirectoryLongFormContent = {
	whyPeopleLook: {
		id: 'why-people-look',
		navLabel: 'Why people look',
		subtitle: 'Why people look',
		title: 'Why teams look for a GetMoreBacklinks alternative',
		body: [
			'GetMoreBacklinks sells one-time packages per website for 100 or 200 submissions.',
			'Orders may pause when their queue is full. Each new site pays the full fee again.',
			'Delivery takes about 14 working days. You get a report, not a live dashboard.'
		]
	},
	yourOptions: {
		id: 'your-options',
		navLabel: 'Your options',
		subtitle: 'Your options',
		title: 'Another agency, DIY tools, or OpenQuok',
		body: [
			'Wait for orders to reopen, hire another agency, submit by hand, or use OpenQuok in your workspace.',
			'OpenQuok uses business profiles and extension autofill. You track each listing yourself.',
			'Verify prices on getmorebacklinks.org. Compare plans in the sections below.'
		]
	},
	whenTheyWin: {
		id: 'when-they-win',
		navLabel: 'When they win',
		subtitle: 'When they win',
		title: 'When GetMoreBacklinks stays the better choice',
		body: [
			'You want SEO reports and blog posts bundled with directory work.',
			'You want experts to pick lists. You do not want to run an extension.',
			'You prefer one invoice and no software setup during launch week.'
		]
	}
};

export const getmorebacklinksCompareProduct: CompareProduct = {
	slug: 'getmorebacklinks',
	categories: COMPARE_PRODUCT_CATEGORIES_DIRECTORY_SUBMISSION,
	name: 'GetMoreBacklinks',
	icon: icons.GetMoreBacklinks.name,
	tagline: 'Done-for-you directory and backlink packages per website in about 14 working days',
	overview:
		'GetMoreBacklinks sells done-for-you directory and backlink packages for SaaS and tech sites. You pay once per website for 100 or 200 submissions in about 14 working days. You get a report with listing data and screenshots.',
	pricingPlans: GETMOREBACKLINKS_PRICING_PLANS,
	channels: [],
	featureSupport: GETMOREBACKLINKS_FEATURE_SUPPORT,
	directoryLongForm: GETMOREBACKLINKS_DIRECTORY_LONG_FORM,
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
