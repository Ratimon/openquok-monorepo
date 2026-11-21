/**
 * `/social-media-management` programmatic landing config only.
 *
 * Not the home page (`/`) — home feature copy lives in `CONFIG_SCHEMA_LANDING_PAGE` and CMS `landing_page`.
 */
import { icons } from '$data/icons';
import type { IconName } from '$data/icons';

import { getRootPathPublicAlternativesTarget } from '$lib/area-public/constants/getRootPathPublicAlternatives';
import { getRootPathPublicSocialAutopilotLanding } from '$lib/area-public/constants/getRootPathPublicSocialAutopilotLanding';
import { PUBLIC_SOCIAL_AUTOPILOT_LANDING_FAQ_SECTION } from '$lib/content/constants/faq/marketing/social-autopilot';
import type { PublicMarketingLandingFaqSection } from '$lib/content/constants/faq/marketing/types';
import { PUBLIC_LANDING_HERO_TRIAL_CTA } from '$lib/content/constants/landing/hero-copy';
import { faqHrefComparePair, publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import type { PublicLandingHeroStatBadge } from '$lib/content/constants/marketing/publicLandingHeroStatBadges';
import { route } from '$lib/utils/path';

const CARD_CONTAINER_CLASS = 'h-full min-h-[18rem]';
const connectChannelsDocsHref = publicFaqHref.connectChannelsGuide;
const agentsHubHref = publicFaqHref.agents;
const publicLandingPath = route(getRootPathPublicSocialAutopilotLanding());

export type PublicSocialAutopilotCta = {
	label: string;
	href: string;
};

export type PublicSocialAutopilotSectionHeader = {
	subtitle: string;
	title: string;
	description: string;
};

export type PublicSocialAutopilotLinkCardItem = {
	id: string;
	title: string;
	description: string;
	href: string;
	ctaLabel: string;
	iconName: IconName;
};

/** Mirrors home `FEATURE_9` parallel scale block (copy duplicated from landing schema defaults). */
export type PublicSocialAutopilotParallelScaleSection = PublicSocialAutopilotSectionHeader & {
	cliCommandsTitle: string;
	cliCommands: string;
};

/** Nine product feature heroes (copy duplicated from `CONFIG_SCHEMA_LANDING_PAGE` FEATURE_* defaults). */
export type SocialAutopilotProductFeatureSectionsConfig = {
	feature1: PublicSocialAutopilotSectionHeader;
	feature2: PublicSocialAutopilotSectionHeader;
	feature3: PublicSocialAutopilotSectionHeader;
	feature4: PublicSocialAutopilotSectionHeader;
	feature5: PublicSocialAutopilotSectionHeader;
	feature6: PublicSocialAutopilotSectionHeader;
	feature7: PublicSocialAutopilotSectionHeader;
	feature8: PublicSocialAutopilotSectionHeader;
	feature9ParallelScale: PublicSocialAutopilotParallelScaleSection;
};

export type PublicSocialAutopilotProductFeatureSections =
	SocialAutopilotProductFeatureSectionsConfig;

export type PublicSocialAutopilotLandingConfig = {
	metaTitle: string;
	metaDescription: string;
	keywords: readonly string[];
	hero: PublicSocialAutopilotSectionHeader & {
		primaryCta: PublicSocialAutopilotCta;
		secondaryCta: PublicSocialAutopilotCta;
	};
	heroStatBadges: readonly PublicLandingHeroStatBadge[];
	whoIsFor: {
		audienceSubtitle: string;
		audienceTitle: string;
		audienceCards: readonly AudienceCard[];
	};
	productFeatureSections: PublicSocialAutopilotProductFeatureSections;
	featuresGridSection: PublicSocialAutopilotSectionHeader;
	relatedLinksSection: PublicSocialAutopilotSectionHeader & {
		items: readonly PublicSocialAutopilotLinkCardItem[];
	};
	faqSection: PublicMarketingLandingFaqSection;
	docsBanner: {
		title: string;
		description: string;
		cta: PublicSocialAutopilotCta;
	};
	softwareApplication: {
		name: string;
		featureList: readonly string[];
		docsPath: string;
	};
};

export const PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG: PublicSocialAutopilotLandingConfig = {
	metaTitle: 'Agentic Social Media Scheduler',
	metaDescription:
		'OpenQuok is the agentic social media scheduler: AI agents plan, draft, and queue posts across your connected channels. You approve every draft on one visual calendar before publish. Use MCP, CLI, and API like Postiz-class self-host stacks — with human review built in.',
	keywords: [
		'agentic social media scheduler',
		'agentic social media scheduling platform',
		'social media scheduling platform',
		'social media management',
		'social media scheduler',
		'AI social media scheduler',
		'visual calendar social media',
		'social media automation with approval',
		'cross-posting scheduler',
		'Grok Bot social scheduling',
		'MCP social media scheduling',
		'openquok CLI schedule posts',
		'Facebook scheduling agent',
		'social media calendar approval'
	],
	hero: {
		subtitle: 'Social media scheduler',
		// Line 1: query-shaped H1. Line 2: `agenthost` → icon + rotating labels (`LANDING_HERO_SOCIAL_AGENT_ROTATE_OPTIONS`).
		title: 'Agentic social media scheduler\nRun on autopilot with agenthost',
		description:
			'Agentic social media scheduler for your connected channels: AI agents plan, draft, and queue posts — you review every draft on one visual calendar before anything goes live. Grok Bot, OpenClaw, Hermes, Cursor, Claude. CLI, MCP, API.',
		primaryCta: {
			label: PUBLIC_LANDING_HERO_TRIAL_CTA,
			href: publicFaqHref.signUp
		},
		secondaryCta: {
			label: 'Browse agent integrations',
			href: agentsHubHref
		}
	},
	heroStatBadges: [
		{
			id: 'agent-workspaces',
			value: 'Agent workspaces',
			label: 'Chat to every channel'
		},
		{
			id: 'workspace',
			value: 'Team seats',
			label: 'Roles and invites'
		},
		{
			id: 'per-network',
			value: 'One draft',
			label: 'Per-network tweaks'
		},
		{
			id: 'plugs',
			value: 'Wider reach',
			label: 'Cross-account plugs'
		},
		{
			id: 'calendar',
			value: 'Plan ahead',
			label: 'Calendar and filters'
		},
		{
			id: 'kanban',
			value: 'You approve',
			label: 'Kanban review'
		},
		{
			id: 'media',
			value: 'Media library',
			label: 'Workspace files'
		},
		{
			id: 'analytics',
			value: 'See winners',
			label: 'Built-in analytics'
		}
	],
	whoIsFor: {
		audienceSubtitle: 'Teams that want agentic scheduling without losing control',
		audienceTitle: 'Who uses an agentic social media scheduler with approval?',
		audienceCards: [
			{
				iconName: icons.CustomizedDrawnLaptop.name,
				iconClass: 'text-sky-400',
				title: 'Solo founders',
				description:
					'You message Grok Bot or an MCP client from your phone or IDE. OpenQuok turns chat into scheduled drafts you approve once per day.',
				containerClass: CARD_CONTAINER_CLASS
			},
			{
				iconName: icons.Users.name,
				iconClass: 'text-emerald-400',
				title: 'Marketing teams',
				description:
					'Writers and agents propose copy. Editors approve on the shared calendar. No mystery posts from automation.',
				containerClass: CARD_CONTAINER_CLASS
			},
			{
				iconName: icons.CustomizedDrawnHouse.name,
				iconClass: 'text-amber-400',
				title: 'Developers and ops',
				description:
					'You wire CI or backends with the public API and SDK. Agents use MCP tools. Humans still own the publish click.',
				containerClass: CARD_CONTAINER_CLASS
			}
		]
	},
	productFeatureSections: {
		feature1: {
			subtitle: 'Agent workspaces and MCP',
			title: 'Can I schedule from Grok Bot and other agent hosts?',
			description:
				'Give each brand, client, or agent its own workspace with isolated channels. Reach your agents from Telegram or other chat apps (ChatGPT, Claude, Openclaw, etc.), then run dozens of social channels without one shared context — or your AI mixing up workflows.'
		},
		feature2: {
			subtitle: 'Workspaces, roles, and invites',
			title: 'Invite by email, assign Member, manage seats by Admin',
			description:
				'Invite teammates by email and assign Member. Each workspace keeps its own channels, posts, and seats.'
		},
		feature3: {
			subtitle: 'Global vs Per-network modes',
			title: 'One draft, then craft with per-platform settings, quickly',
			description:
				'Write once in global mode, then customize any connected account — Facebook link previews, Threads replies, Instagram post types, and more — without losing your shared copy.'
		},
		feature4: {
			subtitle: 'Cross-account & Internal & Global plugs',
			title:
				'Widen reach on Threads, X, and LinkedIn, comment or repost with plugs, after publish',
			description:
				'Internal plugs run after your main post goes live — separate from same-account follow-up replies in the composer. On Threads, another profile can comment; on X, another profile can repost; on LinkedIn, another profile can comment or reshare.'
		},
		feature5: {
			subtitle: 'Calendar + smart filters',
			title: 'Plan weeks ahead, find any post effortlessly',
			description:
				'Day, week, month, and list views plus filters by platform, channel group, or colored tags. Switch to list for deep history or far-out dates, then schedule ahead without scrolling an endless AI queue.'
		},
		feature6: {
			subtitle: 'Kanban review',
			title: 'Do agents post without your approval?',
			description:
				'Move/Drag draft cards to schedule or publish, filter by tag, channel group, platform, agent source, or review to-do. Approve quality at scale instead of trusting autopilot.'
		},
		feature7: {
			subtitle: 'File manager',
			title: 'Organize media, keep assets separated, find footages efficiently',
			description:
				'Create, rename, and manage files in each agent workspace cloud storage. Keep client assets, B-roll, and uploads separated so posting stays fast when you run many accounts.'
		},
		feature8: {
			subtitle: 'Built-in analytics',
			title: 'Track engagement, see winners, and adapt correctly',
			description:
				'Track impressions, likes, comments, shares, and engagement in one place. Compare performance by platform and channel, and improve the posts you approved.'
		},
		feature9ParallelScale: {
			subtitle: 'Scale what works',
			title: 'when a format hits, scale by adding workspaces and parallel sessions',
			description:
				'Spot a winner in analytics, then clone more dedicated workspaces for the next brand while parallel sessions queue the next wave and track performance — channels, and agent context stay isolated as you scale.',
			cliCommandsTitle: 'Parallel CLI sessions',
			cliCommands: `# Session A — draft + schedule
openquok posts:create -c "…" -s "…" -t draft -i "<uuid>"
openquok posts:status <post-id> -s schedule

# Session B — metrics (runs at the same time)
openquok analytics:platform <integration-uuid> -d 7
openquok analytics:post <post-id> -d 30`
		}
	},
	featuresGridSection: {
		subtitle: 'Supported channels',
		title: 'Which social networks can you schedule?',
		description:
			'Connect the networks you publish to and manage them from one workspace — no switching tools per platform.'
	},
	relatedLinksSection: {
		subtitle: 'Compare and self-host',
		title: 'Postiz, Mixpost, Buffer, and scheduling APIs',
		description:
			'OpenQuok is an approval-first agentic scheduler. Open these guides when you compare Postiz-class self-host stacks, hosted Buffer-style plans, or wire agents through MCP and the public API.',
		items: [
			{
				id: 'compare-openquok-postiz',
				title: 'OpenQuok vs Postiz',
				description:
					'Cloud trial versus AGPL self-host, MCP tools, workspace limits, and human approval before publish.',
				href: publicFaqHref.compareOpenquokPostiz,
				ctaLabel: 'Read comparison →',
				iconName: icons.Columns2.name
			},
			{
				id: 'alternatives-postiz',
				title: 'Postiz alternatives',
				description: 'Ranked open-source and hosted schedulers when Postiz is on your shortlist.',
				href: route(getRootPathPublicAlternativesTarget('postiz')),
				ctaLabel: 'View alternatives →',
				iconName: icons.Grid3x3.name
			},
			{
				id: 'compare-mixpost-postiz',
				title: 'Mixpost vs Postiz',
				description: 'Two Laravel-based self-host stacks — pricing, channels, and operator trade-offs.',
				href: publicFaqHref.compareMixpostPostiz,
				ctaLabel: 'Read comparison →',
				iconName: icons.Columns2.name
			},
			{
				id: 'compare-postiz-mixpost',
				title: 'Postiz vs Mixpost',
				description: 'Same pairing from the Postiz side when you already run or evaluate Postiz.',
				href: faqHrefComparePair('postiz', 'mixpost'),
				ctaLabel: 'Read comparison →',
				iconName: icons.Columns2.name
			},
			{
				id: 'alternatives-buffer',
				title: 'Buffer alternatives',
				description: 'Hosted schedulers and self-host options when Buffer caps or pricing stall you.',
				href: route(getRootPathPublicAlternativesTarget('buffer')),
				ctaLabel: 'View alternatives →',
				iconName: icons.Grid3x3.name
			},
			{
				id: 'compare-openquok-buffer',
				title: 'OpenQuok vs Buffer',
				description: 'Approval queues, agent hosts, and plan limits beside Buffer’s hosted tiers.',
				href: publicFaqHref.compareOpenquokBuffer,
				ctaLabel: 'Read comparison →',
				iconName: icons.Columns2.name
			},
			{
				id: 'alternatives-recurpost',
				title: 'RecurPost alternatives',
				description: 'Ranked picks when you outgrow RecurPost or want more channels and agent tooling.',
				href: route(getRootPathPublicAlternativesTarget('recurpost')),
				ctaLabel: 'View alternatives →',
				iconName: icons.Grid3x3.name
			},
			{
				id: 'compare-hub',
				title: 'Compare hub',
				description: 'Side-by-side tables for schedulers, directory tools, and OpenQuok pairs.',
				href: publicFaqHref.compare,
				ctaLabel: 'Browse comparisons →',
				iconName: icons.List.name
			},
			{
				id: 'alternatives-openquok',
				title: 'OpenQuok alternatives',
				description: 'See how other schedulers and launch tools compare when OpenQuok is your baseline.',
				href: route(getRootPathPublicAlternativesTarget('openquok')),
				ctaLabel: 'View alternatives →',
				iconName: icons.Grid3x3.name
			},
			{
				id: 'scheduling-api',
				title: 'Social Media Scheduling API',
				description: 'Schedule posts with API keys, webhooks, and the Node SDK from your backend.',
				href: publicFaqHref.socialMediaSchedulingApi,
				ctaLabel: 'Open API hub →',
				iconName: icons.Code.name
			},
			{
				id: 'agents-hub',
				title: 'Agent and MCP integrations',
				description: 'Grok Bot, Cursor, Claude, and MCP clients that call schedulePostTool on your workspace.',
				href: publicFaqHref.agents,
				ctaLabel: 'Browse agents →',
				iconName: icons.Bot.name
			},
			{
				id: 'self-hosting',
				title: 'Self-host OpenQuok',
				description: 'Docker Compose, device login for agents, and workspace data on your own infrastructure.',
				href: publicFaqHref.selfHostingLanding,
				ctaLabel: 'View self-host guide →',
				iconName: icons.BookOpenCheck.name
			}
		]
	},
	faqSection: PUBLIC_SOCIAL_AUTOPILOT_LANDING_FAQ_SECTION,
	docsBanner: {
		title: 'Connect channels and wire your first agent',
		description:
			'Add Facebook, Threads, or X in the workspace. Then pick an agent host or MCP client from the setup guides.',
		cta: {
			label: 'Open Connect channel docs',
			href: connectChannelsDocsHref
		}
	},
	softwareApplication: {
		name: 'OpenQuok Social Scheduling',
		docsPath: connectChannelsDocsHref,
		featureList: [
			'Human approval before publish',
			'Agent hosts including Grok Bot and OpenClaw',
			'MCP tools such as schedulePostTool and integrationList',
			'openquok CLI for terminal scheduling',
			'Social Media Scheduling API and Node SDK',
			'Multi-channel calendar and review queues',
			'Facebook, Instagram, Threads, X, LinkedIn, YouTube, TikTok, and Bluesky'
		]
	}
};

/** Canonical path segment for SEO loads (`customSlug`). */
export const PUBLIC_SOCIAL_AUTOPILOT_LANDING_SLUG = getRootPathPublicSocialAutopilotLanding();

/** Resolved root-relative path (`/social-media-management`). */
export const PUBLIC_SOCIAL_AUTOPILOT_LANDING_PATH = publicLandingPath;
