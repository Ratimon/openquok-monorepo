import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import { COMPARE_PRODUCT_CATEGORIES_DIRECTORY_SUBMISSION } from '$lib/content/constants/competitors/shared';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { buildDirectorySubmissionAlternativesLongForm } from '$lib/content/constants/competitors/buildCompareLongFormSections';
import { icons } from '$data/icons';

const LAUNCHDIRECTORIES_ALTERNATIVES_LONG_FORM = buildDirectorySubmissionAlternativesLongForm(
	'LaunchDirectories',
	[
		'LaunchDirectories sells one-time submission packages. You wait about four to six business days for the first report.',
		'You fill one intake form after checkout. There is no reusable workspace profile or browser extension autofill.',
		'The vendor also runs a free directory database with DR data. That catalog does not submit listings for you.'
	],
	[
		'You want a team to manually submit thirty to one hundred plus launch directories for one payment.',
		'You like a written report with listing URLs and screenshots on the vendor site.',
		'You may browse their DR database first, then buy Auto Submit when you want hands-off work.'
	]
);

const LAUNCHDIRECTORIES_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Starter List',
		monthlyPrice: 99,
		pricePeriod: 'one_time',
		tagline: 'Manual submission to 30+ curated directories',
		footnote:
			'List price often shown with limited-time discount from $149 · first results in 4–6 business days · detailed submission report (per launchdirectories.com/pricing)'
	},
	{
		name: 'Pro List',
		monthlyPrice: 149,
		pricePeriod: 'one_time',
		tagline: 'Manual submission to 60+ curated directories',
		footnote:
			'List price often shown with limited-time discount from $199 · first results in 4–6 business days · detailed submission report'
	},
	{
		name: 'Premium List',
		monthlyPrice: 199,
		pricePeriod: 'one_time',
		tagline: 'Manual submission to 100+ curated directories',
		footnote: 'First results in 4–6 business days · detailed submission report with listing URLs'
	}
];

const LAUNCHDIRECTORIES_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	official_api: { kind: 'text', text: 'No Info' },
	public_api: { kind: 'excluded' },
	directory_business_profiles: {
		kind: 'text',
		text: 'One checkout form — vendor team submits listings for you'
	},
	directory_extension_autofill: { kind: 'excluded' },
	directory_submission_tracking: {
		kind: 'text',
		text: 'Detailed submission report with listing URLs and proof'
	},
	directory_profile_variants: { kind: 'excluded' },
	directory_analytics: {
		kind: 'text',
		text: 'Vendor DR database for research — not in-app SEO analytics for your workspace'
	},
	directory_competitor_domains: { kind: 'excluded' },
	directory_catalog_dr: {
		kind: 'text',
		text: '100+ directories with DR, traffic, and link-type filters on launchdirectories.com'
	}
};

export const launchdirectoriesCompareProduct: CompareProduct = {
	slug: 'launchdirectories',
	categories: COMPARE_PRODUCT_CATEGORIES_DIRECTORY_SUBMISSION,
	name: 'LaunchDirectories',
	icon: icons.LaunchDirectories.name,
	tagline: 'Done-for-you manual directory submissions in about four to six business days',
	overview:
		'LaunchDirectories runs a searchable startup directory database and sells Auto Submit packages. Share product details once. Their team submits to thirty, sixty, or one hundred plus sites and sends a report.',
	pricingPlans: LAUNCHDIRECTORIES_PRICING_PLANS,
	channels: [],
	featureSupport: LAUNCHDIRECTORIES_FEATURE_SUPPORT,
	directoryLongForm: LAUNCHDIRECTORIES_ALTERNATIVES_LONG_FORM,
	directoryCoverageSummary:
		'30+ directories on Starter List ($99), 60+ on Pro List ($149), and 100+ on Premium List ($199). The public site also lists 100+ vetted directories with DR metrics for DIY research — verify packages on launchdirectories.com/pricing.',
	comparison: {
		headline: 'manual directory campaigns',
		notAnother: 'self-submit workspace',
		builtFor:
			'founders who want a human team to submit startup directories after browsing DR data on the vendor site',
		positioningWhenLeft:
			'combines a curated directory database with one-time manual submission packages and a written delivery report',
		talkingPoints: {
			submission_model: {
				weakness:
					'You pay for a vendor campaign. You do not keep reusable business profiles or self-submit after checkout.'
			},
			pace_and_control: {
				weakness:
					'First results arrive in four to six business days. You wait on their queue until the report lands.'
			},
			dr_outcomes: {
				strength:
					'The vendor publishes DR, traffic, and dofollow filters on many directories in its free database.',
				weakness:
					'DR gains from the paid campaign are in the vendor report — not live charts in your OpenQuok workspace.'
			},
			pricing_model: {
				strength: 'One-time packages from $99 cover a campaign without a monthly subscription.',
				weakness: 'Each new product needs another package. Costs add up across brands.'
			},
			product_focus: {
				strength: 'Directory research plus manual submissions — not a full social scheduling suite.',
				weakness: 'No social publishing, agents, or extension autofill after the campaign ends.'
			}
		}
	}
};