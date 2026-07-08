import type { PublicAgentComparisonSection } from '$lib/content/constants/agents/types';
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

const OPENQUOK_WITH_HOOTSUITE_COMPARISON: PublicAgentComparisonSection = {
	subtitle: 'comparisons',
	title: 'agent-native scheduling, not another enterprise dashboard',
	description:
		'Hootsuite is built for marketing teams in a browser. OpenQuok covers the same scheduling basics — and adds workspaces, agents, and API access when automation does the work.',
	withoutTitle: 'Typical Hootsuite workflow',
	withTitle: 'OpenQuok',
	points: [
		{
			pain: 'Copy drafts between your AI assistant and a separate scheduling tab',
			feature: 'Agents draft and schedule via skills, MCP, or the Public API — you approve on the calendar'
		},
		{
			pain: 'Per-seat pricing that climbs as you add collaborators',
			feature: 'Flat workspace pricing from $29/mo — team seats scale with your plan, not per user'
		},
		{
			pain: 'One account pile for every brand, client, and channel',
			feature:
				'Agent workspaces isolate channels, OAuth apps, tokens, and MCP endpoints per brand or client'
		},
		{
			pain: 'Enterprise bundles with listening and ads you may never use',
			feature:
				'Focused scheduling, analytics, and agent integrations — pay for what you publish, not unused suites'
		},
		{
			pain: 'No first-class path for Cursor, Claude Code, or terminal workflows',
			feature: 'MCP server and CLI per workspace — connect agents without copy-pasting between tools'
		},
		{
			pain: 'Autopilot publishing with limited human checkpoints',
			feature: 'Every agent draft lands as draft or scheduled — you approve before anything goes live'
		}
	]
};

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

export const openquokWithHootsuiteComparison: PublicAgentComparisonSection =
	OPENQUOK_WITH_HOOTSUITE_COMPARISON;

export const hootsuiteCompareProduct: CompareProduct = {
	slug: 'hootsuite',
	name: 'Hootsuite',
	tagline: 'Enterprise social marketing suite since 2008',
	overview:
		'Hootsuite is an established social media management platform for marketing teams. It covers publishing, content calendar, social inbox, listening, analytics, and team workflows — with broad network support and per-user pricing aimed at mid-market and enterprise organizations.',
	pricingPlans: HOOTSUITE_PRICING_PLANS,
	channels: HOOTSUITE_CHANNELS,
	featureSupport: HOOTSUITE_FEATURE_SUPPORT
};
