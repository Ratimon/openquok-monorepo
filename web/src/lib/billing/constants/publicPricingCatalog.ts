import type { PaidSubscriptionTier } from 'openquok-common';
import { PAID_SUBSCRIPTION_TIERS } from 'openquok-common';

/** Paid tiers in display order (left → right on the pricing page). */
export const PUBLIC_PRICING_TIER_ORDER = PAID_SUBSCRIPTION_TIERS;

/** Highlighted column on cards and the comparison table. */
export const PUBLIC_PRICING_FEATURED_TIER: PaidSubscriptionTier = 'ULTIMATE';

export type PublicPricingPlanMeta = {
	tagline: string;
};

export const PUBLIC_PRICING_PLAN_META: Record<PaidSubscriptionTier, PublicPricingPlanMeta> = {
	SOLO: {
		tagline: 'Best for individuals and solo creators'
	},
	TEAM: {
		tagline: 'Best for growing teams and businesses'
	},
	ULTIMATE: {
		tagline: 'Best for managing multiple brands and AI agents'
	},
	MAX: {
		tagline: 'Best for scalling by Heavy users running tons of AI agents'
	}
};

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

export type PublicPricingFaqItem = {
	title: string;
	description: string;
};

export const PUBLIC_PRICING_FAQ_ITEMS: readonly PublicPricingFaqItem[] = [
	{
		title: 'Why switch from Buffer or Hootsuite?',
		description:
			'Buffer and Hootsuite charge $75–$200/month for enterprise feature most teams never use. OpenQuok covers the same UI scheduling basics including connect channels, compose, calendar, multi-channel publish. We also cover agent-first features like workspaces, integrations, and API/CLI access. Same workflow when you post by hand; built for when agents do the work. Less cost, less clutter, and real support from Meta and OpenQuok team.'
	},
	{
		title: 'Can I try OpenQuok for free?',
		description:
			'Yes. OpenQuok offers a 7-day free trial. You can create an account and start today!'
	},
	{
		title: 'Can I self-host OpenQuok?',
		description:
			'Yes. OpenQuok is open source, so you can run it on your own infrastructure (eg. AWS, GCP, Hezner, or even vercel) and manage limits locally without needing a subscription.'
	},
	{
		title: 'Can I get a refund?',
		description:
			'With in 1 month, you can get a refund if you have not used the product during a billing period. If you have used the product during a billing period, contact support and we will work with you on a fair resolution. Self-hosted deployments follow your own billing policies.'
	},
	{
		title: 'Can I change plans later?',
		description:
			'Yes. Upgrade or downgrade from account billing settings. Proration and timing follow your Stripe subscription when cloud billing is enabled.'
	},
	{
		title: 'What is the agent workspace?',
		description:
			'An agent workspace is where you connect channels, schedule posts, and collaborate. Workspaces exist to keep agent and automation context focused. Too many channels or tasks in one place can cause context rot or hallucinations. Use separate workspaces for different brands or clients when things get crowded.'
	},
	{
		title: 'What counts as a channel?',
		description:
			'A channel is a connected social account (for example Facebook, Instagram, LinkedIn, TikTok, YouTube, Reddit, Threads, or Pinterest). You schedule posts to the channels you connect.'
	},
	{
		title: 'Can I connect 2 channels to the same platform?',
		description:
			'Yes. Example: SOLO plan can connect 15 total accounts, all of them can be tiktok accounts.'
	},
	{
		title: 'How does team members work?',
		description:
			'Team members are people you invite to a workspace. They can collaborate on content and connect their own channels where your plan allows. Seat limits are shown as invites plus you as owner. For example, “2 + 1 (you) per workspace” means four invited members and one seat for you on each workspace you own.'
	},
	{ title: 'will my post get less reach or banned if I use multi-channel publishing with OpenQuok?',
		description:
			'No ! We use the official API for each platform. Your posts should perform the same as if you published them directly on each platform. We had the same concern that algorithms might favor in-app posting, but in our own tests we did not see lower reach when scheduling through OpenQuok.'
	},
	{
		title: 'How does repeated posts work',
		description:
			'Repeated posts let you automatically republish evergreen content on a schedule (daily, weekly, or a custom cadence). It’s a great way to keep promoting ongoing offers, quotes, or other timeless content without manually rescheduling.'
	},
	{
		title: 'What are reusable templates and how does it work?',
		description:
			'Templates are pre-defined groups of channels with custom message templates. If you frequently post to the same combination of accounts (e.g., your personal X + company LinkedIn + Facebook page), you can save it as a Set for one-click posting.'
	},
	{
		title: 'What are reusable signatures and how does it work?',
		description:
			'Signatures are snippets of text you can automatically append to posts (hashtags, links, promos). If you often use the same call-to-action or signature across multiple posts, save it once and reuse it everywhere.'
	},
	{
		title: 'What analytics does OpenQuok offer?',
		description:
			'Get detailed analytics across connected platforms—impressions, likes, comments, shares, bookmarks, and engagement rate—so you can track results over time and see what content resonates most.'
	},
	{
		title: 'Can I schedule comments or threads',
		description:
			'Yes. You can schedule follow-up comments to help drive engagement. On platforms like X and Threads, you can also schedule full threads, while on LinkedIn and Facebook scheduled comments are posted as replies to your main post.'
	},
	{
		title: 'What is the delay feature between posts?',
		description:
			'Use the delay feature to add time gaps between posts and scheduled comments for a more natural publishing cadence—space them out by minutes or hours instead of posting everything at once.'
	},
	{
		title: 'I have connnected too many channels, what should I do?',
		description:
			'The Group management feature let you organize connected channels by client, brand, or any structure you like—making it simple to manage multiple clients or keep personal and business accounts separate. This can be selected to create post later or used by smart filters.'
	}
];
