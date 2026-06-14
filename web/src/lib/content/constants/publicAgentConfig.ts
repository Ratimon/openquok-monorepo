import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';

export type PublicAgentFeatureSection = {
	subtitle: string;
	/** Comma-separated lines; each part gets landing-page gradient styling. */
	title: string;
	description: string;
	/** Optional demo asset under `/landing/` or `/static/`. */
	imageSrc?: string;
	imageAlt?: string;
	/** When true, media renders on the right; otherwise on the left. */
	mediaOnRight?: boolean;
};

export type PublicAgentLandingPage = {
	slug: string;
	/** Catalog identifier used for icons and docs links. */
	agentId: string;
	agentLabel: string;
	icon: IconName;
	heroTitle: string;
	heroDescription: string;
	metaTitle: string;
	metaDescription: string;
	keywords: string[];
	featureSections: PublicAgentFeatureSection[];
	audienceSubtitle: string;
	audienceTitle: string;
	audienceCards: AudienceCard[];
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: PublicFaqItem[];
	/** Setup guide under `/docs/`. */
	docsPath: string;
	/** When false, hub shows a coming-soon badge and detail route 404s. */
	available: boolean;
};

const OPENCLAW_AGENT: PublicAgentLandingPage = {
	slug: 'openclaw',
	agentId: 'openclaw',
	agentLabel: 'OpenClaw',
	icon: icons.OpenClaw.name,
	heroTitle: 'Manage your social media from OpenClaw',
	heroDescription:
		'Install the openquok-core skill on your OpenClaw host so your agent can list integrations, upload media, and schedule posts across every connected channel — while you stay in control of what publishes.',
	metaTitle: 'OpenClaw Social Media Skill for OpenQuok',
	metaDescription:
		'Connect OpenClaw to OpenQuok. Install the openquok-core skill, authenticate the CLI, and let your personal AI agent schedule social posts from WhatsApp, Telegram, Slack, and more.',
	keywords: [
		'OpenClaw social media',
		'OpenClaw skill',
		'openquok-core skill',
		'AI agent social scheduler',
		'OpenClaw CLI posting',
		'agentic social media',
		'OpenQuok OpenClaw integration'
	],
	featureSections: [
		{
			subtitle: 'Install the skill',
			title: 'Add openquok-core in seconds, authenticate once, start scheduling',
			description:
				'Install the skill from the agent package with npx skills add, then authenticate the global @openquok/auto-cli with a programmatic token or OAuth device flow. OpenClaw reads SKILL.md and learns every openquok command your agent needs.',
			imageSrc: '/landing/2-calendar-filters.mp4',
			imageAlt: 'OpenQuok calendar with scheduled posts',
			mediaOnRight: true
		},
		{
			subtitle: 'Post from any chat app',
			title: 'Message OpenClaw from WhatsApp, Telegram, or Slack — it handles the rest',
			description:
				'Ask OpenClaw to draft and schedule a post while you are on the go. The agent discovers your connected channels, uploads media from the host, and queues content on the OpenQuok calendar — no separate scheduler app required.',
			imageSrc: '/landing/3-kanban-filters.mp4',
			imageAlt: 'Kanban view of scheduled social posts',
			mediaOnRight: false
		},
		{
			subtitle: 'Proactive automation',
			title: 'Set heartbeat cron jobs, batch content campaigns, approve before publish',
			description:
				'Use OpenClaw heartbeat tasks to check for new drafts, upload assets, and schedule posts on a recurring cadence. Every post lands in OpenQuok for review so a human stays in the loop before anything goes live.',
			imageSrc: '/landing/5-analytics.mp4',
			imageAlt: 'OpenQuok analytics dashboard',
			mediaOnRight: true
		}
	],
	audienceSubtitle: 'Built for OpenClaw hosts',
	audienceTitle: 'Who connects OpenClaw to OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-emerald-400',
			title: 'Personal AI users',
			description:
				'Run OpenClaw on your machine or in a container and message it from the chat apps you already use. Schedule social posts without opening another dashboard.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-lime-400',
			title: 'Developers & builders',
			description:
				'Install the openquok-core skill in your workspace, wire auth once, and let shell-capable agents call openquok integrations:list and posts:create with structured JSON output.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-rose-400',
			title: 'Solo founders',
			description:
				'Keep a single OpenClaw agent posting across Twitter, LinkedIn, Threads, and more — each workspace isolated so client brands never mix up.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'OpenClaw + OpenQuok, answered',
	faqDescription:
		'Skill install, CLI auth, headless hosts, and how OpenClaw schedules social posts through OpenQuok.',
	faqItems: [
		{
			title: 'How do I install the OpenQuok skill in OpenClaw?',
			description:
				'From your OpenClaw workspace directory, run npx skills add on the agent package root with --skill openquok-core. OpenClaw discovers SKILL.md and loads commands on demand. See the OpenClaw agent guide in Dev Docs for the exact one-line install command.'
		},
		{
			title: 'What CLI commands can OpenClaw run?',
			description:
				'The skill documents openquok integrations:list, integrations:settings, integrations:trigger, posts:create, posts:list, posts:delete, analytics:platform, analytics:post, and upload. Every command returns structured JSON for agents to parse.'
		},
		{
			title: 'How does OpenClaw authenticate with OpenQuok?',
			description:
				'Set OPENQUOK_API_KEY from Account → Settings → Developers → Access, or run openquok auth:login --json for OAuth device flow. On headless hosts, prefer the programmatic token; use --json so the user opens verification_uri_complete on another device.'
		},
		{
			title: 'Can OpenClaw schedule posts with images and video?',
			description:
				'Yes. The agent can call openquok upload or upload-from-url, then pass media IDs into posts:create. Ask the user for a file on the host or a direct https image URL before scheduling media posts.'
		},
		{
			title: 'Does OpenClaw publish immediately or wait for approval?',
			description:
				'Posts created through the CLI land in your OpenQuok workspace. You review drafts on the calendar or kanban and approve what should go live — OpenClaw handles volume, you handle quality.'
		},
		{
			title: 'Can I run OpenClaw on Railway or another host?',
			description:
				'Yes. Mount a persistent workspace volume, set OPENCLAW_WORKSPACE_DIR, install the skill and global CLI in the container shell, then authenticate. Start a new chat session after upgrades so the agent reloads instructions.'
		}
	],
	docsPath: '/docs/agent-guides/openclaw',
	available: true
};

