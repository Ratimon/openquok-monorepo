import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';

const BUFFER_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Free',
		monthlyPrice: 0,
		tagline: 'Best for individuals trying queue-based scheduling on a few channels',
		footnote: 'Up to 3 channels · limited scheduled posts per channel'
	},
	{
		name: 'Essentials',
		monthlyPrice: 5,
		tagline: 'Best for creators who need analytics and engagement tools per channel',
		footnote: 'Per channel / month (annual billing)'
	},
	{
		name: 'Team',
		monthlyPrice: 10,
		tagline: 'Best for small teams that need approvals and collaboration per channel',
		footnote: 'Per channel / month (annual billing)'
	}
];

const BUFFER_CHANNELS = [
	'Facebook',
	'Instagram',
	'LinkedIn',
	'X',
	'TikTok',
	'YouTube',
	'Pinterest',
	'Threads',
	'Bluesky',
	'Mastodon',
	'Google Business Profile'
];

const BUFFER_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'excluded' },
	channels: { kind: 'text', text: 'Per-channel pricing' },
	posts_per_month: { kind: 'text', text: 'Plan limits apply' },
	team_members: { kind: 'text', text: 'Team plan per channel' },
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
	repeated_posts: { kind: 'excluded' },
	reusable_templates: { kind: 'included' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'text', text: 'Queue slots' },
	post_comments: { kind: 'included' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'excluded' },
	dark_light_mode: { kind: 'included' },
	community: { kind: 'excluded' }
};

export const bufferCompareProduct: CompareProduct = {
	slug: 'buffer',
	name: 'Buffer',
	tagline: 'Queue-based social scheduler for creators since 2010',
	overview:
		'Buffer is an established social media management platform for individuals, creators, and small businesses. It offers queue-based scheduling, an AI assistant for drafting posts, a community inbox for comments, analytics, and team collaboration — with per-channel pricing across major social networks.',
	pricingPlans: BUFFER_PRICING_PLANS,
	channels: BUFFER_CHANNELS,
	featureSupport: BUFFER_FEATURE_SUPPORT,
	comparison: {
		headline: 'queue-based scheduling',
		notAnother: 'queue tab',
		builtFor: 'creators and small teams in a browser queue',
		positioningWhenLeft:
			'keeps scheduling simple with per-channel pricing and a familiar publishing queue',
		advantages: [
			'Free tier to try queue scheduling on up to three channels',
			'Low per-channel pricing for creators who only need essentials',
			'Clean queue UI with AI drafting built into the scheduler',
			'Community inbox for comments without enterprise overhead',
			'Straightforward analytics for content performance',
			'Fast setup for individuals publishing to a handful of networks'
		],
		disadvantages: [
			'Per-channel pricing that climbs as you add networks',
			'One queue for every brand, client, and channel',
			'Copy drafts between your AI assistant and a separate scheduling tab',
			'Browser-only queue with no programmatic path for agents',
			'Free tier caps you at three channels with limited scheduling',
			'AI assistant lives inside the product — not in your editor or terminal workflow'
		]
	}
};
