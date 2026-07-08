import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';

const HOOTSUITE_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Standard',
		monthlyPrice: 199,
		tagline: 'Best for small teams that need publishing and engagement basics',
		footnote: 'Per user / month (annual billing)'
	},
	{
		name: 'Advanced',
		monthlyPrice: 399,
		tagline: 'Best for growing teams that need analytics, inbox, and approvals',
		footnote: 'Per user / month (annual billing)'
	},
	{
		name: 'Enterprise',
		monthlyPrice: null,
		tagline: 'Best for large organizations with custom security and governance needs',
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
	'Google Business Profile',
	'WhatsApp'
];

const HOOTSUITE_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'excluded' },
	channels: { kind: 'text', text: 'Varies by plan' },
	posts_per_month: { kind: 'text', text: 'Unlimited scheduling' },
	team_members: { kind: 'text', text: 'Per-seat licensing' },
	share_post_preview: { kind: 'included' },
	public_api: { kind: 'excluded' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'excluded' },
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
	tagline: 'Enterprise social marketing suite since 2008',
	overview:
		'Hootsuite is an established social media management platform for marketing teams. It covers publishing, content calendar, social inbox, listening, analytics, and team workflows — with broad network support and per-user pricing aimed at mid-market and enterprise organizations.',
	pricingPlans: HOOTSUITE_PRICING_PLANS,
	channels: HOOTSUITE_CHANNELS,
	featureSupport: HOOTSUITE_FEATURE_SUPPORT,
	comparison: {
		headline: 'enterprise social marketing',
		notAnother: 'enterprise dashboard',
		builtFor: 'marketing teams in a browser',
		positioningWhenLeft:
			'covers publishing, inbox, listening, and analytics for teams that live in the dashboard',
		advantages: [
			'Broad network coverage including WhatsApp and Google Business Profile',
			'Social listening and ads tooling in higher tiers for full-funnel teams',
			'Per-seat roles and approvals for established marketing departments',
			'Mature analytics and reporting for enterprise stakeholders',
			'Deep inbox and engagement workflows across major networks',
			'Trusted brand with long-standing enterprise integrations'
		],
		disadvantages: [
			'Copy drafts between your AI assistant and a separate scheduling tab',
			'Per-seat pricing that climbs as you add collaborators',
			'One account pile for every brand, client, and channel',
			'Enterprise bundles with listening and ads you may never use',
			'No first-class path for Cursor, Claude Code, or terminal workflows',
			'Autopilot publishing with limited human checkpoints'
		]
	}
};
