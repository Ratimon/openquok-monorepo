import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import { COMPARE_PRODUCT_CATEGORIES_SOCIAL_SCHEDULING } from '$lib/content/constants/competitors/shared';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const INFLUENCE_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Starter',
		monthlyPrice: 11,
		tagline: 'Best for a steady posting rhythm on unlimited connected accounts',
		footnote: '50 posts / month · 1,500 Influence IQ credits · 7-day free trial · annual billing $110/year in USD'
	},
	{
		name: 'Growth',
		monthlyPrice: 29,
		tagline: 'Best when you publish more campaigns each month',
		footnote: '150 posts / month · 3,750 Influence IQ credits · annual billing $290/year in USD'
	},
	{
		name: 'Pro',
		monthlyPrice: 29,
		tagline: 'Best for busy calendars with unlimited scheduled posts',
		footnote: 'Unlimited posts · 7,500 Influence IQ credits · annual billing $290/year in USD'
	}
];

const INFLUENCE_CHANNELS = [
	'Facebook',
	'Instagram',
	'LinkedIn',
	'X',
	'TikTok',
	'YouTube',
	'YouTube Shorts',
	'Pinterest',
	'Threads',
	'Bluesky',
	'Google Business Profile',
	'Mastodon',
	'Discord',
	'Slack',
	'Telegram',
	'Reddit',
	'Dev.to'
];

const INFLUENCE_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'excluded' },
	channels: { kind: 'text', text: 'Unlimited connected accounts on paid plans' },
	posts_per_month: { kind: 'text', text: '50 on Starter · 150 on Growth · unlimited on Pro' },
	team_members: { kind: 'text', text: '1 user on published plans' },
	ai_writer: { kind: 'included' },
	ai_summarizer: { kind: 'excluded' },
	share_post_preview: { kind: 'excluded' },
	official_api: { kind: 'included' },
	public_api: { kind: 'text', text: 'MCP & agent guides · no advertised Public REST API' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'included' },
	cloud_storage: { kind: 'text', text: 'Media library for uploads & reuse' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'text', text: 'ChatGPT, Claude, Codex, OpenClaw, Gemini CLI, and more' },
	analytics: { kind: 'included' },
	photo_editor: { kind: 'text', text: 'Influence IQ image creation where available (credits)' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'included' },
	repeated_posts: { kind: 'excluded' },
	reusable_templates: { kind: 'text', text: 'Brand Guidelines & campaign drafts' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'excluded' },
	post_comments: { kind: 'excluded' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	cross_account_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'excluded' },
	dark_light_mode: { kind: 'included' },
	community: { kind: 'included' }
};

export const influenceCompareProduct: CompareProduct = {
	slug: 'influence',
	categories: COMPARE_PRODUCT_CATEGORIES_SOCIAL_SCHEDULING,
	name: 'Influence',
	icon: icons.Influence.name,
	tagline: 'AI social scheduler with Influence IQ and agent-ready MCP',
	overview:
		'Influence is an AI social media scheduler for creators, small businesses, and agencies. You connect social accounts, add Brand Guidelines, and plan campaigns on one calendar. Influence IQ suggests copy, media, and dates for each channel. You can schedule from the dashboard or from ChatGPT, Claude, and other agents through MCP setup guides.',
	pricingPlans: INFLUENCE_PRICING_PLANS,
	channels: INFLUENCE_CHANNELS,
	featureSupport: INFLUENCE_FEATURE_SUPPORT,
	comparison: {
		headline: 'Influence IQ campaign scheduling',
		notAnother: 'Influence IQ autopilot',
		builtFor: 'teams that want AI campaign drafts, engagement inbox, and agent MCP in one hosted scheduler',
		positioningWhenLeft:
			'bundles unlimited account connections on lower tiers, Influence IQ credits, engagement replies, and broad platform coverage',
		talkingPoints: {
			agent_workflow: {
				strength: 'Influence IQ turns a brief into channel-ready drafts you review before you schedule',
				weakness: 'Monthly Influence IQ credits cap drafts, revisions, and image creation on every tier'
			},
			pricing_model: {
				strength: 'Starter lists at $11 per month with unlimited connected accounts in USD',
				weakness: 'Starter and Growth cap monthly posts before you need Pro for unlimited publishing'
			},
			workspace_isolation: {
				strength: 'One calendar shows every connected profile and upcoming campaign',
				weakness: 'One workspace holds every brand, client, and agent context together'
			},
			product_focus: {
				strength: 'Engagement inbox, link analytics, and Influence IQ sit in one AI-native scheduler',
				weakness: 'Blog, email, and community platforms share the same post allowance as social channels'
			},
			programmatic_access: {
				strength: 'MCP server URL and agent guides for ChatGPT, Claude, Codex, and OpenClaw',
				weakness: 'No workspace-scoped Public REST API or OAuth apps for your own automation stack'
			},
			publishing_control: {
				strength: 'You edit each channel version before you add posts to the calendar',
				weakness: 'Activity can mark deliveries as Needs review when a platform rejects a publish attempt'
			}
		}
	}
};
