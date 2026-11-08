import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import { COMPARE_PRODUCT_CATEGORIES_SOCIAL_SCHEDULING } from '$lib/content/constants/competitors/shared';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const POSTIZ_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Self-host',
		monthlyPrice: 0,
		tagline: 'Best when you run the open-source stack on your own infrastructure',
		footnote:
			'AGPL-3.0 · no Postiz software fee · you provide Postgres, Redis, Temporal, and hosting · no Stripe = no cloud plan caps'
	},
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
	'Bluesky',
	'Dev.to',
	'Discord',
	'Dribbble',
	'Facebook',
	'Google Business Profile',
	'Hashnode',
	'Instagram',
	'Kick',
	'Lemmy',
	'LinkedIn',
	'Listmonk',
	'Mastodon',
	'Medium',
	'MeWe',
	'Nostr',
	'Pinterest',
	'Reddit',
	'Skool',
	'Slack',
	'Telegram',
	'Threads',
	'TikTok',
	'Twitch',
	'Vk',
	'Warpcast',
	'Whop',
	'WordPress',
	'X',
	'YouTube'
];

const POSTIZ_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'text', text: '1 for all plans' },
	channels: { kind: 'text', text: '5–100 on Cloud · unlimited channels self-host (no Stripe)' },
	posts_per_month: { kind: 'text', text: 'Unlimited on paid plans' },
	team_members: { kind: 'text', text: 'Solo on Standard · unlimited on Team+' },
	ai_writer: { kind: 'excluded' },
	ai_summarizer: { kind: 'excluded' },
	share_post_preview: { kind: 'included' },
	official_api: { kind: 'included' },
	public_api: { kind: 'included' },
	oauth_apps: { kind: 'text', text: 'Only 1 for all plans' },
	mcp_server: { kind: 'text', text: 'Only 1 for all plans' },
	cloud_storage: { kind: 'text', text: 'Media library' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'text', text: 'CLI, MCP, and agent skills' },
	analytics: { kind: 'included' },
	photo_editor: { kind: 'included' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'included' },
	repeated_posts: { kind: 'included' },
	reusable_templates: { kind: 'included' },
	reusable_signatures: { kind: 'included' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'included' },
	post_comments: {
		kind: 'text',
		text: 'Thread/comment parts on most networks; IG/Kick/Twitch comments no media'
	},
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'included' },
	cross_account_plugs: {
		kind: 'text',
		text: 'X repost & LinkedIn comment/reshare; not Threads'
	},
	global_plugs: { kind: 'included' },
	group_management: { kind: 'included' },
	dark_light_mode: { kind: 'included' },
	community: { kind: 'excluded' }
};

export const postizCompareProduct: CompareProduct = {
	slug: 'postiz',
	categories: COMPARE_PRODUCT_CATEGORIES_SOCIAL_SCHEDULING,
	name: 'Postiz',
	icon: icons.Postiz.name,
	tagline: 'Open-source agentic social scheduler with 30+ networks',
	overview:
		'Postiz is open-source scheduling for teams and agencies. Cross-post from a calendar with AI media and analytics. Cloud plans or self-hosted.',
	pricingPlans: POSTIZ_PRICING_PLANS,
	channels: POSTIZ_CHANNELS,
	featureSupport: POSTIZ_FEATURE_SUPPORT,
	alternativesLongForm: {
		whyPeopleLook: {
			id: 'why-people-look',
			navLabel: 'Why people look',
			subtitle: 'Why people look',
			title: 'Why teams look for Postiz alternatives',
			body: [
				'Postiz packs 30-plus networks, AI media, and agent tooling into one open-source stack.',
				'Cloud plans cap connected channels from five to one hundred. That pushes upgrades as you add brands.',
				'Teams also outgrow one workspace, no in-product AI writer, and server-side Reddit publishing when they want human submit on reddit.com.'
			]
		},
		yourOptions: {
			id: 'your-options',
			navLabel: 'Your options',
			subtitle: 'Your options',
			title: 'Stay on Postiz, pick another scheduler, or move to OpenQuok',
			body: [
				'You can self-host Postiz, stay on cloud tiers, or switch schedulers.',
				'The ranked list below shows schedulers with list prices and compare links.',
				'OpenQuok is open source with a $0 self-host software fee or hosted plans with a trial. It adds separate workspaces, unlimited AI writer, directory extension autofill, and Reddit drafts you submit yourself. Read https://www.openquok.com/blog/ai-agents-for-reddit-promote-without-getting-banned for the agent and ban-risk playbook.'
			]
		},
		whenTheyWin: {
			id: 'when-they-win',
			navLabel: 'When they win',
			subtitle: 'When they win',
			title: 'When Postiz stays the better choice',
			body: [
				'You want 30-plus networks with AI image and video generation in one calendar.',
				'Customer groups and RSS auto-post fit how you run client brands today.',
				'You are fine with channel-tier cloud pricing or operating the self-hosted stack yourself.'
			]
		}
	},
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
				weakness:
					'Reddit publishes through Postiz servers — not draft-and-handoff on reddit.com; follow-up delays start at 1 minute'
			}
		}
	}
};
