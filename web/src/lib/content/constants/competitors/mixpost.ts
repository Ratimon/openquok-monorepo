import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const MIXPOST_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Lite',
		monthlyPrice: 0,
		tagline: 'Best for individuals self-hosting essential scheduling',
		footnote: 'Open-source · Facebook Pages, X, and Mastodon · basic analytics'
	},
	{
		name: 'Pro',
		monthlyPrice: 299,
		pricePeriod: 'one_time',
		tagline: 'Best for teams and agencies that need the full platform on their server',
		footnote: 'One-time license · 1-year free updates · unlimited accounts and team members'
	},
	{
		name: 'Enterprise',
		monthlyPrice: 1199,
		pricePeriod: 'one_time',
		tagline: 'Best for resellers building a self-hosted social SaaS',
		footnote: 'One-time license · subscription billing, coupons, and white-label branding'
	}
];

const MIXPOST_CHANNELS = [
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
	'Google Business Profile'
];

const MIXPOST_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'text', text: 'Unlimited workspaces on Pro+' },
	channels: { kind: 'text', text: 'Unlimited accounts per platform' },
	posts_per_month: { kind: 'text', text: 'Unlimited' },
	team_members: { kind: 'text', text: 'Unlimited on all editions' },
	ai_writer: { kind: 'text', text: 'AI Assistant (Pro+)' },
	ai_summarizer: { kind: 'excluded' },
	share_post_preview: { kind: 'included' },
	public_api: { kind: 'text', text: 'REST API (Pro+)' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'text', text: 'MCP server (Pro+)' },
	cloud_storage: { kind: 'text', text: 'Self-hosted media library' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'text', text: 'API, MCP, and webhooks on Pro+' },
	analytics: { kind: 'text', text: 'Basic on Lite · advanced on Pro+' },
	photo_editor: { kind: 'excluded' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'included' },
	repeated_posts: { kind: 'text', text: 'Posting queue (Pro+)' },
	reusable_templates: { kind: 'text', text: 'Post templates (Pro+)' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'text', text: 'Posting schedule queue (Pro+)' },
	post_comments: { kind: 'text', text: 'First comment (Pro+)' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'excluded' },
	dark_light_mode: { kind: 'included' },
	community: { kind: 'included' }
};

export const mixpostCompareProduct: CompareProduct = {
	slug: 'mixpost',
	name: 'Mixpost',
	icon: icons.Mixpost.name,
	tagline: 'Open-source, self-hosted social suite with one-time paid editions',
	overview:
		'Mixpost is a self-hosted social media management platform for agencies, businesses, and creators who want data on their own infrastructure. Schedule across major networks, collaborate with unlimited team members, and extend Pro with analytics, approvals, API access, MCP, and webhooks — starting from a free open-source Lite edition or one-time Pro and Enterprise licenses.',
	pricingPlans: MIXPOST_PRICING_PLANS,
	channels: MIXPOST_CHANNELS,
	featureSupport: MIXPOST_FEATURE_SUPPORT,
	comparison: {
		headline: 'self-hosted social suite',
		notAnother: 'browser-only scheduler',
		builtFor:
			'Laravel teams and operators who want one-time licenses, unlimited seats, and full control on their own servers',
		positioningWhenLeft:
			'combines open-source Lite with paid Pro and Enterprise tiers for analytics, collaboration, API, MCP, and multi-workspace isolation on your infrastructure',
		talkingPoints: {
			agent_workflow: {
				strength:
					'MCP server on Pro+ lets assistants draft and schedule while tokens stay on your self-hosted instance',
				weakness:
					'Agent paths require Pro license and your own server ops — not a managed workspace with built-in agent checkpoints'
			},
			pricing_model: {
				strength:
					'One-time Pro license ($299) with unlimited accounts and team members instead of recurring per-seat SaaS',
				weakness:
					'Upfront license plus hosting and maintenance — no flat monthly hosted plan with a free trial'
			},
			workspace_isolation: {
				strength: 'Unlimited workspaces on Pro+ keep clients and brands separated on one installation',
				weakness:
					'Workspaces live on your server — not isolated agent workspaces with separate OAuth apps and MCP endpoints per automation context'
			},
			product_focus: {
				strength:
					'Full self-hosted suite: analytics, engagement inbox, approvals, AI assistant, and multilingual UI',
				weakness:
					'Broader Laravel stack to deploy and upgrade when you mainly need agent-native scheduling without server ownership'
			},
			programmatic_access: {
				strength: 'REST API, MCP, and webhooks ship with Pro for automation on infrastructure you control',
				weakness: 'API and MCP gated behind paid Pro — not included on every hosted tier like Public API + CLI + MCP'
			},
			publishing_control: {
				strength: 'Approval workflows and post versions help teams review before content goes live on Pro+',
				weakness:
					'Self-host only — no managed cloud app; you operate updates, backups, and platform compliance yourself'
			}
		}
	}
};
