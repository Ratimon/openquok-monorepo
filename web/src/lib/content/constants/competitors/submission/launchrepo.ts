import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import { COMPARE_PRODUCT_CATEGORIES_DIRECTORY_SUBMISSION } from '$lib/content/constants/competitors/shared';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { buildDirectorySubmissionAlternativesLongForm } from '$lib/content/constants/competitors/buildCompareLongFormSections';
import { icons } from '$data/icons';

const LAUNCHREPO_ALTERNATIVES_LONG_FORM = buildDirectorySubmissionAlternativesLongForm(
	'LaunchRepo',
	[
		'LaunchRepo sells a one-time Git toolkit. Your agent submits listings in your own browser session.',
		'You need Git, Python, Chrome, and an agent with file access plus Chrome DevTools MCP.',
		'You keep a private repo clone. There is no hosted workspace or OpenQuok extension autofill.'
	],
	[
		'You already run a coding agent locally and want playbooks for hundreds of launch sites.',
		'One payment covers every product your company owns. You reuse the same process.',
		'You accept CAPTCHA, 2FA, and paid-route pauses instead of a managed team.'
	]
);

const LAUNCHREPO_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'LaunchRepo',
		monthlyPrice: 130,
		pricePeriod: 'one_time',
		tagline: 'Full toolkit licence for unlimited products you or your company own',
		footnote:
			'Reference ~$130 USD — vendor checkout €119 incl. VAT (€139 minus €20 at checkout) · verify live price on launchrepo.dev/pricing'
	}
];

const LAUNCHREPO_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	official_api: { kind: 'text', text: 'No Info' },
	public_api: { kind: 'excluded' },
	directory_business_profiles: {
		kind: 'text',
		text: 'Reusable product brief template in your private repo'
	},
	directory_extension_autofill: { kind: 'excluded' },
	directory_submission_tracking: {
		kind: 'text',
		text: 'Local dashboard and tracker with defined submission states'
	},
	directory_profile_variants: {
		kind: 'text',
		text: 'One product workspace per repo — not SaaS profile variants'
	},
	directory_analytics: { kind: 'excluded' },
	directory_competitor_domains: { kind: 'excluded' },
	directory_catalog_dr: {
		kind: 'text',
		text: '299 platform playbooks in the public directory catalog'
	}
};

export const launchrepoCompareProduct: CompareProduct = {
	slug: 'launchrepo',
	categories: COMPARE_PRODUCT_CATEGORIES_DIRECTORY_SUBMISSION,
	name: 'LaunchRepo',
	icon: icons.LaunchRepo.name,
	tagline: 'One-time agent toolkit for directory launches on your machine',
	overview:
		'LaunchRepo is a private Git repository of directory playbooks and launch prompts. Pay once. Run your own agent with Chrome to submit listings and track results locally.',
	pricingPlans: LAUNCHREPO_PRICING_PLANS,
	channels: [],
	featureSupport: LAUNCHREPO_FEATURE_SUPPORT,
	directoryLongForm: LAUNCHREPO_ALTERNATIVES_LONG_FORM,
	directoryCoverageSummary:
		'299 active platform guides across launch sites, AI tool directories, software listings, B2B review sites, startup profiles, and communities (per launchrepo.dev/directories). The default run uses zero-cost routes that fit your product — verify counts on the vendor site.',
	comparison: {
		headline: 'agent-driven directory toolkit',
		notAnother: 'hosted directory workspace',
		builtFor:
			'founders who already use a local coding agent with Chrome and want dated playbooks per launch site',
		positioningWhenLeft:
			'ships a one-time repo with platform instructions, a product brief template, and a local tracker your agent updates',
		talkingPoints: {
			submission_model: {
				strength:
					'You buy once and reuse the repo for every product you own. No per-site vendor intake.',
				weakness:
					'You clone a repo and wire Git, Python, and Chrome MCP yourself. No cloud business profiles.'
			},
			pace_and_control: {
				strength:
					'You choose platforms, parallel limits, and when to resume. The agent runs in your session.',
				weakness:
					'CAPTCHAs, 2FA, and paid routes stop until you act. Nothing runs while the agent is off.'
			},
			dr_outcomes: {
				weakness:
					'The tracker records submission states. It does not chart domain rating or competitor benchmarks.'
			},
			pricing_model: {
				strength: 'One-time licence with no subscription to the vendor.',
				weakness: 'You still pay your agent provider for model usage on every run.'
			},
			product_focus: {
				strength: 'Playbooks and prompts focus on directory launches — not a full social suite.',
				weakness: 'No social scheduling, workspace MCP, or OpenQuok-style extension autofill.'
			}
		}
	}
};
