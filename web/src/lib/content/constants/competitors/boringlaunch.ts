import type {
	CompareDirectoryLongFormContent,
	CompareFeatureCell,
	ComparePricingPlan,
	CompareProduct
} from '$lib/content/constants/competitors/types';
import { COMPARE_PRODUCT_CATEGORIES_DIRECTORY_SUBMISSION } from '$lib/content/constants/competitors/shared';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const BORINGLAUNCH_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Basic',
		monthlyPrice: 149,
		pricePeriod: 'one_time',
		tagline: 'Suitable for most SaaS, APIs, boilerplates, and directories',
		footnote: 'Submit to 50+ platforms in 7 days · detailed submission report'
	},
	{
		name: 'Not Boring',
		monthlyPrice: 249,
		pricePeriod: 'one_time',
		tagline: 'Best when you want 100+ platforms and paid directory recommendations',
		footnote: '100+ platforms in 7 days · guaranteed SEO improvement in 30 days (per vendor)'
	},
	{
		name: 'Priority',
		monthlyPrice: 549,
		pricePeriod: 'one_time',
		tagline: 'Start within 24 hours on a curated high-DR list',
		footnote: '50–60 high-quality platforms in 7 days · money-back if DR stays below 20 in 30 days (per vendor)'
	}
];

const BORINGLAUNCH_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	official_api: { kind: 'text', text: 'No Info' },
	public_api: { kind: 'excluded' },
	directory_business_profiles: {
		kind: 'text',
		text: 'One intake form — vendor builds listings for you'
	},
	directory_extension_autofill: { kind: 'excluded' },
	directory_submission_tracking: {
		kind: 'text',
		text: 'Detailed submission report after the campaign'
	},
	directory_profile_variants: { kind: 'excluded' },
	directory_analytics: {
		kind: 'text',
		text: 'Vendor reports DR and traffic outcomes — not in-app analytics'
	},
	directory_competitor_domains: { kind: 'excluded' },
	directory_catalog_dr: { kind: 'excluded' }
};

const BORINGLAUNCH_DIRECTORY_LONG_FORM: CompareDirectoryLongFormContent = {
	whyPeopleLook: {
		id: 'why-people-look',
		navLabel: 'Why people look',
		subtitle: 'the problem',
		title: 'Why teams look for directory submission help',
		body: [
			'Launching on startup directories takes hours of copy-paste work.',
			'Each site wants a slightly different pitch, logo, and category.',
			'Founders want backlinks and referral traffic without losing a week to forms.',
			'Done-for-you services promise to submit your product to dozens or hundreds of lists in about seven days.'
		]
	},
	yourOptions: {
		id: 'your-options',
		navLabel: 'Your options',
		subtitle: 'models',
		title: 'Done-for-you vs DIY directory launch',
		body: [
			'BoringLaunch sells one-time packages. You fill a form and their team submits on your behalf.',
			'Basic covers 50+ platforms from $149. Not Boring targets 100+ platforms from $249. Priority starts within 24 hours from $549.',
			'OpenQuok is a DIY path inside your workspace. You keep business profiles, use the Chrome extension to autofill each directory form, and submit yourself.',
			'You pay a monthly workspace fee for scheduling plus directory launch tools — not a per-campaign listing fee.'
		]
	},
	switchingChecklist: {
		id: 'switching-checklist',
		navLabel: 'Switching checklist',
		subtitle: 'before you choose',
		title: 'Checklist before you pick a directory path',
		body: [
			'Decide whether you need hands-off execution or control over every listing.',
			'List which directories matter for your niche — paid AI lists vs general SaaS catalogs.',
			'Set a budget for one-time agency spend vs ongoing workspace software.',
			'Plan who owns pitch copy, screenshots, and founder accounts on each directory.',
			'If you choose DIY, install the OpenQuok browser extension and connect a workspace with directory launch enabled.'
		]
	},
	whenTheyWin: {
		id: 'when-they-win',
		navLabel: 'When they win',
		subtitle: 'fit',
		title: 'When BoringLaunch stays the better choice',
		body: [
			'You want zero form work during a launch week and can wait for vendor turnaround.',
			'You prefer a fixed one-time invoice instead of learning new software.',
			'You trust a human team to pick platforms and write submissions from one intake form.',
			'You do not need ongoing submission tracking, profile variants, or in-app DR analytics after the campaign ends.'
		]
	}
};

export const boringlaunchCompareProduct: CompareProduct = {
	slug: 'boringlaunch',
	categories: COMPARE_PRODUCT_CATEGORIES_DIRECTORY_SUBMISSION,
	name: 'BoringLaunch',
	icon: icons.BoringLaunch.name,
	tagline: 'Done-for-you startup directory submissions in about seven days',
	overview:
		'BoringLaunch is a done-for-you directory submission service for founders and SaaS teams. You share product details once. Their team submits to 50–100+ startup directories and similar platforms within about seven days. Plans are one-time fees from $149 to $549. You receive a detailed submission report rather than a self-serve dashboard.',
	pricingPlans: BORINGLAUNCH_PRICING_PLANS,
	channels: [],
	featureSupport: BORINGLAUNCH_FEATURE_SUPPORT,
	directoryLongForm: BORINGLAUNCH_DIRECTORY_LONG_FORM,
	comparison: {
		headline: 'done-for-you directory blitz',
		notAnother: 'DIY listing tool',
		builtFor: 'founders who want a human team to submit startup directories without opening each form',
		positioningWhenLeft:
			'handles bulk directory submissions as a managed service with one-time packages and a written report',
		withoutTitle: 'Typical BoringLaunch engagement',
		talkingPoints: {
			submission_model: {
				weakness:
					'You hand product copy to a vendor once. You do not keep reusable business profiles or submit each directory yourself.'
			},
			pace_and_control: {
				weakness:
					'Turnaround follows vendor queue slots — often about seven days — with limited visibility until the report arrives.'
			},
			dr_outcomes: {
				weakness:
					'DR and traffic gains depend on the vendor list and timing. You do not get workspace DR charts or competitor benchmarks in your own dashboard.'
			},
			pricing_model: {
				strength:
					'One-time packages from $149 cover a full submission campaign without a monthly subscription.',
				weakness:
					'Each new product or relaunch may need another package — costs add up across multiple brands.'
			},
			product_focus: {
				strength:
					'Purpose-built for directory backlinks and launch visibility — not a full social scheduling suite.',
				weakness:
					'No social publishing, agents, or directory autofill extension — directory work stops when the campaign ends.'
			}
		}
	}
};
