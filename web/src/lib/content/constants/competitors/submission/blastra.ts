import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import { COMPARE_PRODUCT_CATEGORIES_DIRECTORY_SUBMISSION } from '$lib/content/constants/competitors/shared';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { buildDirectorySubmissionAlternativesLongForm } from '$lib/content/constants/competitors/buildCompareLongFormSections';
import { icons } from '$data/icons';

const BLASTRA_ALTERNATIVES_LONG_FORM = buildDirectorySubmissionAlternativesLongForm(
	'Blastra',
	[
		'Blastra sells small action packs and monthly plans. Large directory pushes need several purchases or a higher tier.',
		'The team focuses on B2B review and software marketplaces. It is not a bulk startup launch catalog.',
		'You delegate every submit and update. You do not self-fill launch forms with your own browser extension.'
	],
	[
		'You want experts to claim and update G2, Capterra, and similar buyer directories for you.',
		'You want presence scans and competitor monitoring on review sites without opening each portal.',
		'You want listing logins and status reports in a vendor dashboard plus Blastra MCP on paid plans.'
	]
);

const BLASTRA_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Action Pack 3',
		monthlyPrice: 99,
		pricePeriod: 'one_time',
		tagline: 'Try the service with three done-for-you listing submits or updates',
		footnote:
			'3 listings submitted or updated · full presence scan across 20+ directories · Blastra MCP · listing logins in dashboard'
	},
	{
		name: 'Action Pack 12',
		monthlyPrice: 299,
		pricePeriod: 'one_time',
		tagline: 'First major push or a full refresh on existing review-site profiles',
		footnote: '12 listings submitted or updated · same scan and MCP benefits as Action Pack 3'
	},
	{
		name: 'Pulse',
		monthlyPrice: 59,
		tagline: 'Ongoing monitoring after three setup listings',
		footnote:
			'Setup includes 3 listings · then $59/mo · 1 listing/mo · monthly presence scan · first month included · cancel anytime'
	},
	{
		name: 'Minimum Viable Presence',
		monthlyPrice: 99,
		tagline: 'Heavier maintenance after twelve setup listings',
		footnote:
			'Setup includes 12 listings · then $99/mo · 3 listings/mo · weekly scan · shareable reviews dashboard · Blastra MCP'
	},
	{
		name: 'Enterprise',
		monthlyPrice: null,
		tagline: 'Portfolio-wide review-site operations with a dedicated account manager',
		footnote: 'Custom pricing · shared actions pool across products · weekly per-product scan'
	}
];

const BLASTRA_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	official_api: { kind: 'text', text: 'No Info' },
	public_api: { kind: 'excluded' },
	directory_business_profiles: {
		kind: 'text',
		text: 'Vendor builds listings — you get logins in the Blastra dashboard when live'
	},
	directory_extension_autofill: { kind: 'excluded' },
	directory_submission_tracking: { kind: 'included' },
	directory_profile_variants: {
		kind: 'text',
		text: 'Enterprise shares an actions pool across products'
	},
	directory_analytics: {
		kind: 'text',
		text: 'Presence scan across 20+ directories · periodic listing reports'
	},
	directory_competitor_domains: { kind: 'included' },
	directory_catalog_dr: { kind: 'excluded' },
	mcp_server: { kind: 'included' },
	agent_integrations: { kind: 'text', text: 'Blastra MCP on action packs and subscriptions' }
};

export const blastraCompareProduct: CompareProduct = {
	slug: 'blastra',
	categories: COMPARE_PRODUCT_CATEGORIES_DIRECTORY_SUBMISSION,
	name: 'Blastra',
	icon: icons.Blastra.name,
	tagline: 'Done-for-you B2B review directory presence with scans, dashboard, and MCP',
	overview:
		'Blastra is a managed directory presence service for software buyers and AI citations. Their team submits or updates listings on review and marketplace sites. You track status, logins, and scans in a hosted dashboard.',
	pricingPlans: BLASTRA_PRICING_PLANS,
	channels: [],
	featureSupport: BLASTRA_FEATURE_SUPPORT,
	directoryLongForm: BLASTRA_ALTERNATIVES_LONG_FORM,
	directoryCoverageSummary:
		'30 software and business directories on the vendor homepage (for example G2, Capterra, SourceForge, and TrustRadius). Action packs cover 3 or 12 human submissions per purchase. Subscription tiers add monthly or weekly scans — verify the live list on blastra.io.',
	comparison: {
		headline: 'managed review-site presence',
		notAnother: 'self-submit launch workspace',
		builtFor:
			'teams that want G2, Capterra, and similar buyer directories handled end to end with AI-oriented copy',
		positioningWhenLeft:
			'runs presence scans, submits or updates listings on your behalf, and stores credentials in a vendor dashboard',
		talkingPoints: {
			submission_model: {
				strength:
					'Experts fill every field, handle support tickets, and hand you listing logins when profiles go live.',
				weakness:
					'You wait on the vendor for each listing. You do not reuse OpenQuok profiles or extension autofill.'
			},
			pace_and_control: {
				strength:
					'Subscriptions add monthly or weekly scans and reinstatement work without rebuilding your own ops.',
				weakness:
					'Action packs cap at 3 or 12 listings. You buy again or upgrade when you need more coverage fast.'
			},
			dr_outcomes: {
				strength:
					'Presence scans highlight gaps on review sites buyers and LLMs read. Competitor monitoring ships on the vendor site.',
				weakness:
					'Coverage targets software review directories — not startup launch DR charts in your OpenQuok workspace.'
			},
			pricing_model: {
				strength: '$99 action packs let you test before a $59–$99/mo maintenance plan.',
				weakness:
					'Large multi-directory launches cost more than one-time bulk packs from startup-focused vendors.'
			},
			product_focus: {
				strength: 'Listing copy is tuned for AI answers on buyer and review marketplaces.',
				weakness:
					'No social scheduling, PeerPush-style launch autofill, or AGPL self-host software path.'
			},
			agent_workflow: {
				strength: 'Blastra MCP ships on action packs and subscriptions for agent-driven listing work.',
				weakness:
					'MCP reaches vendor-hosted workflows — not OpenQuok workspace tools, plugs, or per-channel agents.'
			}
		}
	}
};