import {
	faqHrefDocs,
	faqLink,
	OPENQUOK_GITHUB_REPO_HREF,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';

export type PublicFaqItemId =
	| 'switch-from-buffer-hootsuite'
	| 'try-free'
	| 'self-host-openquok'
	| 'schedule-posts'
	| 'agent-workspace'
	| 'multi-workspace'
	| 'oauth-app-counts'
	| 'ai-writer-summarizer'
	| 'refund'
	| 'change-plans'
	| 'cloud-billing'
	| 'agent-host-vs-mcp-billing'
	| 'what-is-mcp'
	| 'mcp-oauth-app'
	| 'what-is-channel'
	| 'duplicate-platform-channels'
	| 'team-members'
	| 'reach-official-api'
	| 'repeated-posts'
	| 'templates'
	| 'signatures'
	| 'analytics'
	| 'schedule-comments-threads'
	| 'what-are-plugs'
	| 'plugs-platform-support'
	| 'delay-between-posts'
	| 'too-many-channels';

export type PublicFaqItem = {
	/** Set on git defaults; CMS overrides may omit. */
	id?: PublicFaqItemId;
	title: string;
	description: string;
};

export { OPENQUOK_GITHUB_REPO_HREF };

/**
 * `/pricing` FAQ — billing, limits, and plan features only.
 * Order is display order; copy always comes from {@link PUBLIC_FAQ_ITEMS}.
 */
export const PUBLIC_PRICING_FAQ_ITEM_IDS: readonly PublicFaqItemId[] = [
	'try-free',
	'self-host-openquok',
	'agent-workspace',
	'multi-workspace',
	'oauth-app-counts',
	'ai-writer-summarizer',
	'what-is-channel',
	'duplicate-platform-channels',
	'team-members',
	'refund',
	'change-plans',
	'cloud-billing',
	'agent-host-vs-mcp-billing',
	'templates',
	'signatures',
	'analytics',
	'repeated-posts',
	'what-are-plugs',
	'too-many-channels'
];

/** Default Q&A copy when `public_faq.ITEMS` is missing from stored config. */
export const PUBLIC_FAQ_ITEMS: readonly PublicFaqItem[] = [
	{
		id: 'switch-from-buffer-hootsuite',
		title: 'Why switch from Buffer or Hootsuite?',
		description:
			`Buffer and Hootsuite charge $75–$200/month for enterprise feature most teams never use. OpenQuok covers the same UI scheduling basics including connect channels, compose, calendar, multi-channel publish. We also cover agent-first features like workspaces, integrations, and API/CLI access. Same workflow when you post by hand; built for when agents do the work. Less cost, less clutter, and real support from Meta and OpenQuok team. See ${faqLink(publicFaqHref.compareOpenquokBuffer, 'OpenQuok vs Buffer')} and the ${faqLink(publicFaqHref.blogBufferAlternatives, 'Buffer alternatives guide')}.`
	},
	{
		id: 'try-free',
		title: 'Can I try OpenQuok for free?',
		description:
			`Yes. OpenQuok offers one 7-day free trial per payment customer so you can run social media accounts on auto-pilot before you subscribe the plan. Create an account and start today — no credit card required. Canceling and resubscribing, or creating another workspace, does not grant a second trial. Plan limits are on ${faqLink(publicFaqHref.pricing, 'Pricing')} and in the ${faqLink(publicFaqHref.billingLimits, 'billing limits guide')}; trial rules are in the ${faqLink(publicFaqHref.cloudTrial, 'Cloud trial guide')}.`
	},
	{
		id: 'self-host-openquok',
		title: 'Can I self-host OpenQuok?',
		description:
			`Yes. OpenQuok is a ${faqLink(publicFaqHref.selfHostingLanding, 'free alternative social media scheduler')} — ${faqLink(OPENQUOK_GITHUB_REPO_HREF, 'open source on GitHub')} with no software fee when you operate it yourself. Pick your path: ${faqLink(publicFaqHref.cloud, 'hosted cloud plan')}, ${faqLink(publicFaqHref.dockerCompose, 'Docker Compose self-host')}, or ${faqLink(publicFaqHref.productionDeployment, 'production deployment on your own cloud')}. ${faqLink(publicFaqHref.cloud, 'OpenQuok Cloud')} uses ${faqLink(publicFaqHref.billing, 'Stripe billing')}; operator paths do not. For CLI device login without API keys on the agent host, see the ${faqLink(publicFaqHref.blogSelfHost, 'CLI device-login walkthrough')}.`
	},
	{
		id: 'schedule-posts',
		title: 'How do I schedule social media posts with OpenQuok?',
		description:
			`${faqLink(publicFaqHref.connectChannelsGuide, 'Connect channels')}, write in ${faqLink(publicFaqHref.docsCreatingPosts, 'Creating posts')}, then pick a time on the ${faqLink(publicFaqHref.docsCalendar, 'calendar')} or ${faqLink(publicFaqHref.docsKanban, 'kanban')}. Agents can use the ${faqLink(publicFaqHref.cliGettingStarted, 'CLI')}, ${faqLink(publicFaqHref.agentSetupGuides, 'agent setup guides')}, or ${faqLink(publicFaqHref.mcpSetupGuides, 'MCP setup guides')}.`
	},
	{
		id: 'agent-workspace',
		title: 'What is the agent workspace?',
		description:
			`A workspace holds your channels, posts, and team in one place. Use separate workspaces for different brands or clients. See the ${faqLink(publicFaqHref.docsGlossary, 'Glossary')}. Limits are on ${faqLink(publicFaqHref.pricing, 'Pricing')} and ${faqLink(publicFaqHref.billingLimits, 'billing limits')}. Agent hosts: ${faqLink(publicFaqHref.agents, 'Agents')}.`
	},
	{
		id: 'multi-workspace',
		title: "Why should I use OpenQuok's multi-workspace?",
		description:
			`Use one workspace per client or brand. Each workspace keeps its own channels and sign-in details separate. That lowers the risk that an AI agent hallucinates posts to the wrong account. See ${faqLink(publicFaqHref.pricing, 'plan workspace counts')}, ${faqLink(publicFaqHref.billingLimits, 'billing limits')}, and ${faqLink(publicFaqHref.compare, 'how we compare')}.`
	},
	{
		id: 'oauth-app-counts',
		title: 'What do OAuth app counts on pricing plans mean?',
		description:
			`Each workspace has one OAuth app. The count matches your plan — see ${faqLink(publicFaqHref.pricing, 'pricing plans')} and ${faqLink(publicFaqHref.billingLimits, 'billing limits')}. Need another app? Add a workspace. Register under ${faqLink(publicFaqHref.docsDevelopers, 'Developers')} or ${faqLink(publicFaqHref.oauthApps, 'OAuth2 for apps')}.`
	},
	{
		id: 'ai-writer-summarizer',
		title: 'What are Unlimited AI Writer and AI Summarizer?',
		description:
			`They draft or shorten captions in your browser on supported Chromium builds. Text stays on your device. The feature is experimental. See ${faqLink(publicFaqHref.docsAiGeneration, 'AI generation in the composer')}.`
	},
	{
		id: 'refund',
		title: 'Can I get a refund?',
		description:
			`Within 7 days of payment, you can request a refund if you have not used the product during that billing period. Email support from your account email with your workspace name and billing date. If you have used the product during that period, contact support and we will work with you on a fair resolution. Full details are in the ${faqLink(faqHrefDocs('billing/refunds-and-support'), 'Refunds and support')} guide and the ${faqLink(publicFaqHref.billing, 'billing overview')}. Self-hosted deployments follow your own billing policies.`
	},
	{
		id: 'change-plans',
		title: 'Can I change plans later?',
		description:
			`Yes. Upgrade or downgrade from account billing settings. Proration and timing follow your Stripe subscription when cloud billing is enabled. Read ${faqLink(publicFaqHref.billingSubscription, 'Subscription')} and ${faqLink(publicFaqHref.billingDowngrades, 'Downgrades')} before you shrink a plan. Current tiers are on ${faqLink(publicFaqHref.pricing, 'Pricing')}.`
	},
	{
		id: 'cloud-billing',
		title: 'Where do I manage OpenQuok Cloud billing?',
		description:
			`Workspace owners open <a href="/account/billing">Billing</a> from the account menu. The ${faqLink(publicFaqHref.billing, 'billing guide')} covers ${faqLink(publicFaqHref.billingSubscription, 'subscriptions')}, ${faqLink(publicFaqHref.billingLimits, 'limits')}, downgrades, promotion codes, and refunds. Compare hosted OpenQuok with self-host in ${faqLink(publicFaqHref.cloud, 'OpenQuok Cloud')}.`
	},
	{
		id: 'agent-host-vs-mcp-billing',
		title: 'How do I pay for agent hosts vs MCP clients?',
		description:
			`OpenQuok bills separately from your LLM and from agent host fees. OpenQuok covers workspaces and scheduling. See ${faqLink(publicFaqHref.agentSetupGuides, 'agent setup guides')} and ${faqLink(publicFaqHref.mcpSetupGuides, 'MCP setup guides')}.`
	},
	{
		id: 'what-is-mcp',
		title: 'What is MCP and how does OpenQuok use it?',
		description:
			`MCP (Model Context Protocol) lets AI assistants connect to the tools you use. Connect OpenQuok in your MCP client and your agent can list channels, read platform rules, and schedule posts without opening the dashboard. Start with ${faqLink(publicFaqHref.mcpGettingStarted, 'MCP getting started')} or a ${faqLink(publicFaqHref.mcpSetupGuides, 'MCP setup guide')}.`
	},
	{
		id: 'mcp-oauth-app',
		title: 'How does MCP relate to my OAuth app?',
		description:
			`Each workspace has one MCP endpoint. It uses the same token as the ${faqLink(publicFaqHref.publicApi, 'Public API')}. Create the app under ${faqLink(publicFaqHref.docsDevelopers, 'Developers')}, then follow ${faqLink(publicFaqHref.oauthApps, 'OAuth2 for apps')} and ${faqLink(publicFaqHref.mcpSetupGuides, 'MCP setup')}.`
	},
	{
		id: 'what-is-channel',
		title: 'What counts as a channel?',
		description:
			`A channel is one connected social account (Facebook, Instagram, LinkedIn, TikTok, YouTube, Threads, and more). ${faqLink(publicFaqHref.connectChannelsGuide, 'Connect channels')} in the dashboard. Browse networks on ${faqLink(publicFaqHref.channels, 'Supported channels')}.`
	},
	{
		id: 'duplicate-platform-channels',
		title: 'Can I connect 2 channels to the same platform?',
		description:
			`Yes. Example: SOLO plan can connect 15 total accounts, all of them can be tiktok accounts. Totals are on ${faqLink(publicFaqHref.pricing, 'Pricing')} and in ${faqLink(publicFaqHref.billingLimits, 'billing limits')}.`
	},
	{
		id: 'team-members',
		title: 'How does team member work?',
		description:
			`You invite people to a workspace. They can draft and schedule within your plan seat limit. See ${faqLink(publicFaqHref.docsTeam, 'Team')} and ${faqLink(publicFaqHref.billingLimits, 'billing limits')}.`
	},
	{
		id: 'reach-official-api',
		title: 'Will my post get less reach or banned if I use multi-channel publishing with OpenQuok?',
		description:
			`No. OpenQuok publishes through each network’s official API. Reach should match posting in the native app. See ${faqLink(publicFaqHref.docsConnectRules, 'Connect rules')}.`
	},
	{
		id: 'repeated-posts',
		title: 'How does repeated posts work',
		description:
			`Set a repeat cadence on a post. OpenQuok schedules the next run after each publish. See ${faqLink(publicFaqHref.docsSchedulingRepeat, 'Repeating a post')} and ${faqLink(publicFaqHref.docsKanban, 'Kanban')}. Agents: ${faqLink(publicFaqHref.cliManagingPosts, 'CLI post commands')}.`
	},
	{
		id: 'templates',
		title: 'What are reusable templates and how does it work?',
		description:
			`Templates save your usual channels, captions, and media as a preset. Pick one when you start a post. See ${faqLink(publicFaqHref.docsTemplates, 'Templates')}.`
	},
	{
		id: 'signatures',
		title: 'What are reusable signatures and how does it work?',
		description:
			`Signatures are reusable sign-offs (hashtags, links, promos) you insert from the composer. See ${faqLink(publicFaqHref.docsSignatures, 'Signatures')}.`
	},
	{
		id: 'analytics',
		title: 'What analytics does OpenQuok offer?',
		description:
			`Track impressions, engagement, and trends per post and workspace. See ${faqLink(publicFaqHref.docsInsights, 'Insights')}, the ${faqLink(publicFaqHref.cliAnalytics, 'analytics CLI')}, or ${faqLink(publicFaqHref.mcpSetupGuides, 'MCP')}.`
	},
	{
		id: 'schedule-comments-threads',
		title: 'Can I schedule comments or threads',
		description:
			`Yes. Add follow-up rows with optional delays in the composer. See ${faqLink(publicFaqHref.docsThreadsComments, 'Threads and comments')}.`
	},
	{
		id: 'what-are-plugs',
		title: 'What are OpenQuok plugs?',
		description:
			`Plugs run automated steps after a post goes live. They do not change your caption. See the ${faqLink(faqHrefDocs('automations/plugs'), 'Plugs overview')}.`
	},
	{
		id: 'plugs-platform-support',
		title: 'Which social platforms support plugs?',
		description:
			`Support varies by network and plug type. See the table in the ${faqLink(faqHrefDocs('automations/plugs'), 'Plugs overview')}.`
	},
	{
		id: 'delay-between-posts',
		title: 'What is the delay feature between posts?',
		description:
			`Set a delay on each follow-up row so parts publish minutes or hours apart. See ${faqLink(publicFaqHref.docsThreadsComments, 'Threads and comments')}.`
	},
	{
		id: 'too-many-channels',
		title: 'I have connnected too many channels, what should I do?',
		description:
			`Group channels by client or brand, or disable ones you do not need. See ${faqLink(publicFaqHref.docsChannelGroups, 'Channel groups')} and ${faqLink(publicFaqHref.docsManageChannels, 'Manage channels')}. API: ${faqLink(publicFaqHref.channelGroups, 'channel groups')}.`
	}
];

const PUBLIC_FAQ_ITEM_BY_ID = Object.fromEntries(
	PUBLIC_FAQ_ITEMS.map((item) => [item.id, item])
) as Record<PublicFaqItemId, PublicFaqItem>;

export function resolvePublicFaqItemsByIds(ids: readonly PublicFaqItemId[]): PublicFaqItem[] {
	return ids
		.map((id) => PUBLIC_FAQ_ITEM_BY_ID[id])
		.filter((item): item is PublicFaqItem => item != null);
}

/** Curated `/pricing` FAQ — same copy as {@link PUBLIC_FAQ_ITEMS}, billing and plan features only. */
export function getPublicPricingFaqItems(): PublicFaqItem[] {
	return resolvePublicFaqItemsByIds(PUBLIC_PRICING_FAQ_ITEM_IDS);
}

export type PublicFaqConfigItem = {
	question: string;
	answer: string;
};

export function getDefaultPublicFaqConfigItems(): PublicFaqConfigItem[] {
	return PUBLIC_FAQ_ITEMS.map(({ title, description }) => ({
		question: title,
		answer: description
	}));
}
