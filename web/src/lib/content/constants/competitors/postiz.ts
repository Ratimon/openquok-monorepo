import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const POSTIZ_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Standard',
		monthlyPrice: 29,
		tagline: 'Best for content creators scheduling across a handful of channels',
		footnote: '5 channels · 7-day free trial · annual billing saves ~20%'
	},
	{
		name: 'Team',
		monthlyPrice: 39,
		tagline: 'Best for small brands that need team seats and customer groups',
		footnote: '10 channels · unlimited team members · RSS auto-post'
	},
	{
		name: 'Pro',
		monthlyPrice: 49,
		tagline: 'Best for businesses connecting more networks and AI media quota',
		footnote: '30 channels · unlimited team members'
	},
	{
		name: 'Ultimate',
		monthlyPrice: 99,
		tagline: 'Best for agencies managing many channels across brands',
		footnote: '100 channels · unlimited team members'
	}
];

const POSTIZ_CHANNELS = [
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
	'Google Business Profile',
	'Reddit',
	'Discord',
	'Slack',
	'Telegram'
];

const POSTIZ_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'excluded' },
	channels: { kind: 'text', text: '5–100 by plan' },
	posts_per_month: { kind: 'text', text: 'Unlimited on paid plans' },
	team_members: { kind: 'text', text: 'Solo on Standard · unlimited on Team+' },
	ai_writer: { kind: 'excluded' },
	ai_summarizer: { kind: 'excluded' },
	share_post_preview: { kind: 'excluded' },
	public_api: { kind: 'included' },
	oauth_apps: { kind: 'text', text: 'Custom integrations / OAuth' },
	mcp_server: { kind: 'included' },
	cloud_storage: { kind: 'text', text: 'Media library (plan limits apply)' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'text', text: 'CLI, MCP, and agent skills' },
	analytics: { kind: 'included' },
	photo_editor: { kind: 'included' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'included' },
	repeated_posts: { kind: 'included' },
	reusable_templates: { kind: 'text', text: 'Posting sets' },
	reusable_signatures: { kind: 'included' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'included' },
	post_comments: { kind: 'included' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'included' },
	global_plugs: { kind: 'included' },
	group_management: { kind: 'text', text: 'Customer groups (Team+)' },
	dark_light_mode: { kind: 'included' },
	community: { kind: 'excluded' }
};

export const postizCompareProduct: CompareProduct = {
	slug: 'postiz',
	name: 'Postiz',
	icon: icons.Postiz.name,
	tagline: 'Open-source agentic social scheduler with 30+ networks',
	overview:
		'Postiz is an open-source social media scheduling suite for creators, teams, and agencies. It covers cross-posting, a visual calendar, AI text/image/video generation, analytics, plugs, and agent paths via REST API, CLI, and MCP — with channel-based cloud plans from Standard through Ultimate, plus a self-hosted option.',
	pricingPlans: POSTIZ_PRICING_PLANS,
	channels: POSTIZ_CHANNELS,
	featureSupport: POSTIZ_FEATURE_SUPPORT,
	comparison: {
		headline: 'AI-heavy open-source automation',
		notAnother: 'agentic automation suite',
		builtFor: 'builders who want 30-plus networks, AI generation, and agent-first automation',
		positioningWhenLeft:
			'packs network breadth, AI media generation, analytics, and agent tooling into one open-source stack',
		talkingPoints: {
			agent_workflow: {
				strength: 'CLI, MCP, and agent skills drive drafting and scheduling from ChatGPT, Claude, or OpenClaw',
				weakness:
					'Agent-first autopilot and in-product AI generation — less emphasis on a human checkpoint before publish'
			},
			pricing_model: {
				strength: 'Channel-tiered cloud plans plus a free self-hosted path for operators who want full control',
				weakness: 'Channel allowances (5–100) that force plan jumps as you connect more accounts'
			},
			workspace_isolation: {
				strength: 'Customer groups on Team+ keep brands and clients organized inside one login',
				weakness: 'Customer groups organize channels — not isolated agent workspaces with separate tokens and MCP endpoints'
			},
			product_focus: {
				strength: 'Broad suite: AI images/video, analytics, plugs, RSS auto-post, and 30-plus integrations',
				weakness: 'Broad AI generation and analytics suite when you mainly need focused scheduling and review'
			},
			programmatic_access: {
				strength: 'REST API, webhooks, CLI, and MCP are first-class product paths on paid plans',
				weakness: 'Account-level API and MCP access — not workspace-scoped endpoints per brand or agent'
			},
			publishing_control: {
				strength: 'Visual calendar with per-channel previews before you schedule across networks',
				weakness: 'Smart Agent and auto actions lean toward generation and autopilot over explicit draft approval'
			}
		}
	}
};
