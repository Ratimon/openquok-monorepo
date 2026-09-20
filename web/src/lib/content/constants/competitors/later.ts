import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const LATER_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Starter',
		monthlyPrice: 18.75,
		tagline: 'Best for casual scheduling on one social set with Link in Bio',
		footnote:
			'Annual billing ($25/mo monthly) · 1 social set (8 profiles) · 1 user · 30 posts/profile · 14-day free trial'
	},
	{
		name: 'Growth',
		monthlyPrice: 37.5,
		tagline: 'Best for teams that need approvals, social inbox, and extra social sets',
		footnote:
			'Annual billing ($50/mo monthly) · 2 social sets (16 profiles) · 2 users · 180 posts/profile · extra sets $11.25/mo annual'
	},
	{
		name: 'Scale',
		monthlyPrice: 82.5,
		tagline: 'Best for brands that need unlimited posts, custom analytics, and listening',
		footnote:
			'Annual billing ($110/mo monthly) · 6 social sets (48 profiles) · 4 users · unlimited posts · extra sets $11.25/mo annual'
	}
];

const LATER_CHANNELS = [
	'Facebook',
	'Instagram',
	'LinkedIn',
	'TikTok',
	'YouTube Shorts',
	'Pinterest',
	'Threads',
	'Snapchat'
];

const LATER_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'text', text: 'Access Groups — 1 on Starter · unlimited on Growth+' },
	channels: { kind: 'text', text: '1 / 2 / 6 social sets (8 / 16 / 48 profiles) · extra sets on Growth+' },
	posts_per_month: { kind: 'text', text: '30/profile Starter · 180/profile Growth · unlimited Scale' },
	team_members: { kind: 'text', text: '1 on Starter · 2 on Growth · 4 on Scale (extra seats on Growth+)' },
	ai_writer: { kind: 'text', text: 'Caption Writer & Ideas — 5 / 50 / 100 AI credits per month' },
	ai_summarizer: { kind: 'excluded' },
	share_post_preview: { kind: 'text', text: 'External review links on Growth+' },
	public_api: { kind: 'excluded' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'excluded' },
	cloud_storage: { kind: 'text', text: 'Unlimited media library (20MB photo / 512MB video caps)' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'excluded' },
	analytics: { kind: 'text', text: '3 months Starter · 1 year Growth · 2 years + custom reports Scale' },
	photo_editor: { kind: 'text', text: 'Crop, filters, text, trim, and Canva export' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'included' },
	repeated_posts: { kind: 'excluded' },
	reusable_templates: { kind: 'text', text: 'Saved captions and hashtags' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'text', text: 'Best Time to Post (IG, Facebook, TikTok)' },
	post_comments: { kind: 'text', text: 'Instagram first comment' },
	internal_plugs: { kind: 'excluded' },
	cross_account_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'text', text: 'Social sets + Access Groups' },
	dark_light_mode: { kind: 'excluded' },
	community: { kind: 'included' }
};

export const laterCompareProduct: CompareProduct = {
	slug: 'later',
	name: 'Later',
	icon: icons.Later.name,
	tagline: 'Visual Instagram planner with Link in Bio and influencer tools',
	overview:
		'Later is a visual-first social media management platform for creators, brands, and agencies. Plan posts from a calendar and Instagram grid, auto-publish across eight networks, ship a Link in Bio page, and add AI captions, approvals, a social inbox, and Scale-tier analytics or listening — billed per social set with a 14-day free trial and no public scheduling API.',
	pricingPlans: LATER_PRICING_PLANS,
	channels: LATER_CHANNELS,
	featureSupport: LATER_FEATURE_SUPPORT,
	comparison: {
		headline: 'visual Instagram planning',
		notAnother: 'grid planner tab',
		builtFor: 'creators and social teams who live in a visual calendar and Link in Bio',
		positioningWhenLeft:
			'keeps Instagram-first planning visual with grid previews, Link in Bio, best-time slots, and influencer extras for teams that work in the dashboard',
		talkingPoints: {
			agent_workflow: {
				strength: 'Caption Writer and Ideas generate copy inside the post builder with monthly AI credits',
				weakness:
					'AI credits live inside Later (5–100/month) — no skills, workspace MCP, or Public API for external agents'
			},
			pricing_model: {
				strength: 'Annual Starter from $18.75/mo for one social set, Link in Bio, and a 14-day free trial',
				weakness:
					'Social-set pricing plus extra-set fees as you add brands — 30 posts/profile on Starter and 180 on Growth'
			},
			workspace_isolation: {
				strength: 'Access Groups split media libraries and calendars when you manage extra brands',
				weakness:
					'Social sets and Access Groups still sit in one Later login — not isolated agent workspaces with separate tokens and MCP endpoints'
			},
			product_focus: {
				strength:
					'Instagram grid planner, Link in Bio, UGC collection, and Scale-tier competitive benchmarking in one dashboard',
				weakness:
					'Visual planner, Link in Bio, and influencer bundles when you mainly need agent-native scheduling — no X or Bluesky publishing'
			},
			programmatic_access: {
				weakness: 'No public scheduling API, MCP server, Zapier, Make, or n8n — dashboard-only publishing'
			},
			publishing_control: {
				strength: 'Internal and external approvals on Growth+ including review links without a Later login',
				weakness:
					'Approvals start on Growth — Starter is one user, and agent drafts cannot land as reviewable checkpoints without the Later UI'
			}
		}
	}
};
