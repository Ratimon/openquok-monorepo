import type { IconName } from '$data/icons';

import type { PaidSubscriptionTier } from 'openquok-common';
import { PAID_SUBSCRIPTION_TIERS } from 'openquok-common';

/** Paid tiers in display order (left → right on the pricing page). */
export const PUBLIC_PRICING_TIER_ORDER = PAID_SUBSCRIPTION_TIERS;

/** Highlighted column on cards and the comparison table. */
export const PUBLIC_PRICING_FEATURED_TIER: PaidSubscriptionTier = 'ULTIMATE';

export type PublicPricingPlanMeta = {
	/** Short line on landing pricing tabs (left column). */
	tagline: string;
	/** Pain-point headline on the landing pricing detail card (below price). */
	tabHeadline: string;
};

export const PUBLIC_PRICING_PLAN_META: Record<PaidSubscriptionTier, PublicPricingPlanMeta> = {
	SOLO: {
		tagline: 'Best for individuals and solo creators',
		tabHeadline:
			'Still hunting for a repeatable viral format? One agent workspace keeps experiments focused until you know what works.'
	},
	TEAM: {
		tagline: 'Best for growing teams and businesses',
		tabHeadline:
			'You found formats that work — now bring in more workspaces, people, and social channels'
	},
	ULTIMATE: {
		tagline: 'Best for managing multiple brands and AI agents',
		tabHeadline:
			'Running several brands or AI agents? Invite the whole team, split workspaces, and stop fighting per-seat limits.'
	},
	MAX: {
		tagline: 'Best for heavy users running tons of AI agents at scale',
		tabHeadline:
			'Your Viral format is proven! Now push extreme volume across many workspaces, and channels? Max is built for throughput when “more” is the whole job.'
	}
};

export const PUBLIC_PRICING_LANDING_TAB_ICONS: Record<PaidSubscriptionTier, IconName> = {
	SOLO: 'Rocket',
	TEAM: 'Users',
	ULTIMATE: 'Sparkles',
	MAX: 'Gauge'
};

/** Max feature bullets in the landing tab detail card (two-column grid). */
export const PUBLIC_PRICING_LANDING_TAB_FEATURE_LIMIT = 6;

/** Product capabilities included on every paid plan (marketing copy for cards). */
export const PUBLIC_PRICING_SHARED_CARD_FEATURES: readonly string[] = [
	'Multi-channel publishing',
	'Agent integrations',
	'Analytics',
	'Calendar views',
	'Kanban views',
	'Footage File manager',
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
		label: 'Agent workspaces',
		tooltip:
			'1 workspace = 1 agent. Separate workspaces for different brands, clients, or focus areas. Too many channels or tasks in one place can cause context rot or hallucinations.'
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
		tooltip: 'Track post performance (eg. likes, comments, shares) across channels.'
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
		label: 'Footage File manager',
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
		tooltip:
			'Templates are saved groups of channels with message templates. If you often post to the same mix of accounts (for example your personal X, your company LinkedIn, and a Facebook page), save it once for one-click posting.'
	},
	{
		id: 'reusable_signatures',
		label: 'Reusable signatures',
		tooltip: 'Automatically append signature snippets (hashtags, links, promos) to yout contents.'
	},
	{
		id: 'smart_filter',
		label: 'Smart filters',
		tooltip:
			'Build and save filters in calendat post, plugs, and templates.\nExamples: by platform, channel groups, or tags.'
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
		tooltip: 'Boost engagement using other connected accounts (Only available for plug based social platform eg. Threads).'
	},
	{
		id: 'global_plugs',
		label: 'Global plugs',
		tooltip: 'Mannage Trigger replies at scale when posts hit engagement thresholds (eg. 100 likes).'
	},
	{
		id: 'group_management',
		label: 'Group management',
		tooltip: 'Organize channels into groups for account/workflow management. This can be selected to create post later or used by smart filters.'
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

export type { PublicFaqItem as PublicPricingFaqItem } from '$lib/content/constants/publicFaqCatalog';
export { PUBLIC_FAQ_ITEMS as PUBLIC_PRICING_FAQ_ITEMS } from '$lib/content/constants/publicFaqCatalog';
