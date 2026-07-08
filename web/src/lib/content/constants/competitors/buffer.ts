import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const BUFFER_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Free',
		monthlyPrice: 0,
		tagline: 'Best for individuals scheduling on up to three channels',
		footnote: 'Up to 3 channels · 10 scheduled posts per channel'
	},
	{
		name: 'Essentials',
		monthlyPrice: 6,
		tagline: 'Best for creators who need unlimited scheduling and analytics per channel',
		footnote: 'From $6/channel / month · lower on annual billing and volume tiers'
	},
	{
		name: 'Team',
		monthlyPrice: 12,
		tagline: 'Best for teams that need approvals, access controls, and unlimited members',
		footnote: 'From $12/channel / month · lower on annual billing and volume tiers'
	}
];

const BUFFER_CHANNELS = [
	'Facebook',
	'Instagram',
	'LinkedIn',
	'X',
	'TikTok',
	'YouTube Shorts',
	'Pinterest',
	'Threads',
	'Bluesky',
	'Mastodon',
	'Google Business Profile'
];

const BUFFER_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'excluded' },
	channels: { kind: 'text', text: 'Per-channel pricing' },
	posts_per_month: { kind: 'text', text: '10/channel on Free · unlimited on paid' },
	team_members: { kind: 'text', text: '1 on Free/Essentials · unlimited on Team' },
	share_post_preview: { kind: 'included' },
	public_api: { kind: 'text', text: 'REST API (rate limits by plan)' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'excluded' },
	cloud_storage: { kind: 'text', text: 'Media library (plan limits apply)' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'excluded' },
	analytics: { kind: 'included' },
	photo_editor: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'included' },
	repeated_posts: { kind: 'included' },
	reusable_templates: { kind: 'included' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'text', text: 'Queue slots' },
	post_comments: { kind: 'included' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'text', text: 'Channel groups on paid plans' },
	dark_light_mode: { kind: 'included' },
	community: { kind: 'included' }
};

export const bufferCompareProduct: CompareProduct = {
	slug: 'buffer',
	name: 'Buffer',
	icon: icons.Buffer.name,
	tagline: 'Social media toolkit for creators and teams since 2010',
	overview:
		'Buffer is a social media management suite for individuals, creators, and small teams. It offers queue-based scheduling, an AI assistant, a community inbox, analytics, and a REST API — with per-channel pricing, volume discounts, and a free plan for up to three channels.',
	pricingPlans: BUFFER_PRICING_PLANS,
	channels: BUFFER_CHANNELS,
	featureSupport: BUFFER_FEATURE_SUPPORT,
	comparison: {
		headline: 'queue-based scheduling',
		notAnother: 'queue tab',
		builtFor: 'creators and small teams in a browser queue',
		positioningWhenLeft:
			'keeps scheduling simple with per-channel pricing, volume discounts, and a familiar publishing queue',
		talkingPoints: {
			agent_workflow: {
				strength: 'AI Assistant built into the queue for drafting and repurposing content',
				weakness: 'AI Assistant lives inside Buffer — copy still required for external agent workflows'
			},
			pricing_model: {
				strength: 'Free plan plus per-channel pricing with volume discounts as you add networks',
				weakness: 'Per-channel pricing that climbs before volume tiers kick in'
			},
			workspace_isolation: {
				strength: 'Simple queue for solo creators — no enterprise workspace sprawl',
				weakness: 'One queue for every brand, client, and channel'
			},
			product_focus: {
				strength: 'Community inbox and analytics without enterprise suite overhead',
				weakness: 'Free plan caps you at three channels and 10 scheduled posts per channel'
			},
			programmatic_access: {
				weakness: 'Rate-limited REST API — no MCP server or workspace-scoped agent endpoints'
			},
			publishing_control: {
				weakness: 'Approval workflows require the Team plan — not on Free or Essentials'
			}
		}
	}
};
