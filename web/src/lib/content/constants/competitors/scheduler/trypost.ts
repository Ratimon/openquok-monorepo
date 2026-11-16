import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import { COMPARE_PRODUCT_CATEGORIES_SOCIAL_SCHEDULING } from '$lib/content/constants/competitors/shared';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';
import { buildSchedulerAlternativesLongForm } from '$lib/content/constants/competitors/buildCompareLongFormSections';

const TRYPOST_ALTERNATIVES_LONG_FORM = buildSchedulerAlternativesLongForm(
	'TryPost',
	[
		'Socials is one workspace. Multi-brand agencies need the $99 Workspaces plan.',
		'You get MCP and a REST API, but no OAuth apps, plugs, or skill packages per brand.',
		'There is no self-host path or directory launch extension in the product.'
	],
	[
		'You want flat $19 pricing with unlimited accounts and teammates on one brand.',
		'Built-in AI Copilot, analytics, and MCP on every plan fit your stack today.',
		'Approval threads and repurpose flows replace email chains for your clients.'
	]
);

const TRYPOST_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Socials',
		monthlyPrice: 19,
		tagline: 'Best for creators and business owners on one brand or client',
		footnote: '1 workspace · unlimited social accounts · unlimited members · every feature included'
	},
	{
		name: 'Workspaces',
		monthlyPrice: 99,
		tagline: 'Best for agencies and multi-brand owners that need isolated workspaces',
		footnote: 'Unlimited workspaces · same feature bundle as Socials · annual billing saves two months'
	}
];

const TRYPOST_CHANNELS = [
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
	'Discord',
	'Google Business Profile'
];

const TRYPOST_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'text', text: '1 on Socials · unlimited on Workspaces' },
	channels: { kind: 'text', text: 'Unlimited social accounts on all plans' },
	posts_per_month: { kind: 'text', text: 'Unlimited' },
	team_members: { kind: 'text', text: 'Unlimited on all plans' },
	ai_writer: { kind: 'included' },
	ai_summarizer: { kind: 'text', text: 'AI humanizer on all plans' },
	share_post_preview: { kind: 'included' },
	official_api: { kind: 'included' },
	public_api: { kind: 'included' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'included' },
	cloud_storage: { kind: 'text', text: 'Media library + stock/GIF' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'text', text: 'MCP server (31 tools)' },
	analytics: { kind: 'included' },
	photo_editor: { kind: 'excluded' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'included' },
	repeated_posts: { kind: 'included' },
	reusable_templates: { kind: 'included' },
	reusable_signatures: { kind: 'included' },
	smart_filter: { kind: 'text', text: 'Calendar filters by workspace' },
	post_delays: { kind: 'included' },
	post_comments: { kind: 'included' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	cross_account_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'text', text: 'Workspaces per brand or client' },
	dark_light_mode: { kind: 'excluded' },
	community: { kind: 'excluded' }
};

export const trypostCompareProduct: CompareProduct = {
	slug: 'trypost',
	categories: COMPARE_PRODUCT_CATEGORIES_SOCIAL_SCHEDULING,
	name: 'TryPost',
	icon: icons.TryPost.name,
	tagline: 'Flat-price social scheduler with AI, MCP, and team approvals',
	overview:
		'TryPost is a browser scheduler for creators, startups, and agencies. You plan posts on one calendar, publish through official network APIs, and connect AI agents over MCP.',
	pricingPlans: TRYPOST_PRICING_PLANS,
	channels: TRYPOST_CHANNELS,
	featureSupport: TRYPOST_FEATURE_SUPPORT,
	alternativesLongForm: TRYPOST_ALTERNATIVES_LONG_FORM,
	comparison: {
		headline: 'flat-rate AI scheduling with MCP',
		notAnother: 'multi-brand cloud calendar',
		builtFor: 'creators and agencies who want one flat price with AI and MCP built in',
		positioningWhenLeft:
			'bundles unlimited accounts, AI Copilot, analytics, approvals, and MCP into flat monthly plans',
		talkingPoints: {
			agent_workflow: {
				strength: 'MCP ships on every plan so Claude, ChatGPT, or Cursor can draft and schedule from chat',
				weakness:
					'MCP ties to one workspace on Socials — not separate agent skills, kanban review, or checkpoints per brand'
			},
			pricing_model: {
				strength: '$19 Socials covers unlimited accounts and teammates with no per-channel fees',
				weakness:
					'Multi-brand work needs the $99 Workspaces tier — no AGPL self-host with a $0 software fee'
			},
			workspace_isolation: {
				strength: 'Workspaces plan gives each client its own calendar, brand kit, and reviewers',
				weakness: 'Socials holds one workspace — isolated OAuth and MCP endpoints per brand need Workspaces'
			},
			product_focus: {
				strength: 'AI captions, analytics, repurposing, and approvals ship on every tier',
				weakness:
					'No directory launch extension, cross-account plugs, or in-product skill builder for agent recipes'
			},
			programmatic_access: {
				strength: 'REST API and MCP are included on Socials and Workspaces with no Business upsell',
				weakness: 'No per-workspace OAuth apps for third-party integrations alongside MCP'
			},
			publishing_control: {
				strength: 'Shareable approval links and inline review threads sit next to each post preview',
				weakness: 'Repurpose auto-publishes from a watch account — less handoff than draft-first agent queues'
			}
		}
	}
};