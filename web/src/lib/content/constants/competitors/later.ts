import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const LATER_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Starter',
		monthlyPrice: 18.75,
		tagline: 'For casual scheduling on one social set with Link in Bio',
		footnote:
			'Annual billing ($25/mo monthly) · 1 social set (8 profiles) · 1 user · 30 posts/profile · 14-day free trial'
	},
	{
		name: 'Growth',
		monthlyPrice: 37.5,
		tagline: 'For teams that need approvals, a social inbox, and extra social sets',
		footnote:
			'Annual billing ($50/mo monthly) · 2 social sets (16 profiles) · 2 users · 180 posts/profile · extra sets $11.25/mo annual'
	},
	{
		name: 'Scale',
		monthlyPrice: 82.5,
		tagline: 'For brands that need unlimited posts, custom analytics, and listening',
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
	official_api: { kind: 'included' },
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
	tagline: 'Visual Instagram planner with Link in Bio',
	overview:
		'Later helps you plan social posts on a calendar and an Instagram grid. You can auto-publish to eight networks. You also get Link in Bio. Plans bill by social set. The trial is 14 days. Later has no public scheduling API.',
	pricingPlans: LATER_PRICING_PLANS,
	channels: LATER_CHANNELS,
	featureSupport: LATER_FEATURE_SUPPORT,
	comparison: {
		headline: 'visual Instagram planning',
		notAnother: 'grid planner tab',
		builtFor: 'creators and social teams who plan posts on a visual calendar',
		positioningWhenLeft:
			'lets you plan Instagram posts on a visual calendar and grid. You also get Link in Bio',
		talkingPoints: {
			agent_workflow: {
				strength: 'Caption Writer and Ideas create copy in the post builder. You spend monthly AI credits.',
				weakness:
					'AI credits stay inside Later (5–100 each month). You cannot use skills, workspace MCP, or a Public API with external agents.'
			},
			pricing_model: {
				strength: 'Annual Starter starts at $18.75 per month for one social set, Link in Bio, and a 14-day trial.',
				weakness:
					'You pay per social set. Extra sets cost more. Starter allows 30 posts per profile. Growth allows 180 posts per profile.'
			},
			workspace_isolation: {
				strength: 'Access Groups split media libraries and calendars when you manage extra brands.',
				weakness:
					'Social sets and Access Groups stay in one Later login. You do not get separate agent workspaces with their own tokens and MCP endpoints.'
			},
			product_focus: {
				strength:
					'You get an Instagram grid planner, Link in Bio, UGC collection, and Scale competitive benchmarking in one dashboard.',
				weakness:
					'Later focuses on a visual planner, Link in Bio, and influencer tools. You cannot publish to X or Bluesky.'
			},
			programmatic_access: {
				weakness: 'Later has no public scheduling API, MCP server, Zapier, Make, or n8n. You publish from the dashboard.'
			},
			publishing_control: {
				strength: 'Growth and Scale include internal and external approvals. You can share a review link without a Later login.',
				weakness:
					'Approvals start on Growth. Starter has one user. Agent drafts cannot wait for review unless you use the Later UI.'
			}
		}
	}
};
