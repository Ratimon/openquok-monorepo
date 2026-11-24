import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import { COMPARE_PRODUCT_CATEGORIES_SOCIAL_SCHEDULING } from '$lib/content/constants/competitors/shared';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';
import { buildSchedulerAlternativesLongForm } from '$lib/content/constants/competitors/buildCompareLongFormSections';


const POSTPONE_ALTERNATIVES_LONG_FORM = buildSchedulerAlternativesLongForm(
	'Postpone',
	[
		'Flat plans cap connected accounts before agency volume scales.',
		'GraphQL API and MCP sit on paid tiers — there is no self-host path.',
		'Reddit posts publish from Postpone servers — not a draft you submit yourself on reddit.com.'
	],
	[
		'You schedule Reddit, X, and twelve other networks from one calendar.',
		'Client Connect and agency tiers fit teams that live in one hosted dashboard.',
		'Postpone AI, inbox, and Zapier automations cover your stack without extra dev work.'
	]
);



const POSTPONE_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Free',
		monthlyPrice: 0,
		tagline: 'Best for trying scheduling on up to two connected accounts',
		footnote: '2 social accounts · limited scheduled posts (per plan caps on postpone.app/plans)'
	},
	{
		name: 'Starter',
		monthlyPrice: 25,
		tagline: 'Best for creators who need AI drafting on a few accounts',
		footnote: '3 social accounts · 250 scheduled posts/mo · lower on annual billing'
	},
	{
		name: 'Creator',
		monthlyPrice: 45,
		tagline: 'Best for creators managing several networks with AI inbox assist',
		footnote: '6 social accounts · 2,000 scheduled posts/mo · AI for posts and inbox'
	},
	{
		name: 'Professional',
		monthlyPrice: 99,
		tagline: 'Best for brands and small teams with client management',
		footnote:
			'12 social accounts · 8,000 scheduled posts/mo · unlimited teammates · Client Manager'
	},
	{
		name: 'Agency',
		monthlyPrice: 199,
		tagline: 'Best for agencies running many client accounts',
		footnote: '25 social accounts · 25,000 scheduled posts/mo · Secure Connect · priority support'
	},
	{
		name: 'Business',
		monthlyPrice: 299,
		tagline: 'Best for large brands at the top public account cap',
		footnote: '50 social accounts · 50,000 scheduled posts/mo · API, MCP, and automation limits per plan'
	}
];

const POSTPONE_CHANNELS = [
	'Reddit',
	'Facebook',
	'Instagram',
	'LinkedIn',
	'X',
	'TikTok',
	'YouTube',
	'Pinterest',
	'Threads',
	'Bluesky',
	'Mastodon',
	'Telegram',
	'Tumblr'
];

const POSTPONE_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'text', text: 'Client Manager on Professional+' },
	channels: { kind: 'text', text: '2 on Free · 3–50 connected accounts on paid (by plan)' },
	posts_per_month: { kind: 'text', text: 'Capped per plan (e.g. 250–50,000 scheduled posts)' },
	team_members: { kind: 'text', text: 'Unlimited teammates on Professional+' },
	ai_writer: { kind: 'included' },
	ai_summarizer: { kind: 'excluded' },
	share_post_preview: { kind: 'included' },
	official_api: { kind: 'included' },
	public_api: { kind: 'text', text: 'GraphQL API on every paid plan' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'text', text: 'MCP on every paid plan' },
	cloud_storage: { kind: 'text', text: 'Content Library' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'text', text: 'MCP + Claude, ChatGPT, Grok, and similar integrations' },
	analytics: { kind: 'included' },
	photo_editor: { kind: 'included' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'included' },
	repeated_posts: { kind: 'included' },
	reusable_templates: { kind: 'included' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'text', text: 'Best-time recommendations from engagement data' },
	post_comments: { kind: 'included' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	cross_account_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'text', text: 'Client records and connect links on agency tiers' },
	dark_light_mode: { kind: 'excluded' },
	community: { kind: 'excluded' }
};

export const postponeCompareProduct: CompareProduct = {
	slug: 'postpone',
	categories: COMPARE_PRODUCT_CATEGORIES_SOCIAL_SCHEDULING,
	name: 'Postpone',
	icon: icons.Postpone.name,
	tagline: 'All-in-one scheduler with strong Reddit tooling and agency client connect',
	overview:
		'Postpone is a hosted scheduler for creators, brands, and agencies. It covers thirteen networks with AI, analytics, inbox, and calendar views. Paid plans add GraphQL API and MCP for agents.',
	pricingPlans: POSTPONE_PRICING_PLANS,
	channels: POSTPONE_CHANNELS,
	featureSupport: POSTPONE_FEATURE_SUPPORT,
	alternativesLongForm: POSTPONE_ALTERNATIVES_LONG_FORM,
	comparison: {
		headline: 'Reddit-first scheduling with agency client connect',
		notAnother: 'bulk calendar tab',
		builtFor: 'creators and agencies who want Reddit depth and client OAuth connect in one hosted app',
		positioningWhenLeft:
			'keeps Reddit workflows, client connect links, and a familiar calendar in a single SaaS dashboard',
		talkingPoints: {
			agent_workflow: {
				strength: 'MCP and chat integrations on paid plans let you schedule from Claude or ChatGPT',
				weakness:
					'MCP and GraphQL API need a paid plan — no workspace-scoped Public API or skill builder on Free'
			},
			pricing_model: {
				strength: 'Flat monthly tiers bundle accounts and post caps for predictable SaaS billing',
				weakness: 'Account and post caps per tier climb before you need Business or custom limits'
			},
			workspace_isolation: {
				strength: 'Client Manager and Secure Connect separate client accounts without sharing passwords',
				weakness:
					'Client records organize accounts — not isolated agent tokens and MCP endpoints per workspace'
			},
			product_focus: {
				strength: 'Deep Reddit tooling, subreddit manager, and cross-platform calendar in one product',
				weakness:
					'No directory launch extension, cross-account plugs, or kanban review — calendar-first workflow only'
			},
			programmatic_access: {
				strength: 'GraphQL API and MCP ship on every paid plan for custom automations',
				weakness: 'No open-source self-host or Public API on the free tier for always-on agent cron'
			},
			publishing_control: {
				strength: 'Reviews, approvals, and client portal on agency-ready tiers',
				weakness:
					'Reddit posts publish through Postpone — not draft-and-handoff you submit yourself on reddit.com'
			}
		}
	}
};