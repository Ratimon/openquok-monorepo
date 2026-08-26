import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const HOPPER_HQ_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Grow',
		monthlyPrice: 6,
		tagline: 'Best for individuals and small businesses scheduling a handful of social accounts',
		footnote: 'Per connected account / month (monthly billing) · $5/account on annual · 1 user · 14-day free trial'
	},
	{
		name: 'Scale',
		monthlyPrice: 12,
		tagline: 'Best for teams that need unlimited teammates, permissions, and content approvals',
		footnote: 'Per connected account / month (monthly billing) · $10/account on annual · unlimited users · 14-day free trial'
	}
];

const HOPPER_HQ_CHANNELS = [
	'Facebook',
	'Instagram',
	'LinkedIn',
	'X',
	'TikTok',
	'YouTube Shorts',
	'Pinterest',
	'Threads',
	'Bluesky'
];

const HOPPER_HQ_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'excluded' },
	channels: { kind: 'text', text: 'Per connected account pricing' },
	posts_per_month: { kind: 'text', text: 'Unlimited posts' },
	team_members: { kind: 'text', text: '1 on Grow · unlimited on Scale' },
	ai_writer: { kind: 'text', text: 'Unlimited AI assistant' },
	ai_summarizer: { kind: 'excluded' },
	share_post_preview: { kind: 'included' },
	public_api: { kind: 'excluded' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'excluded' },
	cloud_storage: { kind: 'text', text: 'Media library (plan limits apply)' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'excluded' },
	analytics: { kind: 'included' },
	photo_editor: { kind: 'included' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'included' },
	repeated_posts: { kind: 'included' },
	reusable_templates: { kind: 'text', text: 'Saved captions & notes' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'text', text: 'Favourite post times' },
	post_comments: { kind: 'included' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'excluded' },
	dark_light_mode: { kind: 'included' },
	community: { kind: 'excluded' }
};

export const hopperHqCompareProduct: CompareProduct = {
	slug: 'hopper-hq',
	name: 'Hopper HQ',
	icon: icons.HopperHQ.name,
	tagline: 'Visual-first social scheduler for small businesses since 2014',
	overview:
		'Hopper HQ is a visual-first social media scheduler for small businesses, creators, and agencies. Plan posts, stories, and reels from a combined calendar, preview your Instagram grid, bulk-upload a month of content, and auto-publish across major networks — with per-account pricing, unlimited posts, and a 14-day free trial.',
	pricingPlans: HOPPER_HQ_PRICING_PLANS,
	channels: HOPPER_HQ_CHANNELS,
	featureSupport: HOPPER_HQ_FEATURE_SUPPORT,
	comparison: {
		headline: 'visual-first scheduling',
		notAnother: 'grid planner tab',
		builtFor: 'small businesses and creators in a browser calendar',
		positioningWhenLeft:
			'keeps scheduling visual with grid previews, bulk upload, link-in-bio pages, and hashtag research for teams that live in the dashboard',
		talkingPoints: {
			agent_workflow: {
				strength: 'Unlimited AI assistant drafts captions, hashtags, and strategy inside the post planner',
				weakness:
					'AI assistant lives inside Hopper HQ — no skills, workspace MCP, or Public API for external agents'
			},
			pricing_model: {
				strength: 'Entry pricing from $6/account/mo with unlimited posts and a 14-day free trial',
				weakness: 'Per-account pricing that climbs in a straight line as you connect more profiles'
			},
			workspace_isolation: {
				strength: 'Simple calendar for solo operators — no enterprise workspace sprawl',
				weakness: 'One account pile for every brand, client, and channel'
			},
			product_focus: {
				strength: 'Instagram grid planner, link-in-bio pages, and hashtag explorer for visual creators',
				weakness:
					'Grid planner, link-in-bio, and hashtag bundles when you mainly need agent-native scheduling'
			},
			programmatic_access: {
				weakness: 'No Public API, CLI, or MCP server for editor or terminal agents'
			},
			publishing_control: {
				strength: 'Content approvals and post-failure rules on Scale for teams that review in the dashboard',
				weakness: 'Dashboard-first publishing — agent drafts cannot land as reviewable checkpoints without the Hopper HQ UI'
			}
		}
	}
};
