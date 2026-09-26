import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const SOCIALYNC_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Free',
		monthlyPrice: 0,
		tagline: 'Best for trying cross-posting on a handful of accounts',
		footnote: '5 posts per calendar month · up to 5 connected accounts · 7 platforms (X on paid)'
	},
	{
		name: 'Starter',
		monthlyPrice: 20,
		tagline: 'Best for a single brand that needs unlimited posts and all eight networks',
		footnote: '5 social accounts · 7-day free trial · billed monthly'
	},
	{
		name: 'Creator',
		monthlyPrice: 30,
		tagline: 'Best for creators running short video across many accounts',
		footnote: '10 social accounts · 7-day free trial · billed monthly'
	},
	{
		name: 'Agency',
		monthlyPrice: 99,
		tagline: 'Best for agencies managing a large client roster from one login',
		footnote: '100 social accounts · 7-day free trial · billed monthly'
	}
];

const SOCIALYNC_CHANNELS = [
	'Facebook',
	'Instagram',
	'LinkedIn',
	'X',
	'TikTok',
	'YouTube',
	'Threads',
	'Bluesky'
];

const SOCIALYNC_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'text', text: '1 brand on Free · unlimited brands on paid' },
	channels: { kind: 'text', text: 'Up to 5 accounts on Free · 5–100 on paid' },
	posts_per_month: { kind: 'text', text: '5 on Free · unlimited on paid' },
	team_members: { kind: 'text', text: 'Solo on Free · add collaborators on paid' },
	ai_writer: { kind: 'text', text: 'AI caption assistant on paid plans' },
	ai_summarizer: { kind: 'text', text: 'Video transcript analysis on paid plans' },
	share_post_preview: { kind: 'excluded' },
	official_api: { kind: 'included' },
	public_api: { kind: 'text', text: 'MCP and API on Free and paid' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'text', text: 'MCP included on Free and paid' },
	cloud_storage: { kind: 'text', text: 'Media upload and management' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'text', text: 'Post from Claude, MCP, and API' },
	analytics: { kind: 'text', text: 'Paid plans only' },
	photo_editor: { kind: 'excluded' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'text', text: 'Content calendar on paid plans' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'included' },
	repeated_posts: { kind: 'excluded' },
	reusable_templates: { kind: 'excluded' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'text', text: 'Automatic first comment on paid plans' },
	post_comments: { kind: 'text', text: 'Comment inbox on 6 platforms (paid)' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	cross_account_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'excluded' },
	dark_light_mode: { kind: 'excluded' },
	community: { kind: 'excluded' }
};

export const socialyncCompareProduct: CompareProduct = {
	slug: 'socialync',
	name: 'Socialync',
	icon: icons.Socialync.name,
	tagline: 'Cross-posting app for creators with mobile apps and MCP on the free tier',
	overview:
		'Socialync is a hosted cross-posting scheduler for creators, streamers, and small teams. You connect up to eight networks, upload once, and publish everywhere. The free plan includes five posts per month, MCP and API access, and official platform APIs. Paid plans add unlimited posts, analytics, AI captions, and a unified comment inbox.',
	pricingPlans: SOCIALYNC_PRICING_PLANS,
	channels: SOCIALYNC_CHANNELS,
	featureSupport: SOCIALYNC_FEATURE_SUPPORT,
	comparison: {
		headline: 'mobile-first cross-posting',
		notAnother: 'mobile-only upload flow',
		builtFor: 'creators who want one upload to reach every short-video network',
		positioningWhenLeft:
			'focuses on fast cross-posting, iOS and Android apps, and official APIs with MCP on the free tier',
		talkingPoints: {
			agent_workflow: {
				strength:
					'MCP and API ship on the free plan — you can schedule from Claude or your own scripts without upgrading',
				weakness:
					'Agent access is account-level — no self-hosted skills, workspace MCP endpoints, or open-source audit path'
			},
			pricing_model: {
				strength:
					'Flat plans from $20 per month include five to one hundred social accounts — not per-channel math',
				weakness: 'Free tier caps you at five posts per month and omits analytics, drafts, and comment tools'
			},
			workspace_isolation: {
				strength: 'Unlimited brands on paid plans keep client content separated inside one login',
				weakness:
					'Hosted brands only — not isolated agent workspaces with separate OAuth apps, tokens, and MCP URLs'
			},
			product_focus: {
				strength: 'Native mobile apps and AI caption tools built for short-video cross-posting',
				weakness: 'No kanban review, global plugs, or AGPL self-host path for compliance-heavy teams'
			},
			programmatic_access: {
				strength: 'REST API and MCP on every plan including Free — strong for hobby agents',
				weakness: 'Single-account API keys — not workspace-scoped Public API endpoints per brand or agent'
			},
			publishing_control: {
				strength: 'Schedule up to twelve months ahead on paid plans with a shared content calendar',
				weakness: 'Free plan limits scheduling to two months ahead and five posts per month'
			}
		}
	}
};
