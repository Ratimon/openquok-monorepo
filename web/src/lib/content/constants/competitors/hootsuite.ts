import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';

const HOOTSUITE_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Standard',
		monthlyPrice: 99,
		tagline: 'Best for individuals managing up to 10 social accounts from one calendar',
		footnote: 'Per user / month (annual billing) · 14-day free trial'
	},
	{
		name: 'Professional',
		monthlyPrice: 199,
		tagline: 'Best for teams that need unlimited accounts and automated inbox workflows',
		footnote: 'Per user / month (annual billing) · 14-day free trial'
	},
	{
		name: 'Advanced',
		monthlyPrice: 399,
		tagline: 'Best for teams that need approvals, routing, and cross-team coordination',
		footnote: 'Per user / month (annual billing) · 14-day free trial'
	},
	{
		name: 'Enterprise',
		monthlyPrice: null,
		tagline: 'Best for large organizations with SSO, listening, and governance needs',
		footnote: 'Custom pricing — contact sales'
	}
];

const HOOTSUITE_CHANNELS = [
	'Facebook',
	'Instagram',
	'LinkedIn',
	'X',
	'TikTok',
	'YouTube',
	'Pinterest',
	'Threads',
	'Bluesky',
	'WhatsApp',
	'Google Business Profile'
];

const HOOTSUITE_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'excluded' },
	channels: { kind: 'text', text: '10 on Standard · unlimited on Professional+' },
	posts_per_month: { kind: 'text', text: 'Unlimited scheduling' },
	team_members: { kind: 'text', text: 'Per-seat licensing' },
	share_post_preview: { kind: 'included' },
	public_api: { kind: 'excluded' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'text', text: 'MCP connectors (in-product)' },
	cloud_storage: { kind: 'text', text: 'Media library (plan limits apply)' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'excluded' },
	analytics: { kind: 'included' },
	photo_editor: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'included' },
	repeated_posts: { kind: 'included' },
	reusable_templates: { kind: 'included' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'included' },
	post_delays: { kind: 'text', text: 'Best-time scheduling' },
	post_comments: { kind: 'included' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'included' },
	dark_light_mode: { kind: 'excluded' },
	community: { kind: 'excluded' }
};

export const hootsuiteCompareProduct: CompareProduct = {
	slug: 'hootsuite',
	name: 'Hootsuite',
	tagline: 'Social marketing suite with Wisdom AI since 2008',
	overview:
		'Hootsuite is an established social media management platform for marketing teams. Standard through Advanced plans cover publishing, a unified inbox, analytics, and Wisdom AI — with per-user pricing, up to 10 social accounts on Standard, and unlimited accounts on Professional and above.',
	pricingPlans: HOOTSUITE_PRICING_PLANS,
	channels: HOOTSUITE_CHANNELS,
	featureSupport: HOOTSUITE_FEATURE_SUPPORT,
	comparison: {
		headline: 'enterprise social marketing',
		notAnother: 'enterprise dashboard',
		builtFor: 'marketing teams in a browser',
		positioningWhenLeft:
			'covers publishing, inbox, listening, and analytics for teams that live in the dashboard',
		talkingPoints: {
			agent_workflow: {
				strength: 'Wisdom AI drafts posts and images inside the dashboard on every plan',
				weakness:
					'Wisdom AI lives inside the dashboard — no skills, workspace MCP, or Public API for external agents'
			},
			pricing_model: {
				strength: 'Per-seat plans with roles and approvals for established marketing departments',
				weakness: 'Per-seat pricing that climbs as you add collaborators'
			},
			workspace_isolation: {
				weakness: 'One account pile for every brand, client, and channel'
			},
			product_focus: {
				strength: 'Social listening and ads tooling in higher tiers for full-funnel teams',
				weakness: 'Enterprise bundles with listening and ads you may never use'
			},
			programmatic_access: {
				weakness: 'In-product MCP connectors — not workspace-scoped endpoints for editor or terminal agents'
			},
			publishing_control: {
				weakness: 'Autopilot publishing with limited human checkpoints'
			}
		}
	}
};
