import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import { COMPARE_PRODUCT_CATEGORIES_DIRECTORY_SUBMISSION } from '$lib/content/constants/competitors/shared';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { buildDirectorySubmissionAlternativesLongForm } from '$lib/content/constants/competitors/buildCompareLongFormSections';
import { icons } from '$data/icons';

const SUBMITATOR_ALTERNATIVES_LONG_FORM = buildDirectorySubmissionAlternativesLongForm(
	'Submitator',
	[
		'Submitator runs automated directory submissions from a hosted dashboard.',
		'You pay once per product. Each extra product needs another plan on the vendor site.',
		'You pick directories from their catalog. OpenQuok does not run vendor browser automation for you.'
	],
	[
		'You want cheap bulk submissions in about 24-48 hours without opening each form.',
		'You want real-time status, DR charts, and competitor benchmarks in one dashboard.',
		'Badge-gated directories fit you when you can install their footer component on your site.'
	]
);

const SUBMITATOR_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Starter',
		monthlyPrice: 29,
		pricePeriod: 'one_time',
		tagline: '30 directories with dashboard and real-time tracking',
		footnote: 'One product per plan · choose directories · detailed report · IndexMachine bonus per vendor'
	},
	{
		name: 'Growth',
		monthlyPrice: 49,
		pricePeriod: 'one_time',
		tagline: '60 directories with priority queue and category targeting',
		footnote: 'Everything in Starter · higher DR picks · priority queue'
	},
	{
		name: 'Scale',
		monthlyPrice: 79,
		pricePeriod: 'one_time',
		tagline: '100 directories with premium picks and re-submission if removed',
		footnote: 'Everything in Growth · premium directories · priority support'
	},
	{
		name: 'All Directories',
		monthlyPrice: 149,
		pricePeriod: 'one_time',
		tagline: 'Full catalog (170+ now) plus directories added after purchase',
		footnote: 'One product · locked-in price for that project · verify catalog size on submitator.com'
	}
];

const SUBMITATOR_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	official_api: { kind: 'text', text: 'No Info' },
	public_api: { kind: 'text', text: 'Agency resell API only' },
	directory_business_profiles: {
		kind: 'text',
		text: 'Editable startup profile in vendor dashboard'
	},
	directory_extension_autofill: { kind: 'excluded' },
	directory_submission_tracking: { kind: 'included' },
	directory_profile_variants: {
		kind: 'text',
		text: 'One product workspace per plan'
	},
	directory_analytics: { kind: 'included' },
	directory_competitor_domains: { kind: 'included' },
	directory_catalog_dr: { kind: 'included' }
};

export const submitatorCompareProduct: CompareProduct = {
	slug: 'submitator',
	categories: COMPARE_PRODUCT_CATEGORIES_DIRECTORY_SUBMISSION,
	name: 'Submitator',
	icon: icons.Submitator.name,
	tagline: 'Automated startup directory submissions from $29 with a live dashboard',
	overview:
		'Submitator is a self-serve directory launch service. You set up your product once in the dashboard. Automation submits to the directories you pick and you track status in real time.',
	pricingPlans: SUBMITATOR_PRICING_PLANS,
	channels: [],
	featureSupport: SUBMITATOR_FEATURE_SUPPORT,
	directoryLongForm: SUBMITATOR_ALTERNATIVES_LONG_FORM,
	directoryCoverageSummary:
		'170+ directories in the vendor catalog (Starter 30, Growth 60, Scale 100, All Directories $149 for the full catalog plus future additions). You choose targets and see DR per site in the app — verify counts on submitator.com.',
	comparison: {
		headline: 'automated directory dashboard',
		notAnother: 'self-submit workspace',
		builtFor: 'founders who want fast bulk directory automation with DR tracking in one vendor dashboard',
		positioningWhenLeft:
			'runs browser automation from a hosted dashboard so most packages complete in about 24-48 hours',
		talkingPoints: {
			submission_model: {
				strength:
					'You reuse one dashboard profile and pick directories from a large catalog without hand-filling each form.',
				weakness:
					'Vendor automation submits for you. You do not own reusable OpenQuok profiles or extension autofill.'
			},
			pace_and_control: {
				strength: 'Most directories go out in about 24-48 hours on the vendor site.',
				weakness:
					'You depend on vendor queues and automation rules. You cannot self-submit on your own schedule.'
			},
			dr_outcomes: {
				strength: 'Daily Ahrefs DR charts and competitor benchmarks live in the vendor dashboard.',
				weakness: 'Analytics stay in their app. Your OpenQuok workspace does not mirror that data.'
			},
			pricing_model: {
				strength: 'One-time packs start at $29 for 30 directories without a monthly subscription.',
				weakness: 'Each new product needs another plan. Costs stack across multiple launches.'
			},
			product_focus: {
				strength: 'Directory automation, badges, and DR tracking — not a general social suite.',
				weakness: 'No social scheduling, agents, or OpenQuok directory self-submit after the run.'
			}
		}
	}
};
