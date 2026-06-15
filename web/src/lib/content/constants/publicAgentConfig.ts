import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

import type { PublicChannelFeatureBentoId } from '$lib/content/constants/publicChannelFeatureBentoConfig';
import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import type { IphoneMockContentId } from '$lib/ui/templates/device-mocks/iphone-15-pro/iphoneMock.types';
import type { SafariMockContentId } from '$lib/ui/templates/device-mocks/safari/safariMock.types';
import type { TerminalMockContentId } from '$lib/ui/templates/device-mocks/terminal/terminalMock.types';
import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';

export type FeaturesAnimatedContentId = 'llm-models' | 'agent-integrations';

export type FeaturesAnimatedModel = {
	name: string;
	provider: string;
	description: string;
	iconName: IconName;
	iconClass?: string;
	containerClass?: string;
};

export const DEFAULT_LLM_MODELS: FeaturesAnimatedModel[] = [
	{
		name: 'GPT-4o',
		provider: 'OpenAI',
		description:
			'Fast, capable default for agents that need strong reasoning, tool use, and reliable structured output.',
		iconName: icons.ChatGPT.name,
		containerClass: 'bg-neutral-900',
		iconClass: 'size-14 text-white'
	},
	{
		name: 'Claude Sonnet',
		provider: 'Anthropic',
		description:
			'Balanced speed and quality for long conversations, careful drafting, and nuanced instruction following.',
		iconName: icons.Claude.name,
		containerClass: 'bg-[#FCF2EE]',
		iconClass: 'size-14'
	},
	{
		name: 'Gemini Pro',
		provider: 'Google',
		description:
			'Multimodal models with strong performance on mixed text, vision, and high-volume agent workloads.',
		iconName: icons.Gemini.name,
		containerClass: 'bg-white',
		iconClass: 'size-14'
	},
	{
		name: 'Local models',
		provider: 'Ollama & self-hosted',
		description:
			'Run Llama, Mistral, or other open weights on your own hardware with full data control.',
		iconName: icons.Bot.name,
		containerClass: 'bg-primary/10',
		iconClass: 'size-12 text-primary'
	}
];

export const DEFAULT_AGENT_INTEGRATIONS: FeaturesAnimatedModel[] = [
	{
		name: 'Bloom',
		provider: 'The brand layer for agents',
		description:
			'Register Bloom as an OpenClaw MCP server to onboard your brand and generate on-brand images — then schedule approved posts with OpenQuok.',
		iconName: icons.Bloom.name,
		containerClass: 'bg-white',
		iconClass: 'size-14'
	},
	{
		name: 'RevenueCat',
		provider: 'Subscriptions MCP for agents',
		description:
			'Connect the RevenueCat MCP server in OpenClaw to read MRR, trials, and churn — then draft TikTok posts and schedule them on OpenQuok for your review.',
		iconName: icons.RevenueCat.name,
		containerClass: 'bg-white',
		iconClass: 'size-14'
	},
	{
		name: 'Your own skills',
		provider: 'OpenClaw ecosystem',
		description:
			'Install any skill next to openquok-core — analytics, creative pipelines, or custom workflows — and keep humans in the loop on publish.',
		iconName: icons.Sparkles.name,
		containerClass: 'bg-primary/10',
		iconClass: 'size-12 text-primary'
	}
];

export type FeaturesOrderedDeviceMock = 'safari' | 'iphone-15-pro' | 'terminal';

export type FeaturesOrderedStep = {
	id: number;
	title: string;
	content: string;
	mediaSrc?: string;
	mediaAlt?: string;
	animatedContent?: FeaturesAnimatedContentId;
	deviceMock?: FeaturesOrderedDeviceMock;
	deviceMockContent?: SafariMockContentId | IphoneMockContentId | TerminalMockContentId;
	mockUrl?: string;
	iconName: IconName;
};

