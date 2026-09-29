import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const BREAKREACH_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Starter',
		monthlyPrice: 29,
		tagline: 'Best for creators and solo founders on a handful of accounts',
		footnote: '5 social accounts · 50 AI agent messages / month · 1 workspace'
	},
	{
		name: 'Pro',
		monthlyPrice: 49,
		tagline: 'Best for brands that want every AI feature on more accounts',
		footnote: '15 social accounts · unlimited AI agent messages · 3 workspaces · 3 team members'
	},
	{
		name: 'Agency',
		monthlyPrice: 99,
		tagline: 'Best for agencies running many client brands',
		footnote: '50 social accounts · unlimited AI agent messages · 10 workspaces · unlimited team members'
	}
];

const BREAKREACH_CHANNELS = [
	'Facebook',
	'Instagram',
	'LinkedIn',
	'X',
	'TikTok',
	'YouTube',
	'Pinterest',
	'Threads',
	'Bluesky',
	'Reddit',
	'Discord',
	'Telegram'
];

const BREAKREACH_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'text', text: '1–10 workspaces by plan' },
	channels: { kind: 'text', text: '5–50 social accounts by plan' },
	posts_per_month: { kind: 'text', text: 'Unlimited on every plan' },
	team_members: { kind: 'text', text: 'Solo on Starter · up to unlimited on Agency' },
	ai_writer: { kind: 'text', text: 'AI Inspirations & in-app assistant' },
	ai_summarizer: { kind: 'excluded' },
	share_post_preview: { kind: 'included' },
	official_api: { kind: 'text', text: 'No Info' },
	public_api: { kind: 'included' },
	oauth_apps: { kind: 'text', text: 'ChatGPT & Claude connectors (not third-party OAuth apps)' },
	mcp_server: { kind: 'included' },
	cloud_storage: { kind: 'text', text: 'Media re-host via API' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'text', text: 'ChatGPT, Claude, MCP, REST API' },
	analytics: { kind: 'included' },
	photo_editor: { kind: 'excluded' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'excluded' },
	repeated_posts: { kind: 'text', text: 'Posting queues & slots' },
	reusable_templates: { kind: 'excluded' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'text', text: 'Unified inbox filters' },
	post_delays: { kind: 'text', text: 'Best-time suggestions' },
	post_comments: { kind: 'included' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	cross_account_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'excluded' },
	dark_light_mode: { kind: 'excluded' },
	community: { kind: 'excluded' }
};

export const breakreachCompareProduct: CompareProduct = {
	slug: 'breakreach',
	name: 'Breakreach',
	icon: icons.Breakreach.name,
	tagline: 'AI-native scheduler with ChatGPT, Claude, MCP, and twelve networks',
	overview:
		'Breakreach is a hosted social scheduling product built for AI assistants and agents. You connect up to twelve networks once, then schedule from ChatGPT, Claude, the hosted MCP server, or the REST API. It includes a visual calendar, unified inbox, analytics, AI content ideas, and webhooks — with account-based plans from Starter through Agency.',
	pricingPlans: BREAKREACH_PRICING_PLANS,
	channels: BREAKREACH_CHANNELS,
	featureSupport: BREAKREACH_FEATURE_SUPPORT,
	comparison: {
		headline: 'ChatGPT-first scheduling',
		notAnother: 'connector-only calendar',
		builtFor: 'creators and teams who live in ChatGPT or Claude and want a hosted calendar behind connectors',
		positioningWhenLeft:
			'centers on native ChatGPT and Claude connectors, a twenty-tool MCP server, and flat account-based plans from $29 a month',
		talkingPoints: {
			agent_workflow: {
				strength:
					'ChatGPT and Claude connectors plus MCP ship on every plan — ask in plain language without wiring your own client',
				weakness:
					'Connectors and MCP run on Breakreach accounts — no self-hosted skills, workspace MCP, or AGPL source to audit'
			},
			pricing_model: {
				strength: 'Unlimited posts on every plan with MCP and API included from $29 a month',
				weakness: 'Social account caps (5–50) and a 50-message AI agent limit on Starter before you upgrade'
			},
			workspace_isolation: {
				strength: 'Multiple workspaces on Pro and Agency keep client brands in separate calendars',
				weakness:
					'Hosted workspaces — not isolated agent workspaces with separate tokens, MCP endpoints, and self-host control'
			},
			product_focus: {
				strength: 'Unified inbox, AI Inspirations, and twelve networks tuned for connector and MCP workflows',
				weakness: 'Hosted-only product — self-hosted scheduling is waitlist-only, not available today'
			},
			programmatic_access: {
				strength: 'REST API, webhooks, and hosted MCP on api.breakreach.com with OAuth for agent clients',
				weakness: 'Account-level API keys — not workspace-scoped Public API endpoints per brand or agent context'
			},
			publishing_control: {
				strength: 'Drag-and-drop calendar with best-time suggestions before posts go out',
				weakness: 'Agent and connector flows can schedule quickly — fewer native draft-approval and plug controls'
			}
		}
	}
};
