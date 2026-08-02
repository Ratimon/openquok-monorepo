import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const POST_BRIDGE_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Free',
		monthlyPrice: 0,
		tagline: 'Best for trying cross-posting across every supported network',
		footnote: '5 posts per month · all platforms count toward the cap'
	},
	{
		name: 'Creator',
		monthlyPrice: 29,
		tagline: 'Best for growing creators',
		footnote: '15 connected accounts · 7-day free trial · annual billing saves ~1 month'
	},
	{
		name: 'Growth',
		monthlyPrice: 49,
		tagline: 'Best for growing teams and agencies',
		footnote: '50 connected accounts · viral growth consulting · priority support · API add-on ($5/mo)'
	},
	{
		name: 'Pro',
		monthlyPrice: 99,
		tagline: 'Best for scaling brands',
		footnote: 'Unlimited connected accounts · priority support · API add-on ($5/mo)'
	}
];

const POST_BRIDGE_CHANNELS = [
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

const POST_BRIDGE_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'excluded' },
	channels: { kind: 'text', text: '15 on Creator · 50 on Growth · unlimited on Pro' },
	posts_per_month: { kind: 'text', text: '5 on Free · unlimited on paid' },
	team_members: { kind: 'text', text: 'Solo on Creator · team features on Growth+' },
	ai_writer: { kind: 'excluded' },
	ai_summarizer: { kind: 'excluded' },
	share_post_preview: { kind: 'included' },
	public_api: { kind: 'text', text: '$5/mo API add-on (requires paid plan)' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'text', text: 'With API add-on only' },
	cloud_storage: { kind: 'text', text: 'Content studio & media uploads' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'text', text: 'API + MCP via paid add-on' },
	analytics: { kind: 'text', text: 'Analytics (beta)' },
	photo_editor: { kind: 'text', text: 'Content studio' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'excluded' },
	repeated_posts: { kind: 'excluded' },
	reusable_templates: { kind: 'excluded' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'excluded' },
	post_comments: { kind: 'excluded' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'excluded' },
	dark_light_mode: { kind: 'included' },
	community: { kind: 'included' }
};

export const postBridgeCompareProduct: CompareProduct = {
	slug: 'post-bridge',
	name: 'Post Bridge',
	icon: icons.PostBridge.name,
	tagline: 'Straightforward hosted cross-poster for creators and small teams',
	overview:
		'Post Bridge is a hosted social scheduling tool focused on fast cross-posting. Connect major networks, tailor copy per platform or account, schedule posts (including carousels and bulk video), and optionally automate through a paid HTTP API add-on with MCP support — with flat Creator, Growth, and Pro plans plus a small free tier.',
	pricingPlans: POST_BRIDGE_PRICING_PLANS,
	channels: POST_BRIDGE_CHANNELS,
	featureSupport: POST_BRIDGE_FEATURE_SUPPORT,
	comparison: {
		headline: 'simple hosted cross-posting',
		notAnother: 'minimal cross-poster',
		builtFor: 'creators and small teams that want quick multi-platform scheduling without suite overhead',
		positioningWhenLeft:
			'keeps cross-posting lightweight with flat account bundles, per-platform overrides, and an optional API add-on',
		talkingPoints: {
			agent_workflow: {
				strength: 'Optional API and MCP paths for assistants once you enable the automation add-on',
				weakness:
					'Automation lives behind a paid API add-on — not workspace-scoped agent drafts with separate OAuth and MCP endpoints'
			},
			pricing_model: {
				strength: 'Flat Creator plan ($29/mo) for fifteen accounts instead of per-channel math',
				weakness: 'Paid plans required for real volume; API access costs extra on top of subscription'
			},
			workspace_isolation: {
				strength: 'One hosted login — easy setup for solo creators shipping everywhere at once',
				weakness: 'Single hosted account — no isolated workspaces per brand, client, or agent context'
			},
			product_focus: {
				strength: 'Narrow cross-posting workflow with content studio and bulk video scheduling',
				weakness:
					'No reply-thread scheduling on X or Threads; official help documents scheduling up to two months ahead'
			},
			programmatic_access: {
				strength: 'Documented HTTP API and MCP when the $5/mo add-on is enabled',
				weakness: 'API and MCP are add-ons — not included on every plan like native Public API + CLI + MCP'
			},
			publishing_control: {
				strength: 'Per-platform and per-account content overrides before you queue posts',
				weakness: 'Hosted-only publishing — no self-host path or AGPL source to audit and run yourself'
			}
		}
	}
};