export type PublicAgentFeatureSection = {
	subtitle: string;
	/** Comma-separated lines; each part gets landing-page gradient styling. */
	title: string;
	description: string;
	/** Optional demo asset under `/landing/` or `/static/`. */
	imageSrc?: string;
	imageAlt?: string;
	/** Interactive bento showcase (takes precedence over `imageSrc`). */
	bentoId?: PublicChannelFeatureBentoId;
	/** Multi-line OpenQuok CLI example rendered below the description. */
	cliCommands?: string;
	/** Heading above `cliCommands` (defaults to “CLI command options”). */
	cliCommandsTitle?: string;
	deviceMock?: FeaturesOrderedDeviceMock;
	deviceMockContent?: SafariMockContentId | IphoneMockContentId | TerminalMockContentId;
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
	setupStepsSubtitle: string;
	setupStepsTitle: string;
	setupSteps: FeaturesOrderedStep[];
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
	heroTitle: 'Schedule social media from OpenClaw you approve',
	heroDescription:
		'Install the openquok-core skill on OpenClaw. Your agent drafts and schedules from any chat app — you review and approve on the calendar or kanban before anything goes live.',
	metaTitle: 'OpenClaw Social Media Skill for OpenQuok',
	metaDescription:
		'Install the openquok-core skill on OpenClaw. Schedule social posts from WhatsApp, Telegram, or Slack and approve every draft on the OpenQuok calendar or kanban before publish.',
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
			subtitle: 'Connect Once',
			title: 'login from your phone, pick your workspace, chat anywhere securely',
			description:
				'Choose a workspace, connect with OAuth2 — approve in your browser, and credentials stay on the host. Message OpenClaw from Telegram, WhatsApp, or Slack to draft and schedule without opening another app.',
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'openquok-login',
			imageAlt: 'OpenClaw chat guiding OpenQuok OAuth device login and workspace authorization',
			mediaOnRight: true,
			cliCommandsTitle: 'CLI authentication options',
			cliCommands: `# OAuth2 device flow (interactive — opens browser)
openquok auth:login
openquok auth:status`
		},
		{
			subtitle: 'Kanban + smart filters',
			title: 'Review every AI draft, sign off confidently, before it goes live',
			description:
				'Chat, move agent-generated posts from draft to review to scheduled on a kanban board—with the same smart filters as your calendar. Approve quality at scale instead of trusting autopilot.',
			bentoId: 'facebook-bulk-scheduling',
			mediaOnRight: false,
			cliCommandsTitle: 'CLI command options',
			cliCommands: `# Draft + human checklist
openquok posts:create -c "…" -s "…" -t draft -i "<uuid>" --note "Check CTA before schedule"

openquok posts:review-todo <post-id> --note "…"
openquok posts:status <post-id> --status draft
openquok posts:status <post-id> -s schedule`
		},
		{
			subtitle: 'Analytics',
			title: 'Ask what worked, see winners, and adapt from chat',
			description:
				'Message OpenClaw on Telegram to pull impressions, likes, comments, and shares for any connected channel. Compare performance over 7, 30, or 90 days and schedule more of what already resonates — without opening the dashboard.',
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'telegram-analytics',
			imageAlt: 'OpenClaw Telegram chat showing OpenQuok platform and post analytics',
			mediaOnRight: true,
			cliCommandsTitle: 'CLI analytics options',
			cliCommands: `# Platform metrics (followers, impressions, engagement)
openquok analytics:platform <integration-uuid> -d 30

# Per-post insights (likes, comments, shares)
openquok analytics:post <post-id> -d 7`
		}
	],
	setupStepsSubtitle: 'How it works',
	setupStepsTitle: 'Five steps,to OpenClaw + OpenQuok',
	setupSteps: [
		{
			id: 1,
			title: '1. Install OpenClaw',
			content: 'Go to official site and install locally, in a container, or on a host with a persistent workspace.',
			mediaAlt: 'OpenClaw documentation overview at docs.openclaw.ai',
			deviceMock: 'safari',
			deviceMockContent: 'openclaw-docs-overview',
			mockUrl: 'docs.openclaw.ai',
			iconName: icons.Terminal.name
		},
		{
			id: 2,
			title: '2. Select model',
			content: 'Choose the LLM provider and model OpenClaw should use.',
			animatedContent: 'llm-models',
			mediaAlt: 'Model selection in OpenClaw',
			iconName: icons.Bot.name
		},
		{
			id: 3,
			title: '3. Configure chat channel',
			content: 'Connect WhatsApp, Telegram, Slack, or another chat app you already use.',
			mediaAlt: 'Telegram chat channel configuration for OpenClaw',
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'telegram-connect',
			iconName: icons.MessageCircle.name
		},
		{
			id: 4,
			title: '4. Install OpenQuok skill',
			content: 'Add openquok-core skill and authenticate the CLI once.',
			mediaAlt: 'Install openquok-core skill and authenticate the OpenQuok CLI',
			deviceMock: 'terminal',
			deviceMockContent: 'openquok-skill-install',
			iconName: icons.OpenQuok.name
		},
		{
			id: 5,
			title: '5. Integrate & customize other skills',
			content:
				'Add Bloom, RevenueCat, or any OpenClaw skill beside openquok-core — find your own viral formats and scale!',
			animatedContent: 'agent-integrations',
			mediaAlt: 'Agent skills and integrations with OpenQuok',
			iconName: icons.Sparkles.name
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
				'Fully open source — add openquok-core plus any other skills you want, and let OpenClaw schedule posts with structured JSON.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-rose-400',
			title: 'Startup founders',
			description:
				'Our model-agnostic approach keeps your stack lean and flexible — pick the agent and model that fit today, swap when you need to, and schedule across every channel from one workspace.',
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
	setupStepsSubtitle: '',
	setupStepsTitle: '',
	setupSteps: [],
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
