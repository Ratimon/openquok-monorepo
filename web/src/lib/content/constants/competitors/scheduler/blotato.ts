import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import { COMPARE_PRODUCT_CATEGORIES_SOCIAL_SCHEDULING } from '$lib/content/constants/competitors/shared';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';
import { buildSchedulerAlternativesLongForm } from '$lib/content/constants/competitors/buildCompareLongFormSections';


const BLOTATO_ALTERNATIVES_LONG_FORM = buildSchedulerAlternativesLongForm(
	'Blotato',
	[
		'Blotato bundles AI media, inbox automation, and agent publish paths in one account.',
		'Account caps and AI credit pools force plan jumps as you add brands.',
		'Agents can publish quickly. There is less emphasis on kanban review before go-live.'
	],
	[
		'You want MCP and REST built for ChatGPT or Claude with one API key.',
		'Flat plans with bundled AI credits fit solo operators and small teams.',
		'Templates, AI video, DMs, and n8n or Make hooks cover your automation stack.'
	]
);



const BLOTATO_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Starter',
		monthlyPrice: 29,
		tagline: 'Best for solo creators who publish with agents and AI media',
		footnote: '20 social accounts · 1,250 AI credits/mo · 7-day free trial (API excluded during trial)'
	},
	{
		name: 'Creator',
		monthlyPrice: 97,
		tagline: 'Best for operators scaling reach across more accounts',
		footnote: '40 social accounts · 5,000 AI credits/mo · faster video processing'
	},
	{
		name: 'Agency',
		monthlyPrice: 499,
		tagline: 'Best for agencies and teams running multiple brands',
		footnote: '28,000 AI credits/mo · dedicated support · 15,000 active contacts/mo (DMs + replies)'
	}
];

const BLOTATO_CHANNELS = [
	'Facebook',
	'Instagram',
	'LinkedIn',
	'X',
	'TikTok',
	'YouTube',
	'Pinterest',
	'Threads',
	'Bluesky'
];

const BLOTATO_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'excluded' },
	channels: { kind: 'text', text: '20 on Starter · 40 on Creator · higher on Agency' },
	posts_per_month: { kind: 'text', text: 'Unlimited posts · up to 900 TikTok/mo on Starter' },
	team_members: { kind: 'text', text: 'Solo on Starter · team workflows on Agency' },
	ai_writer: { kind: 'included' },
	ai_summarizer: { kind: 'excluded' },
	share_post_preview: { kind: 'included' },
	official_api: { kind: 'included' },
	public_api: { kind: 'text', text: 'REST API · excluded during 7-day trial' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'included' },
	cloud_storage: { kind: 'text', text: 'Media library · AI image & video generation (credits)' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'text', text: 'MCP, REST, n8n & Make nodes, agent setup guides' },
	analytics: { kind: 'text', text: 'Post metrics on 8 platforms (not LinkedIn)' },
	photo_editor: { kind: 'text', text: 'AI images, carousels, faceless video' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'included' },
	repeated_posts: { kind: 'text', text: 'Recurring weekly slots per platform' },
	reusable_templates: { kind: 'included' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'included' },
	post_comments: { kind: 'text', text: 'Comment & DM replies · keyword DM automations (IG/FB)' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	cross_account_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'excluded' },
	dark_light_mode: { kind: 'included' },
	community: { kind: 'excluded' }
};

export const blotatoCompareProduct: CompareProduct = {
	slug: 'blotato',
	categories: COMPARE_PRODUCT_CATEGORIES_SOCIAL_SCHEDULING,
	name: 'Blotato',
	icon: icons.Blotato.name,
	tagline: 'Unified social API and MCP for AI agents and automation',
	overview:
		'Blotato is a hosted automation tool for creators and agencies. Connect nine networks once. Publish and schedule from the dashboard, MCP, or REST.',
	pricingPlans: BLOTATO_PRICING_PLANS,
	channels: BLOTATO_CHANNELS,
	featureSupport: BLOTATO_FEATURE_SUPPORT,
	alternativesLongForm: BLOTATO_ALTERNATIVES_LONG_FORM,
	comparison: {
		headline: 'agent-first social API and MCP',
		notAnother: 'closed autopilot content factory',
		builtFor: 'operators who want one API key and MCP tools inside ChatGPT or Claude',
		positioningWhenLeft:
			'combines cross-posting, inbox automation, AI media, and agent setup guides behind flat account bundles',
		talkingPoints: {
			agent_workflow: {
				strength:
					'MCP and REST are first-class — agents can publish, schedule, reply, and read analytics without custom OAuth apps',
				weakness:
					'Agent tools can publish from one Blotato account — less emphasis on human review before every post ships'
			},
			pricing_model: {
				strength: 'Flat monthly plans with unlimited posts and bundled AI writing — no per-post fees',
				weakness: 'Account caps (20–40+ on published tiers) and AI credit pools that rise with plan price'
			},
			workspace_isolation: {
				strength: 'One login covers dashboard, API, and MCP for fast solo operator setup',
				weakness:
					'One Blotato account for every brand and client — not isolated workspaces with separate OAuth apps and MCP endpoints'
			},
			product_focus: {
				strength:
					'All-in-one stack: viral templates, AI video, DM automations, inbox tools, and n8n/Make nodes',
				weakness:
					'Heavy AI generation and inbox automation when you mainly need a review-first scheduling workspace'
			},
			programmatic_access: {
				strength: 'Hosted MCP server, REST API, and official n8n/Make nodes on paid plans',
				weakness: 'Account-level API and MCP keys — not workspace-scoped tokens per brand or agent'
			},
			publishing_control: {
				strength: 'Calendar, queues, and recurring slots you can drive from agents or the dashboard',
				weakness:
					'No kanban review board or cross-account plugs — publishing control lives in Blotato queues, not OpenQuok-style approval lanes'
			}
		}
	}
};
