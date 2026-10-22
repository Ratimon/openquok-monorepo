import type { IconName } from '$data/icons';

import type {
	PublicPricingCardFeatureDefinition,
	PublicPricingFeatureLine
} from '$lib/billing/constants/publicPricingProductLines';
import { cardFeatureDefinitionsForLine } from '$lib/billing/constants/publicPricingProductLines';
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
			'You found formats that work — bring in more workspaces, editors, reviewers, and clients across your social channels. Comment inline, approve drafts, and auto-publish once everyone signs off — no more Slack threads chasing approval.'
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
export const PUBLIC_PRICING_LANDING_TAB_FEATURE_LIMIT = 11;

/** Marketing plan-card bullets tagged by product line (`shared` bullets show in every filter mode). */
export const PUBLIC_PRICING_CARD_FEATURE_DEFINITIONS: readonly PublicPricingCardFeatureDefinition[] = [
	{ label: 'Official platform APIs', line: 'social' },
	{ label: 'Multi-channel publishing', line: 'social' },
	{ label: 'Agent integrations', line: 'shared' },
	{ label: 'Analytics', line: 'social' },
	{ label: 'Calendar views', line: 'social' },
	{ label: 'Kanban views', line: 'social' },
	{ label: 'Footage File manager', line: 'social' },
	{ label: 'Reusable templates', line: 'social' },
	{ label: 'Reusable signatures', line: 'social' },
	{ label: 'Post delays', line: 'social' },
	{ label: 'Post comments', line: 'social' },
	{ label: 'Group management', line: 'social' },
	{ label: 'Business profiles & directory launch', line: 'directory' },
	{ label: 'Browser extension autofill', line: 'directory' },
	{ label: 'Directory submission tracking', line: 'directory' },
	{ label: 'Domain rating analytics', line: 'directory' },
	{ label: 'Profile variants per directory', line: 'directory' },
	{ label: 'Community features', line: 'shared' },
	{ label: 'Dark / light mode', line: 'shared' }
];

const cardFeatureLabels = (definitions: readonly PublicPricingCardFeatureDefinition[]) =>
	definitions.map((feature) => feature.label);

/** Social scheduler marketing bullets (plan cards + landing tabs). */
export const PUBLIC_PRICING_SOCIAL_CARD_FEATURES: readonly string[] = cardFeatureLabels(
	cardFeatureDefinitionsForLine(PUBLIC_PRICING_CARD_FEATURE_DEFINITIONS, 'social')
);

/** Directory launch marketing bullets (plan cards + landing tabs). */
export const PUBLIC_PRICING_DIRECTORY_CARD_FEATURES: readonly string[] = cardFeatureLabels(
	cardFeatureDefinitionsForLine(PUBLIC_PRICING_CARD_FEATURE_DEFINITIONS, 'directory')
);

/** Cross-line bullets included on every product-line filter (workspaces, theme, shared tooling). */
export const PUBLIC_PRICING_SHARED_CARD_FEATURES: readonly string[] = cardFeatureLabels(
	cardFeatureDefinitionsForLine(PUBLIC_PRICING_CARD_FEATURE_DEFINITIONS, 'shared')
);

/** On-device AI bullets — inserted on cards immediately after the team-members line. */
export const PUBLIC_PRICING_AI_CARD_FEATURES: readonly string[] = [
	'Unlimited AI Writer (experimental)',
	'Unlimited AI Summarizer (experimental)'
];

export type PublicPricingCompareRowId =
	| 'workspaces'
	| 'channels'
	| 'posts_per_month'
	| 'team_members'
	| 'share_post_preview'
	| 'official_api'
	| 'public_api'
	| 'oauth_apps'
	| 'mcp_server'
	| 'cloud_storage'
	| 'multi_channel_publishing'
	| 'ai_writer'
	| 'ai_summarizer'
	| 'agent_integrations'
	| 'analytics'
	| 'photo_editor'
	| 'skill_builder'
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
	| 'cross_account_plugs'
	| 'global_plugs'
	| 'group_management'
	| 'dark_light_mode'
	| 'directory_business_profiles'
	| 'directory_extension_autofill'
	| 'directory_submission_tracking'
	| 'directory_profile_variants'
	| 'directory_analytics'
	| 'directory_competitor_domains'
	| 'directory_catalog_dr'
	| 'community';

export type PublicPricingCompareRowDefinition = {
	id: PublicPricingCompareRowId;
	label: string;
	tooltip?: string;
	line: PublicPricingFeatureLine;
};

