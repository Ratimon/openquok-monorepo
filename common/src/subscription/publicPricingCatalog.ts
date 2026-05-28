import type { PaidSubscriptionTier } from './types.js';
import { PAID_SUBSCRIPTION_TIERS } from './types.js';

/** Paid tiers in display order (left → right on the pricing page). */
export const PUBLIC_PRICING_TIER_ORDER = PAID_SUBSCRIPTION_TIERS;

/** Highlighted column on cards and the comparison table. */
export const PUBLIC_PRICING_FEATURED_TIER: PaidSubscriptionTier = 'TEAM';

export type PublicPricingPlanMeta = {
	tagline: string;
	/** Optional note under the compare-table CTA (e.g. solo workspace). */
	compareFootnote?: string;
};

export const PUBLIC_PRICING_PLAN_META: Record<PaidSubscriptionTier, PublicPricingPlanMeta> = {
	SOLO: {
		tagline: 'Best for individuals and solo creators',
		compareFootnote: 'Single workspace'
	},
	CREATOR: {
		tagline: 'Best for creators and small teams',
		compareFootnote: 'Unlimited Posts'
	},
	TEAM: {
		tagline: 'Best for growing teams and businesses',
		compareFootnote: 'Unlimited team members'
	},
	ULTIMATE: {
		tagline: 'Best for scaling tons of AI agents'
	}
};

/** Product capabilities included on every paid plan (marketing copy for cards). */
export const PUBLIC_PRICING_SHARED_CARD_FEATURES: readonly string[] = [
	'Multi-channel publishing',
	'Agent integrations',
	'Analytics',
	'Calendar views',
	'Kanban views',
	'Reusable templates',
	'Reusable signatures',
	'Post delays',
	'Post comments',
	'Group management',
	'Community features',
	'Dark / light mode'
];

export type PublicPricingCompareRowId =
	| 'workspaces'
	| 'channels'
	| 'posts_per_month'
	| 'team_members'
	| 'share_post_preview'
	| 'public_api'
	| 'cloud_storage'
	| 'multi_channel_publishing'
	| 'agent_integrations'
	| 'analytics'
	| 'canva_editor'
	| 'calendar_views'
	| 'kanban_views'
	| 'file_manager'
	| 'repeated_posts'
	| 'reusable_templates'
	| 'reusable_signatures'
	| 'smart_filter'
	| 'post_delays'
	| 'post_comments'
	| 'cross_posting'
	| 'internal_plugs'
	| 'global_plugs'
	| 'group_management'
	| 'dark_light_mode'
	| 'community';

export type PublicPricingCompareRowDefinition = {
	id: PublicPricingCompareRowId;
	label: string;
	tooltip?: string;
};

