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
		tagline: 'Best for creators and small brands'
	},
	TEAM: {
		tagline: 'Best for growing teams and businesses'
	},
	ULTIMATE: {
		tagline: 'Best for agencies managing many brands'
	}
};

/** Product capabilities included on every paid plan (marketing copy for cards). */
export const PUBLIC_PRICING_SHARED_CARD_FEATURES: readonly string[] = [
	'Post scheduling & calendar views',
	'Multi-channel publishing',
	'OAuth integrations',
	'Community blog & comments',
	'Dark / light mode'
];

// to do : addmore
export type PublicPricingCompareRowId =
	| 'workspaces'
	| 'channels'
	| 'posts_per_month'
	| 'team_members'
	| 'share_post_preview'
	| 'public_api'
	| 'cloud_storage'
	| 'scheduling'
	| 'integrations'
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
			'Separate workspaces for brands, clients, or focus areas. Billing and invites apply per workspace you own.'
	},
	{
		id: 'channels',
		label: 'Total channels',
		tooltip:
			'Connected publishing accounts across all workspaces on your billing account (for example X, LinkedIn, Instagram, or YouTube).'
	},
	{
		id: 'posts_per_month',
		label: 'Posts per month',
		tooltip: 'Maximum scheduled and published posts per month across your account.'
	},
	{
		id: 'team_members',
		label: 'Team members',
		tooltip: 'Collaborators you can invite across workspaces on your billing account.'
	},
	{
		id: 'share_post_preview',
		label: 'Shareable post previews',
		tooltip: 'Public links to preview scheduled posts before they go live.'
	},
	{
		id: 'public_api',
		label: 'Public API',
		tooltip: 'Programmatic access to schedule and manage content via REST API.'
	},
	{
		id: 'cloud_storage',
		label: 'Cloud media storage',
		tooltip: 'Shared media library storage per workspace; totals combine across workspaces on the plan.'
	},
	{
		id: 'scheduling',
		label: 'Scheduling & calendar',
		tooltip: 'Schedule posts and manage them in day, week, and month calendar views.'
	},
	{
		id: 'integrations',
		label: 'OAuth integrations',
		tooltip: 'Connect third-party apps and custom OAuth clients where your deployment allows.'
	},
	{
		id: 'community',
		label: 'Community features',
		tooltip: 'Blog comments, public skill listings, and related community surfaces.'
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