export const PUBLIC_PRICING_COMPARE_ROWS: readonly PublicPricingCompareRowDefinition[] = [
	{
		id: 'workspaces',
		line: 'shared',
		label: 'Agent workspaces',
		tooltip:
			'1 workspace = 1 agent. Separate workspaces for different brands, clients, or focus areas. Too many channels or tasks in one place can cause context rot or hallucinations.'
	},
	{
		id: 'channels',
		line: 'social',
		label: 'Total channels',
		tooltip:
			'Channels are capped per workspace. The table shows the total across all workspaces on the plan (for example 20 per workspace × 2 workspaces = 40 total).'
	},
	{
		id: 'posts_per_month',
		line: 'social',
		label: 'Posts per month',
		tooltip: 'Maximum scheduled and published posts per month across your account.'
	},
	{
		id: 'team_members',
		line: 'shared',
		label: 'Team members',
		tooltip:
			'Seats are capped per workspace. The table shows the total across all workspaces on the plan (for example 3 per workspace × 2 workspaces = 6 total).'
	},
	{
		id: 'ai_writer',
		line: 'social',
		label: 'AI Writer',
		tooltip:
			'On-device drafting via Chrome’s experimental Writer and Rewriter APIs. Requires a supported Chromium browser.\nDocs: https://developer.chrome.com/docs/ai/writer-api · https://developer.chrome.com/docs/ai/rewriter-api'
	},
	{
		id: 'ai_summarizer',
		line: 'social',
		label: 'AI Summarizer',
		tooltip:
			'On-device summarization via Chrome’s experimental Summarizer API. Requires a supported Chromium browser.\nDocs: https://developer.chrome.com/docs/ai/scale-summarization'
	},
	{
		id: 'share_post_preview',
		line: 'social',
		label: 'Shareable post previews',
		tooltip: 'Public links to preview scheduled posts before they go live.'
	},
	{
		id: 'official_api',
		line: 'social',
		label: 'Official platform APIs',
		tooltip:
			'Publish through each network’s official API — not browser extensions, scrapers, or unofficial workarounds.'
	},
	{
		id: 'public_api',
		line: 'social',
		label: 'Public API',
		tooltip: 'Programmatic access to schedule and manage content via REST API from the terminal.'
	},
	{
		id: 'oauth_apps',
		line: 'social',
		label: 'OAuth apps',
		tooltip:
			'One OAuth application per workspace for third-party integrations, client credentials, and programmatic access tokens.'
	},
	{
		id: 'mcp_server',
		line: 'social',
		label: 'MCP server',
		tooltip:
			'One MCP endpoint per workspace for Cursor, Claude Code, Codex, and other agents.\nUses the same OAuth app and programmatic token as Public API access in that workspace.'
	},
	{
		id: 'cloud_storage',
		line: 'shared',
		label: 'Cloud media storage',
		tooltip:
			'Storage is capped per workspace. The table shows the total across all workspaces on the plan (for example 5 GiB per workspace × 2 workspaces = 10 GiB total).'
	},
	{
		id: 'multi_channel_publishing',
		line: 'social',
		label: 'Multi-channel publishing',
		tooltip: 'Schedule and publish the same content to multiple channels with per-platform customization..'
	},
	{
		id: 'agent_integrations',
		line: 'shared',
		label: 'Agent integrations',
		tooltip:
			'Connect to OpenClaw, Hermes, ChatGPT, Claude or other agents.\nAuthenticate with OAuth or an API key; install the skill so agents can schedule posts and upload media from the terminal.'
	},
	{
		id: 'analytics',
		line: 'social',
		label: 'Analytics',
		tooltip: 'Track post performance (eg. likes, comments, shares) across channels.'
	},
	{
		id: 'photo_editor',
		line: 'social',
		label: 'Photo editor',
		tooltip:
			'Browser-based canvas editor to resize visuals, add text and elements, and tailor content for channel-specific formats — feed posts, stories, thumbnails, and more.'
	},
	{
		id: 'skill_builder',
		line: 'social',
		label: 'Skill builder',
		tooltip:
			'Visual workflow builder for composing agent-ready setup guides and exporting `SKILL.md` content from reusable building blocks.'
	},
	{
		id: 'calendar_views',
		line: 'social',
		label: 'Calendar views',
		tooltip: 'Plan/review/edit content with day / week / month calendar views.'
	},
	{
		id: 'kanban_views',
		line: 'social',
		label: 'Kanban views',
		tooltip: 'Review AI-genrated post by moving them through draft → review → scheduled in a kanban workflow.'
	},
	{
		id: 'file_manager',
		line: 'social',
		label: 'Footage File manager',
		tooltip: 'Create, rename, organize and manage your media/footage files.'
	},
	{
		id: 'repeated_posts',
		line: 'social',
		label: 'Repeated posts',
		tooltip: 'Automatically re-publish evergreen posts on a schedule (daily, weekly, monthly).'
	},
	{
		id: 'reusable_templates',
		line: 'social',
		label: 'Reusable templates',
		tooltip:
			'Templates are saved groups of channels with message templates. If you often post to the same mix of accounts (for example your personal X, your company LinkedIn, and a Facebook page), save it once for one-click posting.'
	},
	{
		id: 'reusable_signatures',
		line: 'social',
		label: 'Reusable signatures',
		tooltip: 'Automatically append signature snippets (hashtags, links, promos) to yout contents.'
	},
	{
		id: 'smart_filter',
		line: 'social',
		label: 'Smart filters',
		tooltip:
			'Build and save filters in calendat post, plugs, and templates.\nExamples: by platform, channel groups, or tags.'
	},
	{
		id: 'post_delays',
		line: 'social',
		label: 'Post delays',
		tooltip: 'Add delays between posts and comments for a natural publishing rhythm.'
	},
	{
		id: 'post_comments',
		line: 'social',
		label: 'Post comments',
		tooltip: 'Schedule follow-up comments (and threads where supported) to boost engagement.'
	},
	{
		id: 'internal_plugs',
		line: 'social',
		label: 'Internal plugs',
		tooltip:
			'Same-account per-post engagement after publish (e.g. Threads delayed engagement reply on the publishing channel).'
	},
	{
		id: 'cross_account_plugs',
		line: 'social',
		label: 'Cross-account plugs',
		tooltip:
			'Other connected channels comment, repost, or reshare after publish (Threads, X, LinkedIn).'
	},
	{
		id: 'global_plugs',
		line: 'social',
		label: 'Global plugs',
		tooltip: 'Manage trigger replies at scale when posts hit engagement thresholds (e.g. 100 likes).'
	},
	{
		id: 'group_management',
		line: 'social',
		label: 'Group management',
		tooltip: 'Organize channels into groups for account/workflow management. This can be selected to create post later or used by smart filters.'
	},
	{
		id: 'directory_business_profiles',
		line: 'directory',
		label: 'Business profiles & directory launch',
		tooltip:
			'Store pitch copy on a business profile, pick a directory destination, and hand off to the browser extension to autofill the listing form. You submit on each directory site.'
	},
	{
		id: 'directory_extension_autofill',
		line: 'directory',
		label: 'Browser extension autofill',
		tooltip:
			'Chrome extension fills directory listing forms from your business profile so you review and submit on each site.'
	},
	{
		id: 'directory_submission_tracking',
		line: 'directory',
		label: 'Directory submission tracking',
		tooltip:
			'Mark launches complete, save listing URLs, and track readiness per directory from My Products.'
	},
	{
		id: 'directory_profile_variants',
		line: 'directory',
		label: 'Profile variants per directory',
		tooltip:
			'Save alternate pitch angles per directory (for example a shorter tagline on one site and a longer story on another) without duplicating the whole business profile.'
	},
	{
		id: 'directory_analytics',
		line: 'directory',
		label: 'Domain rating analytics',
		tooltip:
			'Track domain rating (DR) for your product website plus 7 / 30 / 90 day change on Account → Analytics.'
	},
	{
		id: 'directory_competitor_domains',
		line: 'directory',
		label: 'Competitor domains',
		tooltip:
			'Benchmark competitor domains per workspace in domain rating analytics. Caps are per workspace (for example 2 per workspace × 2 workspaces = 4 total).'
	},
	{
		id: 'directory_catalog_dr',
		line: 'directory',
		label: 'Directory catalog DR',
		tooltip:
			'Editorial domain rating metrics from the Build Backlinks catalog on My Products directory cards — compare directory opportunities before you launch.'
	},
	{
		id: 'community',
		line: 'shared',
		label: 'Community features',
		tooltip: 'Blog comments, and related community surfaces.'
	},
	{
		id: 'dark_light_mode',
		line: 'shared',
		label: 'Dark / light mode',
		tooltip: 'Switch themes based on preference.'
	}
];

export type { PublicFaqItem as PublicPricingFaqItem } from '$lib/content/constants/faq';
export {
	getPublicPricingFaqItems,
	PUBLIC_PRICING_FAQ_ITEM_IDS
} from '$lib/content/constants/faq';
