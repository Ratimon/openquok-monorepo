import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import { COMPARE_PRODUCT_CATEGORIES_SOCIAL_SCHEDULING } from '$lib/content/constants/competitors/shared';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';
import { buildSchedulerAlternativesLongForm } from '$lib/content/constants/competitors/buildCompareLongFormSections';

const ADAPTLYPOST_ALTERNATIVES_LONG_FORM = buildSchedulerAlternativesLongForm(
	'AdaptlyPost',
	[
		'AI credits reset monthly and cap caption and image generation on every tier.',
		'You get a hosted MCP server, but not per-workspace OAuth apps or in-product skill packages.',
		'There is no AGPL self-host path or directory launch extension in the product.'
	],
	[
		'You want fourteen networks, inbox, and API access on a $19 Creator plan.',
		'Chrome, Edge, and Firefox extensions draft posts from any tab with one API token.',
		'Workspaces, roles, and OpenClaw MCP ship on every plan with unlimited scheduled posts.'
	]
);

const ADAPTLYPOST_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Creator',
		monthlyPrice: 19,
		tagline: 'Best for one person running many accounts on one brand',
		footnote: '30 social accounts · 3 workspaces · 150 AI credits/mo · 7-day trial · no card to start'
	},
	{
		name: 'Pro',
		monthlyPrice: 39,
		tagline: 'Best for a small team or freelancer with several client workspaces',
		footnote: '60 accounts · 5 seats · 15 workspaces · 400 AI credits/mo'
	},
	{
		name: 'Enterprise',
		monthlyPrice: 89,
		tagline: 'Best for agencies managing many brands and collaborators',
		footnote: '100 accounts · 20 seats · 50 workspaces · 1,000 AI credits/mo'
	}
];

const ADAPTLYPOST_CHANNELS = [
	'Bluesky',
	'Facebook',
	'Google Business Profile',
	'Instagram',
	'LinkedIn',
	'Mastodon',
	'Pinterest',
	'Telegram',
	'Threads',
	'TikTok',
	'Tumblr',
	'WordPress',
	'X',
	'YouTube'
];

const ADAPTLYPOST_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'text', text: '3 on Creator · up to 50 on Enterprise' },
	channels: { kind: 'text', text: '30–100 connected accounts by plan' },
	posts_per_month: { kind: 'text', text: 'Unlimited scheduled posts' },
	team_members: { kind: 'text', text: '1 on Creator · up to 20 on Enterprise' },
	ai_writer: { kind: 'text', text: 'AI Caption Copilot (uses AI credits)' },
	ai_summarizer: { kind: 'text', text: 'AI humanizer and text tools (credits)' },
	share_post_preview: { kind: 'text', text: 'No Info' },
	official_api: { kind: 'included' },
	public_api: { kind: 'included' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'included' },
	browser_extension: { kind: 'text', text: 'Chrome, Edge, and Firefox store listings' },
	cloud_storage: { kind: 'text', text: 'Media library' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'text', text: 'Hosted MCP (80 tools) + OpenClaw' },
	analytics: { kind: 'included' },
	photo_editor: { kind: 'text', text: 'AI Image Studio (credits)' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'included' },
	repeated_posts: { kind: 'included' },
	reusable_templates: { kind: 'included' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'included' },
	post_comments: {
		kind: 'text',
		text: 'Unified inbox for comments, mentions, DMs, and GBP reviews'
	},
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	cross_account_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'text', text: 'Client workspaces with Admin, Editor, Contributor, Viewer' },
	dark_light_mode: { kind: 'excluded' },
	community: { kind: 'excluded' }
};

export const adaptlypostCompareProduct: CompareProduct = {
	slug: 'adaptlypost',
	categories: COMPARE_PRODUCT_CATEGORIES_SOCIAL_SCHEDULING,
	name: 'AdaptlyPost',
	icon: icons.AdaptlyPost.name,
	tagline: 'Fourteen-platform scheduler with AI, inbox, MCP, and multi-browser extensions',
	overview:
		'AdaptlyPost is a hosted social scheduler for creators and agencies. You connect accounts once, plan on a calendar, and publish to fourteen networks. AI, API, MCP, and browser extensions share the same queue.',
	pricingPlans: ADAPTLYPOST_PRICING_PLANS,
	channels: ADAPTLYPOST_CHANNELS,
	featureSupport: ADAPTLYPOST_FEATURE_SUPPORT,
	alternativesLongForm: ADAPTLYPOST_ALTERNATIVES_LONG_FORM,
	comparison: {
		headline: 'AI scheduling across fourteen networks',
		notAnother: 'single-workspace browser queue',
		builtFor: 'creators and agencies who want AI, inbox, and agents on flat hosted plans',
		positioningWhenLeft:
			'bundles fourteen platforms, unlimited scheduling, inbox, REST API, hosted MCP, and store extensions into tiered monthly plans',
		talkingPoints: {
			agent_workflow: {
				strength:
					'Hosted MCP at mcp.adaptlypost.com ships on every plan with dozens of tools for drafts, media, inbox, and analytics',
				weakness:
					'MCP is org-wide hosted — not a dedicated MCP endpoint, skill package, or kanban queue per client workspace'
			},
			pricing_model: {
				strength:
					'$19 Creator includes API, MCP, extensions, and fourteen platforms with unlimited scheduled posts',
				weakness:
					'AI caption and image work spends monthly credits — no unlimited AI writer or $0 AGPL self-host software fee'
			},
			workspace_isolation: {
				strength: 'Up to fifty client workspaces on Enterprise with role-based publish gates',
				weakness:
					'Creator stays at one seat — separate OAuth apps and agent credentials per brand need higher tiers or manual tokens'
			},
			product_focus: {
				strength: 'Inbox, RSS, bulk CSV, Facebook carousels, and AI Image Studio cover agency publishing',
				weakness:
					'No directory launch extension, Reddit draft handoff, cross-account plugs, or in-product skill builder'
			},
			programmatic_access: {
				strength: 'REST API, connect links for client OAuth, and MCP are included without an enterprise upsell',
				weakness: 'No per-workspace OAuth applications for third-party apps alongside API keys'
			},
			publishing_control: {
				strength:
					'Browser extensions capture quotes, links, and images from any tab into the same calendar queue',
				weakness:
					'Extension auth uses one API token — less isolation than workspace-scoped CLI and MCP on self-host'
			}
		}
	}
};