export const PUBLIC_PRICING_COMPARE_ROWS: readonly PublicPricingCompareRowDefinition[] = [
	{
		id: 'workspaces',
		label: 'Workspaces',
		tooltip:
			'Separate workspaces for different brands, clients, or focus areas. Too many channels or tasks in one place can cause context rot or hallucinations.'
	},
	{
		id: 'channels',
		label: 'Total channels',
		tooltip:
			'Channels are capped per workspace. The table shows the total across all workspaces on the plan (for example 20 per workspace × 2 workspaces = 40 total).'
	},
	{
		id: 'posts_per_month',
		label: 'Posts per month',
		tooltip: 'Maximum scheduled and published posts per month across your account.'
	},
	{
		id: 'team_members',
		label: 'Team members',
		tooltip:
			'Seats are capped per workspace. The table shows the total across all workspaces on the plan (for example 3 per workspace × 2 workspaces = 6 total).'
	},
	{
		id: 'share_post_preview',
		label: 'Shareable post previews',
		tooltip: 'Public links to preview scheduled posts before they go live.'
	},
	{
		id: 'public_api',
		label: 'Public API',
		tooltip: 'Programmatic access to schedule and manage content via REST API from the terminal.'
	},
	{
		id: 'cloud_storage',
		label: 'Cloud media storage',
		tooltip:
			'Storage is capped per workspace. The table shows the total across all workspaces on the plan (for example 5 GiB per workspace × 2 workspaces = 10 GiB total).'
	},
	{
		id: 'multi_channel_publishing',
		label: 'Multi-channel publishing',
		tooltip: 'Schedule and publish the same content to multiple channels with per-platform customization..'
	},
	{
		id: 'agent_integrations',
		label: 'Agent integrations',
		tooltip:
			'Connect to OpenClaw, Hermes, or Claude.\nAuthenticate with OAuth or an API key; install the skill so agents can schedule posts and upload media from the terminal.'
	},
	{
		id: 'analytics',
		label: 'Analytics',
		tooltip: 'Track post performance and engagement across channels.'
	},
	{
		id: 'canva_editor',
		label: 'Canva editor',
		tooltip: 'Interactive canvas style editor to resize and tailor your content to the platform.'
	},
	{
		id: 'calendar_views',
		label: 'Calendar views',
		tooltip: 'Plan/review/edit content with day / week / month calendar views.'
	},
	{
		id: 'kanban_views',
		label: 'Kanban views',
		tooltip: 'Review AI-genrated post by moving them through draft → review → scheduled in a kanban workflow.'
	},
	{
		id: 'file_manager',
		label: 'File manager',
		tooltip: 'Create, rename, organize and manage your media/footage files.'
	},
	{
		id: 'repeated_posts',
		label: 'Repeated posts',
		tooltip: 'Automatically re-publish evergreen posts on a schedule (daily, weekly, monthly).'
	},
	{
		id: 'reusable_templates',
		label: 'Reusable templates',
		tooltip: 'Reusable channel groups with tailored messages for quick posting to your go-to combinations.'
	},
	{
		id: 'reusable_signatures',
		label: 'Reusable signatures',
		tooltip: 'Automatically append signature snippets (hashtags, links, promos) to yout contents.'
	},
	{
		id: 'smart_filter',
		label: 'Smart filters',
		tooltip: 'Build and save custom filters to quickly find channels, templates or signatures.'
	},
	{
		id: 'post_delays',
		label: 'Post delays',
		tooltip: 'Add delays between posts and comments for a natural publishing rhythm.'
	},
	{
		id: 'post_comments',
		label: 'Post comments',
		tooltip: 'Schedule follow-up comments (and threads where supported) to boost engagement.'
	},
	{
		id: 'internal_plugs',
		label: 'Internal plugs',
		tooltip: 'Boost engagement using other connected accounts in your workspace.'
	},
	{
		id: 'global_plugs',
		label: 'Global plugs',
		tooltip: 'Trigger automations when posts hit engagement thresholds.'
	},
	{
		id: 'group_management',
		label: 'Group management',
		tooltip: 'Organize channels into groups for client, brand, or team workflows.'
	},
	{
		id: 'dark_light_mode',
		label: 'Dark / light mode',
		tooltip: 'Switch themes based on preference.'
	},
	{
		id: 'community',
		label: 'Community features',
		tooltip: 'Blog comments, and related community surfaces.'
	}
];

export type PublicPricingFaqItem = {
	title: string;
	description: string;
};

export const PUBLIC_PRICING_FAQ_ITEMS: readonly PublicPricingFaqItem[] = [
	{
		title: 'Can I try OpenQuok for free?',
		description:
			'You can create an account and explore the product. Paid plans unlock higher limits for workspaces, channels, posts, storage, and team collaboration. Trial availability depends on your deployment’s billing settings.'
	},
	{
		title: 'Can I get a refund?',
		description:
			'If you have not used the product during a billing period, contact support and we will work with you on a fair resolution. Self-hosted deployments follow your own billing policies.'
	},
	{
		title: 'Can I self-host OpenQuok?',
		description:
			'Yes. OpenQuok is open source. You can deploy on your own infrastructure and manage limits locally without a cloud subscription.'
	},
	{
		title: 'What is a workspace?',
		description:
			'A workspace is where you connect channels, schedule posts, and collaborate. Use separate workspaces for different brands or clients to keep context focused.'
	},
	{
		title: 'What counts as a channel?',
		description:
			'A channel is a connected publishing account such as X, LinkedIn, Instagram, Facebook, TikTok, YouTube, or Pinterest.'
	},
	{
		title: 'How does yearly billing work?',
		description:
			'Yearly billing charges once per year at the listed annual price (about 20% less than paying monthly). Limits match the monthly plans; only the billing cadence changes.'
	},
	{
		title: 'Can I change plans later?',
		description:
			'Yes. Upgrade or downgrade from account billing settings. Proration and timing follow your Stripe subscription when cloud billing is enabled.'
	}
];
