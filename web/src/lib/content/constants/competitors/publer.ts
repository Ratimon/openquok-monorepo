import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const PUBLER_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Free',
		monthlyPrice: 0,
		tagline: 'Best for individuals testing scheduling on up to three social accounts',
		footnote: '3 accounts (no X) · 10 scheduled posts per account · 1 workspace · 25 drafts'
	},
	{
		name: 'Professional',
		monthlyPrice: 5,
		tagline: 'Best for solopreneurs who need unlimited scheduling and X support',
		footnote: 'From $5/mo per social account · +$4/mo per extra account · 7-day trial · lower on annual billing'
	},
	{
		name: 'Business',
		monthlyPrice: 10,
		tagline: 'Best for teams that need analytics, recycling, API access, and MCP',
		footnote: 'From $10/mo per social account · +$7/mo per extra account · 14-day trial · lower on annual billing'
	},
	{
		name: 'Enterprise',
		monthlyPrice: null,
		tagline: 'Best for large organizations that need custom volume and onboarding',
		footnote: 'Custom pricing · 1:1 onboarding · prioritized support'
	}
];

const PUBLER_CHANNELS = [
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
	'Telegram'
];

const PUBLER_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'text', text: '1 on Free · unlimited on paid' },
	channels: { kind: 'text', text: 'Per-account pricing · 10th account free' },
	posts_per_month: { kind: 'text', text: '10/account on Free · unlimited on paid (daily caps)' },
	team_members: { kind: 'text', text: 'Owner included · +$2–3/mo per extra member' },
	ai_writer: { kind: 'text', text: 'Unlimited on Business · BYO OpenAI key on Professional' },
	ai_summarizer: { kind: 'excluded' },
	share_post_preview: { kind: 'included' },
	official_api: { kind: 'included' },
	public_api: { kind: 'text', text: 'Business & Enterprise only' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'text', text: 'Business & Enterprise (eligible customers)' },
	cloud_storage: { kind: 'text', text: 'Unlimited media library on paid' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'text', text: 'Publer MCP on Business+' },
	analytics: { kind: 'text', text: 'Business+ (Professional has no analytics)' },
	photo_editor: { kind: 'included' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'included' },
	repeated_posts: { kind: 'text', text: 'Recycling & recurring on Business+' },
	reusable_templates: { kind: 'excluded' },
	reusable_signatures: { kind: 'included' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'text', text: 'AutoSchedule queue & best times (Business+)' },
	post_comments: { kind: 'included' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	cross_account_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'text', text: 'Workspaces with roles on Business+' },
	dark_light_mode: { kind: 'excluded' },
	community: { kind: 'excluded' }
};

export const publerCompareProduct: CompareProduct = {
	slug: 'publer',
	name: 'Publer',
	icon: icons.Publer.name,
	pricingUnit: 'per_channel',
	tagline: 'Affordable social scheduler with bulk tools and agency workspaces',
	overview:
		'Publer is a social media management platform for creators, small businesses, and agencies. You get a drag-and-drop calendar, bulk CSV scheduling, Link in Bio, RSS automations, and optional analytics, API, and MCP on higher tiers — with per-account pricing from a free plan through Business and Enterprise.',
	pricingPlans: PUBLER_PRICING_PLANS,
	channels: PUBLER_CHANNELS,
	featureSupport: PUBLER_FEATURE_SUPPORT,
	comparison: {
		headline: 'bulk scheduling and affordable per-account pricing',
		notAnother: 'bulk uploader tab',
		builtFor: 'solopreneurs and agencies who want CSV bulk scheduling and a familiar calendar UI',
		positioningWhenLeft:
			'keeps per-account pricing low, packs bulk CSV scheduling, recycling, and multi-workspace collaboration into one dashboard',
		talkingPoints: {
			agent_workflow: {
				strength: 'AI Assist and Publer MCP on Business connect drafting to supported AI clients',
				weakness:
					'AI Assist and MCP sit behind Business — no workspace-scoped skills or agent checkpoints on lower tiers'
			},
			pricing_model: {
				strength: 'Free tier plus Professional from $5/mo per account with a free 10th account discount',
				weakness: 'Per-account and per-member add-ons that climb before the 10th-account discount applies'
			},
			workspace_isolation: {
				strength: 'Unlimited workspaces on paid plans with roles and approvals on Business',
				weakness: 'Workspaces organize accounts — not isolated agent tokens and MCP endpoints per workspace'
			},
			product_focus: {
				strength: 'CSV bulk upload, RSS automations, Link in Bio, and recycling for high-volume schedulers',
				weakness: 'Analytics, API, and MCP require Business — Professional is scheduling without performance reports'
			},
			programmatic_access: {
				weakness: 'Publer API and MCP on Business+ only — no Public API or CLI on Free or Professional'
			},
			publishing_control: {
				strength: 'Approval workflows and permission levels on Business for client-ready queues',
				weakness: 'Approval roles and advanced collaboration start on Business, not the $5 Professional tier'
			}
		}
	}
};