const HERMES_COMING_SOON: PublicAgentLandingPage = {
	slug: 'hermes',
	agentId: 'hermes',
	agentLabel: 'Hermes Agent',
	icon: icons.HermesAgent.name,
	heroTitle: '',
	heroDescription: '',
	metaTitle: 'Hermes Agent Social Scheduler',
	metaDescription:
		'Hermes Agent integration for OpenQuok — schedule social posts from your Hermes workflows. Coming soon.',
	keywords: ['Hermes Agent', 'AI agent social media', 'OpenQuok Hermes'],
	featureSections: [],
	audienceSubtitle: '',
	audienceTitle: '',
	audienceCards: [],
	faqSubtitle: '',
	faqTitle: '',
	faqDescription: '',
	faqItems: [],
	docsPath: '/docs/getting-started-for-cli',
	available: false
};

export const PUBLIC_AGENT_LANDING_PAGES: readonly PublicAgentLandingPage[] = [
	OPENCLAW_AGENT,
	HERMES_COMING_SOON
];

const agentBySlug = new Map(PUBLIC_AGENT_LANDING_PAGES.map((page) => [page.slug, page]));

export function getPublicAgentBySlug(slug: string): PublicAgentLandingPage | undefined {
	const key = slug.trim().toLowerCase();
	return agentBySlug.get(key);
}

export function getAvailablePublicAgentBySlug(slug: string): PublicAgentLandingPage | undefined {
	const page = getPublicAgentBySlug(slug);
	if (!page?.available) return undefined;
	return page;
}

export function listPublicAgentsForHub(): PublicAgentLandingPage[] {
	return [...PUBLIC_AGENT_LANDING_PAGES];
}

export function listAvailablePublicAgents(): PublicAgentLandingPage[] {
	return PUBLIC_AGENT_LANDING_PAGES.filter((page) => page.available);
}
