import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const POSTFAST_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Starter',
		monthlyPrice: 11,
		tagline: 'Best for individual creators scheduling on a handful of accounts',
		footnote: '~€10/mo annual · €12/mo monthly · 4 accounts · 7-day free trial'
	},
	{
		name: 'Creator',
		monthlyPrice: 26,
		tagline: 'Best for startups and small brands that need team seats and workspaces',
		footnote: '~€24/mo annual · €29/mo monthly · 12 accounts · 4 workspaces / 5 users'
	},
	{
		name: 'Growth',
		monthlyPrice: 44,
		tagline: 'Best for growing brands connecting more networks and collaborators',
		footnote: '~€40/mo annual · €49/mo monthly · 30 accounts · 10 workspaces / 8 users'
	},
	{
		name: 'Pro (Agency)',
		monthlyPrice: 90,
		tagline: 'Best for agencies managing many client accounts with approvals',
		footnote: '~€82.50/mo annual · €99/mo monthly · 120 accounts · 30 workspaces / 15 users'
	},
	{
		name: 'Enterprise',
		monthlyPrice: 218,
		tagline: 'Best for large organizations at scale with priority support',
		footnote: '~€199/mo annual · €239/mo monthly · 500 accounts · 110 workspaces / 30 users'
	}
];

const POSTFAST_CHANNELS = [
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
	'Google Business Profile'
];

const POSTFAST_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'text', text: '1 on Starter · up to 110 on Enterprise' },
	channels: { kind: 'text', text: '4–500 social accounts by plan' },
	posts_per_month: {
		kind: 'text',
		text: '150 Starter · 1,500 Creator · 3,000 Growth · unlimited Pro+'
	},
	team_members: { kind: 'text', text: '1 on Starter · up to 30 on Enterprise' },
	ai_writer: { kind: 'excluded' },
	ai_summarizer: { kind: 'excluded' },
	share_post_preview: { kind: 'included' },
	public_api: { kind: 'included' },
	oauth_apps: { kind: 'text', text: 'ChatGPT & Claude connectors (not third-party OAuth apps)' },
	mcp_server: { kind: 'included' },
	cloud_storage: { kind: 'text', text: 'Canva, Dropbox & Google Drive imports' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'text', text: 'MCP, ChatGPT, Claude, n8n, Zapier, Make' },
	analytics: { kind: 'text', text: 'Limited on Starter · full on Creator+' },
	photo_editor: { kind: 'text', text: 'Image cropper & media tools' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'text', text: 'Creator+' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'included' },
	repeated_posts: { kind: 'excluded' },
	reusable_templates: { kind: 'excluded' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'excluded' },
	post_comments: { kind: 'included' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	cross_account_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'text', text: 'Client workspaces by plan' },
	dark_light_mode: { kind: 'excluded' },
	community: { kind: 'excluded' }
};

export const postfastCompareProduct: CompareProduct = {
	slug: 'postfast',
	name: 'PostFast',
	icon: icons.PostFast.name,
	tagline: 'Multi-platform scheduler with MCP, API, and social inbox on every plan',
	overview:
		'PostFast is a hosted social media scheduling platform for creators, teams, and agencies. It covers eleven networks from one composer, client workspaces, approvals, analytics, a social inbox, and agent paths via REST API, MCP, and ChatGPT or Claude connectors — with flat plan pricing from Starter through Enterprise and a seven-day free trial.',
	pricingPlans: POSTFAST_PRICING_PLANS,
	channels: POSTFAST_CHANNELS,
	featureSupport: POSTFAST_FEATURE_SUPPORT,
	comparison: {
		headline: 'hosted multi-platform automation',
		notAnother: 'hosted automation dashboard',
		builtFor: 'creators and agencies who want eleven networks, inbox, and agent connectors in one hosted app',
		positioningWhenLeft:
			'packs cross-posting, client workspaces, social inbox, and agent tooling into flat monthly plans with API and MCP on every tier',
		talkingPoints: {
			agent_workflow: {
				strength:
					'MCP server plus ChatGPT and Claude connectors ship on every plan — schedule from Cursor or chat apps without extra add-ons',
				weakness:
					'Agent connectors run through PostFast accounts — no self-hosted skills, workspace MCP, or AGPL source to audit'
			},
			pricing_model: {
				strength:
					'Flat plan pricing with all eleven platforms included — no per-channel math as you connect networks',
				weakness: 'Scheduled post caps on Starter through Growth (150–3,000) before unlimited Pro tiers'
			},
			workspace_isolation: {
				strength: 'Client workspaces on Creator+ keep brands and approvals separated inside one login',
				weakness:
					'Hosted client workspaces — not isolated agent workspaces with separate tokens, MCP endpoints, and self-host control'
			},
			product_focus: {
				strength: 'Social inbox, bulk CSV import, carousels, and mobile apps without enterprise suite overhead',
				weakness: 'Hosted-only product — no open-source path to run scheduling on your own infrastructure'
			},
			programmatic_access: {
				strength: 'REST API and MCP included on every plan with verified n8n, Zapier, and Make nodes',
				weakness: 'Account-level API keys — not workspace-scoped Public API endpoints per brand or agent context'
			},
			publishing_control: {
				strength: 'Approval workflows, post previews, and a shared calendar before content goes live',
				weakness: 'Starter tier limits you to 150 scheduled posts and limited analytics'
			}
		}
	}
};
