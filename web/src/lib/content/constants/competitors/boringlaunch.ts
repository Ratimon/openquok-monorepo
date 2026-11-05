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
		subtitle: 'Why people look',
		title: 'Why teams look for directory submission help',
		body: [
			'Startup directories need hours of copy-paste work.',
			'Each site wants a different pitch, logo, and category.',
			'Done-for-you services submit to dozens of lists in about seven days.'
		]
	},
	yourOptions: {
		id: 'your-options',
		navLabel: 'Your options',
		subtitle: 'Your options',
		title: 'Done-for-you vs DIY directory launch',
		body: [
			'BoringLaunch sells one-time packages. Their team submits after one intake form.',
			'OpenQuok is DIY: business profiles, extension autofill, and you click submit.',
			'See pricing and features below for a side-by-side view with OpenQuok.'
		]
	},
	whenTheyWin: {
		id: 'when-they-win',
		navLabel: 'When they win',
		subtitle: 'When they win',
		title: 'When BoringLaunch stays the better choice',
		body: [
			'You want no form work during launch week.',
			'You prefer one invoice and a human team picks platforms.',
			'You do not need ongoing tracking or in-app DR analytics.'
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
		'BoringLaunch is a done-for-you directory service for founders and SaaS teams. You submit product details once. Their team lists you on 50–100+ directories in about seven days and sends a report.',
	pricingPlans: BORINGLAUNCH_PRICING_PLANS,
	channels: [],
	featureSupport: BORINGLAUNCH_FEATURE_SUPPORT,
	directoryLongForm: BORINGLAUNCH_DIRECTORY_LONG_FORM,
	directoryCoverageSummary:
		'50+ platforms on Basic ($149), 100+ on Not Boring ($249), and about 50–60 high-DR sites on Priority ($549). The vendor submits on your behalf — verify package details on boringlaunch.com.',
	comparison: {
		headline: 'done-for-you directory blitz',
		notAnother: 'DIY listing tool',
		builtFor: 'founders who want a human team to submit startup directories without opening each form',
		positioningWhenLeft:
			'handles bulk directory submissions as a managed service with one-time packages and a written report',
		talkingPoints: {
			submission_model: {
				weakness: 'You send copy to a vendor once. No reusable profiles or self-submit.'
			},
			pace_and_control: {
				weakness: 'Turnaround follows vendor queues — often seven days — with little visibility until the report.'
			},
			dr_outcomes: {
				weakness: 'DR gains depend on the vendor list. No in-app DR charts or competitor benchmarks.'
			},
			pricing_model: {
				strength: 'One-time packages from $149 cover a campaign without a monthly subscription.',
				weakness: 'Each new product may need another package. Costs add up across brands.'
			},
			product_focus: {
				strength: 'Built for directory backlinks and launch visibility — not a full social suite.',
				weakness: 'No social publishing, agents, or autofill after the campaign ends.'
			}
		}
	}
};
