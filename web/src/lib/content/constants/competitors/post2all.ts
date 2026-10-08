import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const POST2ALL_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Creator',
		monthlyPrice: 9,
		tagline: 'Best for creators who need steady publishing on up to ten accounts',
		footnote: '10 social accounts · unlimited posts & members · 7-day free trial'
	},
	{
		name: 'Business',
		monthlyPrice: 19,
		tagline: 'Best for growing brands that need profiles and more connected accounts',
		footnote: '30 social accounts · 2 profiles · unlimited posts & members'
	},
	{
		name: 'Agency',
		monthlyPrice: 39,
		tagline: 'Best for agencies managing many client accounts from one login',
		footnote: '100 social accounts · 10 profiles · unlimited posts & members'
	}
];

const POST2ALL_CHANNELS = [
	'Facebook',
	'Instagram',
	'LinkedIn',
	'X',
	'TikTok',
	'YouTube',
	'Pinterest',
	'Threads',
	'Bluesky',
	'Telegram',
	'Discord',
	'Dribbble',
	'Wircle'
];

const POST2ALL_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'text', text: 'Profiles on Business+ (2–10)' },
	channels: { kind: 'text', text: '10–100 connected social accounts' },
	posts_per_month: {
		kind: 'text',
		text: 'Unlimited (fair use) · X allowance 200–1,200/mo by plan'
	},
	team_members: { kind: 'text', text: 'Unlimited on every plan' },
	ai_writer: { kind: 'excluded' },
	ai_summarizer: { kind: 'excluded' },
	share_post_preview: { kind: 'included' },
	official_api: { kind: 'included' },
	public_api: { kind: 'included' },
	oauth_apps: { kind: 'text', text: 'Hosted MCP OAuth · not third-party OAuth apps' },
	mcp_server: { kind: 'included' },
	cloud_storage: { kind: 'text', text: 'Media uploads per post workflow' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'text', text: 'CLI, MCP, skills, and major agent hosts' },
	analytics: { kind: 'included' },
	photo_editor: { kind: 'excluded' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'included' },
	repeated_posts: { kind: 'excluded' },
	reusable_templates: { kind: 'excluded' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'text', text: 'Post queue' },
	post_comments: { kind: 'included' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	cross_account_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'excluded' },
	dark_light_mode: { kind: 'included' },
	community: { kind: 'excluded' }
};

export const post2allCompareProduct: CompareProduct = {
	slug: 'post2all',
	name: 'post2all',
	icon: icons.Post2all.name,
	tagline: 'Social scheduler for teams and AI agents across thirteen networks',
	overview:
		'post2all is a hosted social media scheduling platform for creators, teams, and agencies. You can cross-post with per-account captions, use a visual calendar and analytics, and drive publishing from the dashboard, REST API, TypeScript SDK, CLI, or MCP — with flat plans from Creator through Agency and a seven-day free trial.',
	pricingPlans: POST2ALL_PRICING_PLANS,
	channels: POST2ALL_CHANNELS,
	featureSupport: POST2ALL_FEATURE_SUPPORT,
	comparison: {
		headline: 'agent-ready hosted scheduling',
		notAnother: 'hosted agent scheduling stack',
		builtFor: 'teams and agents who want thirteen networks, MCP, and unlimited members on flat plans',
		positioningWhenLeft:
			'combines multi-network publishing, analytics, profiles, and agent paths via API, CLI, and MCP on every paid tier',
		talkingPoints: {
			agent_workflow: {
				strength:
					'CLI, MCP, and agent skills on every plan — schedule from Claude Code, Cursor, Codex, or ChatGPT without extra tiers',
				weakness:
					'Hosted agent connectors — no self-hosted stack, AGPL source, or workspace-scoped MCP per brand'
			},
			pricing_model: {
				strength:
					'Flat Creator–Agency pricing with unlimited posts and unlimited team members on every tier',
				weakness:
					'Connected-account caps (10–100) and separate X-post allowances that scale with plan tier'
			},
			workspace_isolation: {
				strength: 'Profiles on Business and Agency keep clients and brands scoped inside one login',
				weakness:
					'Profiles organize accounts — not isolated agent workspaces with separate tokens and MCP endpoints'
			},
			product_focus: {
				strength: 'Thirteen networks including Discord, Telegram, Dribbble, and Wircle in one composer',
				weakness: 'Hosted-only product when you need self-host control or open-source auditability'
			},
			programmatic_access: {
				strength: 'REST API, TypeScript SDK, CLI, and MCP ship on every plan with OpenAPI docs',
				weakness: 'Account-level API keys — not workspace-scoped Public API endpoints per agent context'
			},
			publishing_control: {
				strength: 'Pre-publish validation, post queue, and per-account captions before content goes live',
				weakness: 'Trial caps you at 30 successful posts and 5 X-post units before billing starts'
			}
		}
	}
};
