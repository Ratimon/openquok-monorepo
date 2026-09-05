import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const POSTPEER_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Free',
		monthlyPrice: 0,
		tagline: 'Best for testing the unified posting API before you ship',
		footnote: '20 credits · 1 team member · no credit card'
	},
	{
		name: 'Starter',
		monthlyPrice: 33,
		tagline: 'Best for early products posting across a handful of networks',
		footnote: '2,000 credits / month · 5 team members · $16.50 per 1k credits'
	},
	{
		name: 'Standard',
		monthlyPrice: 43,
		tagline: 'Best for growing teams that need more volume and priority support',
		footnote: '6,000 credits / month · 20 team members · $7.17 per 1k credits'
	},
	{
		name: 'Pro',
		monthlyPrice: 120,
		tagline: 'Best for agencies and platforms publishing at scale',
		footnote: '20,000 credits / month · unlimited team members · $6.00 per 1k credits'
	}
];

const POSTPEER_CHANNELS = [
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
	'Google Business Profile'
];

const POSTPEER_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'excluded' },
	channels: { kind: 'text', text: 'Unlimited connected accounts' },
	posts_per_month: {
		kind: 'text',
		text: 'Credit-based (1 credit/post · X costs 5–50 credits)'
	},
	team_members: { kind: 'text', text: '1 on Free · 5 on Starter · 20 on Standard · unlimited on Pro' },
	ai_writer: { kind: 'excluded' },
	ai_summarizer: { kind: 'excluded' },
	share_post_preview: { kind: 'excluded' },
	public_api: { kind: 'included' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'included' },
	cloud_storage: { kind: 'excluded' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'text', text: 'REST API, SDKs, MCP, and agent skills' },
	analytics: { kind: 'text', text: '1 credit per analytics request' },
	photo_editor: { kind: 'excluded' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'excluded' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'excluded' },
	repeated_posts: { kind: 'excluded' },
	reusable_templates: { kind: 'excluded' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'text', text: 'Schedule via API' },
	post_comments: { kind: 'excluded' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'excluded' },
	dark_light_mode: { kind: 'excluded' },
	community: { kind: 'excluded' }
};

export const postpeerCompareProduct: CompareProduct = {
	slug: 'postpeer',
	name: 'PostPeer',
	icon: icons.PostPeer.name,
	tagline: 'Unified social media API for publishing, scheduling, and analytics',
	overview:
		'PostPeer is a developer-first social posting API for SaaS products, agencies, and AI agents. Connect accounts once, publish or schedule across major networks through one REST endpoint, and optionally wire agents through hosted MCP, SDKs, and skills — with credit-based pricing, webhooks, and analytics on every plan.',
	pricingPlans: POSTPEER_PRICING_PLANS,
	channels: POSTPEER_CHANNELS,
	featureSupport: POSTPEER_FEATURE_SUPPORT,
	comparison: {
		headline: 'unified social posting API',
		notAnother: 'credit-metered API wrapper',
		builtFor: 'developers embedding social publishing in products and agent workflows',
		positioningWhenLeft:
			'keeps platform OAuth and delivery behind one API key, with SDKs, MCP, and webhooks for fast integration',
		talkingPoints: {
			agent_workflow: {
				strength: 'Hosted MCP, agent skills, and REST endpoints give Cursor and Claude a single publish path',
				weakness:
					'Agent skills and MCP publish through PostPeer — no kanban or calendar review before posts leave your workspace'
			},
			pricing_model: {
				strength: 'Free tier with 20 credits and flat monthly bundles from $33 for 2,000 credits',
				weakness:
					'Credit metering where X posts cost 5–50 credits and analytics burns credits on every request'
			},
			workspace_isolation: {
				strength: 'One API key manages unlimited connected accounts for embedded SaaS flows',
				weakness:
					'Single API key for every brand, client, and agent — not isolated workspaces with separate tokens and MCP endpoints'
			},
			product_focus: {
				strength: 'One maintained API for eleven networks plus webhooks, SDKs, and analytics for product builders',
				weakness:
					'API-first delivery layer — no calendar, kanban, photo editor, or self-host path for operators who want a full scheduler'
			},
			programmatic_access: {
				strength: 'REST API, Node.js and Python SDKs, hosted MCP, and agent skills on every plan',
				weakness: 'Hosted-only API — no self-hosted stack, workspace OAuth apps, or AGPL source to audit'
			},
			publishing_control: {
				strength: 'Webhooks and status endpoints for delivery tracking across every connected platform',
				weakness: 'Publish-now and schedule-via-API flows — no draft queue with human approval gates in-product'
			}
		}
	}
};
