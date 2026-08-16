import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const SOCIALCLAW_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Starter',
		monthlyPrice: 15,
		tagline: 'Best for trying agent publishing on a few connected accounts',
		footnote: '3 accounts · 200 posts / month · 7-day free trial then $15/mo'
	},
	{
		name: 'Startup',
		monthlyPrice: 29,
		tagline: 'Best for small brands scheduling across a handful of networks',
		footnote: '6 accounts · 400 posts / month · yearly billing saves 20%'
	},
	{
		name: 'Plus',
		monthlyPrice: 67,
		tagline: 'Best for growing teams that need more accounts and monthly volume',
		footnote: '20 accounts · 1,000 posts / month · yearly billing saves 20%'
	},
	{
		name: 'Pro',
		monthlyPrice: 99,
		tagline: 'Best for agencies managing many accounts from one workspace',
		footnote: '50 accounts · 2,500 posts / month · yearly billing saves 20%'
	}
];

const SOCIALCLAW_CHANNELS = [
	'Facebook',
	'Instagram',
	'LinkedIn',
	'X',
	'TikTok',
	'YouTube',
	'Pinterest',
	'Reddit',
	'Discord',
	'Telegram',
	'WordPress',
	'Snapchat'
];

const SOCIALCLAW_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'text', text: '1 workspace' },
	channels: { kind: 'text', text: '3–50 accounts by plan' },
	posts_per_month: { kind: 'text', text: '200–2,500 by plan' },
	team_members: { kind: 'text', text: 'Approvals in one workspace' },
	ai_writer: { kind: 'excluded' },
	ai_summarizer: { kind: 'excluded' },
	share_post_preview: { kind: 'included' },
	public_api: { kind: 'included' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'text', text: 'Hosted MCP (workspace key)' },
	cloud_storage: { kind: 'text', text: 'Media storage included' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'text', text: 'CLI, MCP, and agent skills' },
	analytics: { kind: 'included' },
	photo_editor: { kind: 'text', text: 'Media studio (generate)' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'included' },
	repeated_posts: { kind: 'text', text: 'Workflows' },
	reusable_templates: { kind: 'excluded' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'text', text: 'AI scheduler slots' },
	post_comments: { kind: 'excluded' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'excluded' },
	dark_light_mode: { kind: 'excluded' },
	community: { kind: 'excluded' }
};

export const socialclawCompareProduct: CompareProduct = {
	slug: 'socialclaw',
	name: 'SocialClaw',
	icon: icons.SocialClaw.name,
	tagline: 'Agent-oriented scheduler with API, MCP, CLI, and media studio',
	overview:
		'SocialClaw is a social publishing workspace for dashboard, API, and AI-agent workflows. Connect accounts once, host media, and schedule across Instagram, TikTok, X, LinkedIn, and other networks — with CLI, hosted MCP, agent skills, and a media studio for generated images, video, and voice. Paid plans are capped by connected accounts and monthly posts, from Starter through Pro.',
	pricingPlans: SOCIALCLAW_PRICING_PLANS,
	channels: SOCIALCLAW_CHANNELS,
	featureSupport: SOCIALCLAW_FEATURE_SUPPORT,
	comparison: {
		headline: 'agent publishing layer',
		notAnother: 'apply-and-publish workspace',
		builtFor: 'builders who want agents, CLI, and MCP on the same calendar',
		positioningWhenLeft:
			'puts dashboard scheduling, hosted media, and agent tooling behind one workspace API key',
		talkingPoints: {
			agent_workflow: {
				strength: 'CLI, MCP, and agent skills let Claude, Codex, and other agents schedule from the same workspace',
				weakness:
					'Agents can apply and publish with a workspace key — less emphasis on a human checkpoint before go-live'
			},
			pricing_model: {
				strength: 'Account-and-post caps from $15/mo after a 7-day trial, with 20% off yearly billing',
				weakness: 'Account and monthly post caps (3–50 accounts, 200–2,500 posts) that force plan jumps as you grow'
			},
			workspace_isolation: {
				strength: 'One workspace API key shared by the dashboard, CLI, MCP, and skills',
				weakness:
					'One workspace key for every brand, client, and channel — not isolated agent workspaces with separate tokens and MCP endpoints'
			},
			product_focus: {
				strength: 'Media studio, UGC video generation, analytics, and 11-plus networks in one agent-oriented suite',
				weakness: 'Media generation and UGC video suite when you mainly need focused scheduling and review'
			},
			programmatic_access: {
				strength: 'REST API, hosted MCP, CLI, and agent skills included on every plan',
				weakness: 'Account-level API and MCP access — not workspace-scoped endpoints per brand or agent'
			},
			publishing_control: {
				strength: 'Calendar edits until publish, plus automatic retries when delivery fails',
				weakness: 'Apply-schedule and agent flows can publish without an explicit draft-approval step'
			}
		}
	}
};
