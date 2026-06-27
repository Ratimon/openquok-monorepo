import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

import type { PublicChannelFeatureBentoId } from '$lib/content/constants/publicChannelFeatureBentoConfig';
import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import type { DesktopMockContentId } from '$lib/ui/templates/device-mocks/desktop/desktopMock.types';
import type { IphoneMockContentId } from '$lib/ui/templates/device-mocks/iphone-15-pro/iphoneMock.types';
import type { SafariMockContentId } from '$lib/ui/templates/device-mocks/safari/safariMock.types';
import type { SettingsPanelMockContentId } from '$lib/ui/templates/device-mocks/settings-panel/settingsPanelMock.types';
import type { TerminalMockContentId } from '$lib/ui/templates/device-mocks/terminal/terminalMock.types';
import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import type {
	OpenquokCliCommandReferenceItem,
	SkillInstallOption
} from '$lib/content/constants/openquokCliCommandReference';
import {
	HERMES_SKILL_INSTALL_OPTIONS,
	OPENCLAW_SKILL_INSTALL_OPTIONS,
	OPENQUOK_CLI_COMMAND_REFERENCE
} from '$lib/content/constants/openquokCliCommandReference';
import type { ComparisonPoint } from '$lib/ui/templates/WithWithout.svelte';
import type { ComparePoint } from '$lib/ui/templates/Compare.svelte';

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

export type FeaturesOrderedDeviceMock =
	| 'safari'
	| 'iphone-15-pro'
	| 'terminal'
	| 'settings-panel'
	| 'desktop';

export type FeaturesOrderedStep = {
	id: number;
	title: string;
	content: string;
	mediaSrc?: string;
	mediaAlt?: string;
	animatedContent?: FeaturesAnimatedContentId;
	/** Overrides default carousel models when `animatedContent` is set. */
	animatedModels?: FeaturesAnimatedModel[];
	deviceMock?: FeaturesOrderedDeviceMock;
	deviceMockContent?:
		| SafariMockContentId
		| IphoneMockContentId
		| TerminalMockContentId
		| SettingsPanelMockContentId
		| DesktopMockContentId;
	/** Inline terminal preview when `deviceMock` is `terminal` (overrides `deviceMockContent`). */
	terminalCode?: string;
	mockUrl?: string;
	iconName: IconName;
};

export type PublicAgentSupportedChannelsSection = {
	subtitle?: string;
	title: string;
	description: string;
	extensionLabel: string;
};

export type PublicAgentComparisonSection = {
	subtitle: string;
	title: string;
	description: string;
	withoutTitle: string;
	withTitle: string;
	points: ComparisonPoint[];
};

export type PublicAgentsHubCompareSection = {
	subtitle: string;
	title: string;
	description: string;
	leftTitle: string;
	rightTitle: string;
	points: ComparePoint[];
};

export type PublicAgentCommandReferenceSection = {
	subtitle: string;
	title: string;
	description?: string;
	commands?: readonly OpenquokCliCommandReferenceItem[];
};

export type PublicLandingWorkflowSection = {
	subtitle: string;
	/** Comma-separated lines; each part gets landing-page gradient styling. */
	title: string;
	description: string;
	deviceMock: 'desktop' | 'iphone-15-pro';
	deviceMockContent: DesktopMockContentId | IphoneMockContentId;
	imageAlt?: string;
};

export type PublicAgentParallelMockDevice =
	| 'desktop'
	| 'iphone-15-pro'
	| 'settings-panel'
	| 'terminal';

export type PublicAgentParallelMockItem = {
	deviceMock: PublicAgentParallelMockDevice;
	deviceMockContent?:
		| DesktopMockContentId
		| IphoneMockContentId
		| SettingsPanelMockContentId
		| TerminalMockContentId;
	/** Inline terminal preview when `deviceMock` is `terminal`, or CLI inside a `desktop` frame. */
	terminalCode?: string;
	imageAlt?: string;
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
	/** Staggered multi-device preview (takes precedence over single `deviceMock`). */
	parallelMocks?: PublicAgentParallelMockItem[];
	/** Multi-line OpenQuok CLI example rendered below the description. */
	cliCommands?: string;
	/** Heading above `cliCommands` (defaults to “CLI command options”). */
	cliCommandsTitle?: string;
	deviceMock?: FeaturesOrderedDeviceMock;
	deviceMockContent?:
		| SafariMockContentId
		| IphoneMockContentId
		| TerminalMockContentId
		| SettingsPanelMockContentId
		| DesktopMockContentId;
	/** When true, media renders on the right; otherwise on the left. */
	mediaOnRight?: boolean;
};

export type PublicAgentHostLandingPageViewModel = {
	pageType: 'agent-host';
	slug: string;
	/** Catalog identifier used for icons and docs links. */
	agentId: string;
	agentLabel: string;
	/** Telegram device-mock header; defaults to `agentLabel` when omitted. */
	telegramBotLabel?: string;
	icon: IconName;
	heroTitle: string;
	heroDescription: string;
	metaTitle: string;
	metaDescription: string;
	/** Hub card blurb on `/agents`; falls back to `metaDescription` when omitted. */
	hubDescription?: string;
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
	workflowSection?: PublicLandingWorkflowSection;
	supportedChannelsSection?: PublicAgentSupportedChannelsSection;
	comparisonSection?: PublicAgentComparisonSection;
	commandReferenceSection?: PublicAgentCommandReferenceSection;
	/** Setup guide under `/docs/`. */
	docsPath: string;
	/** Copy-paste commands for installing openquok-core on this agent host. */
	skillInstallOptions: readonly SkillInstallOption[];
	/** When false, hub shows a coming-soon badge and detail route 404s. */
	available: boolean;
};

/** Agent host catalog entries (OpenClaw, Hermes, …). */
export type PublicAgentLandingPageViewModel = PublicAgentHostLandingPageViewModel;

const OPENCLAW_AGENT: PublicAgentHostLandingPageViewModel = {
	pageType: 'agent-host',
	slug: 'openclaw',
	agentId: 'openclaw',
	agentLabel: 'OpenClaw',
	icon: icons.OpenClaw.name,
	heroTitle: 'Schedule social media from OpenClaw then you approve',
	heroDescription:
		'OpenClaw is a personal AI assistant on your own devices — message it from Telegram, WhatsApp, or Slack. Add the openquok-core skill so it drafts and schedules social posts while you review and approve on the calendar or kanban.',
	metaTitle: 'OpenClaw Social Media Skill for OpenQuok',
	metaDescription:
		'OpenClaw is a self-hosted personal AI assistant for Telegram, WhatsApp, Slack, and more. Connect OpenQuok to draft and schedule social posts from chat — approve every publish on the calendar or kanban.',
	hubDescription:
		'OpenClaw is a personal AI assistant you run on your own devices. It answers on the channels you already use — with voice on macOS, iOS, and Android, and a live Canvas you control.',
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
		},
		{
			subtitle: 'Scale what works',
			title: 'when a viral format hits, run more sessions and reach every connected channel',
			description:
				'Spot a winner in analytics, then let OpenClaw queue the next wave on that template while another session tracks performance — add parallel sessions and connect more channels as you grow, without waiting for one job to finish.',
			parallelMocks: [
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-schedule',
					imageAlt: 'OpenClaw desktop chat session scheduling posts in parallel'
				},
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-analytics',
					imageAlt: 'Second OpenClaw desktop chat session pulling live analytics concurrently'
				},
				{
					deviceMock: 'iphone-15-pro',
					deviceMockContent: 'agent-chat-schedule',
					imageAlt: 'OpenClaw Telegram chat scheduling posts while desktop sessions run in parallel'
				}
			],
			mediaOnRight: false,
			cliCommandsTitle: 'Parallel CLI sessions',
			cliCommands: `# Session A — draft + schedule
openquok posts:create -c "…" -s "…" -t draft -i "<uuid>"
openquok posts:status <post-id> -s schedule

# Session B — metrics (runs at the same time)
openquok analytics:platform <integration-uuid> -d 7
openquok analytics:post <post-id> -d 30

# Session C — review queue (runs at the same time)
openquok posts:review-todo <post-id> --note "Check CTA before publish"
openquok posts:list --status draft`
		}
	],
	workflowSection: {
		subtitle: 'Your messaging apps',
		title: 'Text from Telegram, WhatsApp, or Slack',
		description:
			'Send a scheduling request to OpenClaw like any other message. The openquok-core skill runs on your host, finds connected channels, attaches media, and queues drafts — you approve on the calendar before anything publishes.',
		deviceMock: 'iphone-15-pro',
		deviceMockContent: 'agent-chat-schedule',
		imageAlt: 'OpenClaw chat scheduling social posts via OpenQuok'
	},
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
			title: '4. Install openquok-core skill',
			content: 'Add openquok-core skill and authenticate the CLI once.',
			mediaAlt: 'Install openquok-core skill and authenticate the OpenQuok CLI',
			deviceMock: 'terminal',
			deviceMockContent: 'openquok-skill-install',
			iconName: icons.OpenQuok.name
		},
		{
			id: 5,
			title: '5. Integrate & customize other skills or MCPs',
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
	supportedChannelsSection: {
		subtitle: 'Chat adapters',
		title: 'Supported channels',
		description: 'OpenClaw supports multiple messaging platforms out of the box:',
		extensionLabel: 'Extension Channels'
	},
	comparisonSection: {
		subtitle: 'comparisons',
		title: 'agent-native scheduling, not another dashboard',
		description:
			'Most social scheduler SaaS keeps you in a browser tab. OpenQuok is built for agents',
		withoutTitle: 'Typical social scheduler SaaS',
		withTitle: 'OpenQuok + OpenClaw',
		points: [
			{
				pain: 'Copy posts between your AI chat and a separate scheduling tool',
				feature:
					'Message OpenClaw from WhatsApp, Telegram, or Slack to draft and schedule in one thread'
			},
			{
				pain: 'Siloed API keys and workflows that do not compose with your agent stack',
				feature:
					'Eligibility is checked automatically — credentials stay on your host'
			},
			{
				pain: 'Always-on integrations that bloat agent context',
				feature: 'Skills load on-demand, keeping the agent context clean'
			},
			{
				pain: "Locked to one vendor's models or automation layer",
				feature: 'Works with any LLM: Claude, GPT, Gemini, Llama, and more'
			},
			{
				pain: 'Autopilot publishing with no human checkpoint',
				feature:
					'Every post lands as draft or scheduled — you approve on the calendar or kanban before anything goes live'
			}
		]
	},
	commandReferenceSection: {
		subtitle: 'CLI',
		title: 'Command reference',
		description:
			'Commands from the openquok-core skill — structured JSON on stdout, human-in-the-loop drafts, and workspace media uploads.',
		commands: OPENQUOK_CLI_COMMAND_REFERENCE
	},
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'OpenClaw + OpenQuok, answered',
	faqDescription:
		'What OpenClaw is, how to install openquok-core, supported platforms, human approval, and how agents draft and schedule posts from chat.',
	faqItems: [
		{
			title: 'What is OpenClaw?',
			description:
				'OpenClaw is the open-source personal AI agent. It runs locally or on your own host, connects to chat apps you already use, and takes real actions on your behalf — including drafting and scheduling social media through OpenQuok.'
		},
		{
			title: 'How do I install the openquok-core skill in OpenClaw?',
			description:
				'From your OpenClaw workspace directory, run npx skills add on the agent package root with --skill openquok-core (add -y on headless hosts), or after ClawHub publish run clawhub install openquok-core. Install the global CLI with npm install -g @openquok/auto-cli, set OPENQUOK_API_KEY from Account → Settings → Developers → Access or run openquok auth:login --json, and OpenClaw discovers the skill automatically. See the OpenClaw agent guide in Dev Docs for the exact commands.'
		},
		{
			title: 'What can OpenClaw do with OpenQuok?',
			description:
				'OpenClaw can draft and schedule posts, upload images and video, apply per-platform settings, schedule threads and follow-up comments, and pull platform and post analytics — across every channel connected in your workspace. The openquok-core skill documents integrations:list, posts:create, posts:status, analytics:platform, upload, and more; every command returns structured JSON for the agent to parse.'
		},
		{
			title: 'Which social media platforms are supported?',
			description:
				'Facebook, Instagram (Business and Standalone), Threads, YouTube, and TikTok are available today. LinkedIn and X are on the roadmap. Connect channels in the OpenQuok web app; OpenClaw uses integration UUIDs from openquok integrations:list to target the right accounts.'
		},
		{
			title: 'Does OpenClaw publish immediately or wait for approval?',
			description:
				'Posts created through the CLI land in your OpenQuok workspace as drafts or scheduled items — nothing goes live on autopilot. You review on the calendar or kanban, move posts through draft and review, and approve what should publish. OpenClaw handles volume; you handle quality.'
		},
		{
			title: 'Does it work with other AI agents?',
			description:
				'Yes. OpenQuok is CLI-first — any agent that can run shell commands can use openquok, including Claude Code, ChatGPT, and custom automation. This page focuses on OpenClaw plus the openquok-core skill; pair it with other OpenClaw skills (Bloom, RevenueCat, or your own) for richer workflows.'
		},
		{
			title: 'Why use OpenClaw instead of an MCP client?',
			description:
				'MCP clients like Codex, Claude Code, and Cursor fit focused editor and terminal sessions. OpenClaw fits always-on scheduling from Telegram, WhatsApp, or Slack — persistent memory, parallel sessions across channels, and one assistant that can run openquok-core beside your other skills. Choose OpenClaw when messaging and scale matter; choose MCP when OpenQuok should live inside a single coding workflow. Many teams use both.'
		},
		{
			title: 'Can I run OpenClaw on Railway or another host?',
			description:
				'Yes. Mount a persistent workspace volume, set OPENCLAW_WORKSPACE_DIR, install openquok-core and the global CLI in the container shell, then authenticate. On headless hosts prefer OPENQUOK_API_KEY or openquok auth:login --json so the user opens verification_uri_complete on another device. Start a new chat session after upgrades so the agent reloads instructions.'
		},
		{
			title: 'Is it free to start?',
			description:
				'Yes. Create an OpenQuok account and start a 7-day free trial, connect your channels, install openquok-core on OpenClaw, and begin scheduling from chat.'
		}
	],
	docsPath: '/docs/agent-setup-guides/openclaw',
	skillInstallOptions: OPENCLAW_SKILL_INSTALL_OPTIONS,
	available: true
};

const HERMES_AGENT: PublicAgentHostLandingPageViewModel = {
	pageType: 'agent-host',
	slug: 'hermes',
	agentId: 'hermes',
	agentLabel: 'Hermes Agent',
	telegramBotLabel: 'Hermes',
	icon: icons.HermesAgent.name,
	heroTitle: 'Schedule social media from Hermes then you approve',
	heroDescription:
		'Hermes Agent is a self-improving AI assistant you run on your own hardware or a cloud VM — message it from Telegram, Discord, or Slack. Add the openquok-core skill so it drafts and schedules social posts while you review and approve on the calendar or kanban.',
	metaTitle: 'Hermes Agent Social Media Skill for OpenQuok',
	metaDescription:
		'Hermes Agent is an autonomous AI assistant with a built-in learning loop, 20+ messaging gateways, and MCP support. Connect OpenQuok to draft and schedule social posts from chat — approve every publish on the calendar or kanban.',
	hubDescription:
		'Hermes Agent runs wherever you put it — a laptop, a $5 VPS, or serverless infrastructure. Talk to it from Telegram while it works on a host you never SSH into, with skills that load on demand.',
	keywords: [
		'Hermes Agent social media',
		'Hermes Agent skill',
		'openquok-core skill',
		'Nous Research Hermes',
		'Hermes CLI posting',
		'agentic social media',
		'OpenQuok Hermes integration'
	],
	featureSections: [
		{
			subtitle: 'Connect once',
			title: 'login from your phone, pick your workspace, chat anywhere securely',
			description:
				'Choose a workspace, connect with OAuth2 — approve in your browser, and credentials stay on the host. Message Hermes from Telegram, Discord, or Slack to draft and schedule without opening another app.',
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'openquok-login',
			imageAlt: 'Hermes chat guiding OpenQuok OAuth device login and workspace authorization',
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
				'Message Hermes on Telegram to pull impressions, likes, comments, and shares for any connected channel. Compare performance over 7, 30, or 90 days and schedule more of what already resonates — without opening the dashboard.',
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'telegram-analytics',
			imageAlt: 'Hermes Telegram chat showing OpenQuok platform and post analytics',
			mediaOnRight: true,
			cliCommandsTitle: 'CLI analytics options',
			cliCommands: `# Platform metrics (followers, impressions, engagement)
openquok analytics:platform <integration-uuid> -d 30

# Per-post insights (likes, comments, shares)
openquok analytics:post <post-id> -d 7`
		},
		{
			subtitle: 'Scale what works',
			title: 'when a viral format hits, run more sessions and reach every connected channel',
			description:
				'Spot a winner in analytics, then let Hermes queue the next wave on that template while another session tracks performance — add parallel sessions and connect more channels as you grow, without waiting for one job to finish.',
			parallelMocks: [
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-schedule',
					imageAlt: 'Hermes desktop chat session scheduling posts in parallel'
				},
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-analytics',
					imageAlt: 'Second Hermes desktop chat session pulling live analytics concurrently'
				},
				{
					deviceMock: 'iphone-15-pro',
					deviceMockContent: 'agent-chat-schedule',
					imageAlt: 'Hermes Telegram chat scheduling posts while desktop sessions run in parallel'
				}
			],
			mediaOnRight: false,
			cliCommandsTitle: 'Parallel CLI sessions',
			cliCommands: `# Session A — draft + schedule
openquok posts:create -c "…" -s "…" -t draft -i "<uuid>"
openquok posts:status <post-id> -s schedule

# Session B — metrics (runs at the same time)
openquok analytics:platform <integration-uuid> -d 7
openquok analytics:post <post-id> -d 30

# Session C — review queue (runs at the same time)
openquok posts:review-todo <post-id> --note "Check CTA before publish"
openquok posts:list --status draft`
		}
	],
	workflowSection: {
		subtitle: 'Your messaging gateways',
		title: 'Message Hermes from Telegram, Discord, or Slack',
		description:
			'Send a scheduling request through any gateway Hermes already bridges. The openquok-core skill drafts posts, uploads media, and queues them on your OpenQuok calendar — you sign off before publish.',
		deviceMock: 'iphone-15-pro',
		deviceMockContent: 'agent-chat-schedule',
		imageAlt: 'Hermes chat scheduling social posts via OpenQuok'
	},
	setupStepsSubtitle: 'How it works',
	setupStepsTitle: 'Five steps,to Hermes + OpenQuok',
	setupSteps: [
		{
			id: 1,
			title: '1. Install Hermes Agent',
			content:
				'Run the one-line installer on Linux, macOS, WSL2, or Windows — or use the Desktop app on macOS and Windows.',
			mediaAlt: 'Hermes Agent documentation at hermes-agent.nousresearch.com',
			deviceMock: 'safari',
			deviceMockContent: 'hermes-docs-overview',
			mockUrl: 'hermes-agent.nousresearch.com',
			iconName: icons.Terminal.name
		},
		{
			id: 2,
			title: '2. Select model',
			content:
				'Run hermes setup --portal for the fastest path, or hermes model to pick Claude, GPT, Gemini, OpenRouter, or a self-hosted endpoint.',
			animatedContent: 'llm-models',
			mediaAlt: 'Model and provider selection in Hermes Agent',
			iconName: icons.Bot.name
		},
		{
			id: 3,
			title: '3. Configure chat channel',
			content:
				'Run hermes gateway setup to connect Telegram, Discord, Slack, WhatsApp, Signal, or another platform you already use.',
			mediaAlt: 'Telegram chat channel configuration for Hermes Agent',
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'telegram-connect',
			iconName: icons.MessageCircle.name
		},
		{
			id: 4,
			title: '4. Install openquok-core skill',
			content: 'Add openquok-core under ~/.hermes/skills/ and authenticate the global CLI once.',
			mediaAlt: 'Install openquok-core skill and authenticate the OpenQuok CLI',
			deviceMock: 'terminal',
			deviceMockContent: 'openquok-skill-install-hermes',
			iconName: icons.OpenQuok.name
		},
		{
			id: 5,
			title: '5. Integrate & customize other skills or MCPs',
			content:
				'Add Bloom, RevenueCat, or any Hermes skill beside openquok-core — find your own viral formats and scale!',
			animatedContent: 'agent-integrations',
			mediaAlt: 'Agent skills and integrations with OpenQuok',
			iconName: icons.Sparkles.name
		}
	],
	audienceSubtitle: 'Built for Hermes hosts',
	audienceTitle: 'Who connects Hermes Agent to OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-violet-400',
			title: 'Always-on operators',
			description:
				'Run Hermes on a VPS, Docker, SSH, Daytona, or Modal and message it from the chat apps you already use. Schedule social posts without opening another dashboard.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-indigo-400',
			title: 'Developers & builders',
			description:
				'Open standard skills, MCP servers, and a terminal toolset — add openquok-core and let Hermes schedule posts with structured JSON.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-fuchsia-400',
			title: 'Startup founders',
			description:
				'Model-agnostic routing across 30+ providers keeps your stack lean — pick the agent and model that fit today, swap when you need to, and schedule across every channel from one workspace.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	supportedChannelsSection: {
		subtitle: 'Messaging gateway',
		title: 'Supported channels',
		description:
			'Hermes Agent connects Telegram, Discord, Slack, WhatsApp, and 20+ more platforms from one gateway:',
		extensionLabel: 'Microsoft 365, Chinese platforms & more'
	},
	comparisonSection: {
		subtitle: 'comparisons',
		title: 'agent-native scheduling, not another dashboard',
		description:
			'Most social scheduler SaaS keeps you in a browser tab. OpenQuok is built for agents',
		withoutTitle: 'Typical social scheduler SaaS',
		withTitle: 'OpenQuok + Hermes Agent',
		points: [
			{
				pain: 'Copy posts between your AI chat and a separate scheduling tool',
				feature:
					'Message Hermes from Telegram, Discord, or Slack to draft and schedule in one thread'
			},
			{
				pain: 'Siloed API keys and workflows that do not compose with your agent stack',
				feature:
					'Eligibility is checked automatically — credentials stay on your host'
			},
			{
				pain: 'Always-on integrations that bloat agent context',
				feature: 'Skills load on demand, keeping the agent context clean'
			},
			{
				pain: "Locked to one vendor's models or automation layer",
				feature:
					'Works with Nous Portal, OpenRouter, Anthropic, OpenAI, Gemini, and self-hosted endpoints'
			},
			{
				pain: 'Autopilot publishing with no human checkpoint',
				feature:
					'Every post lands as draft or scheduled — you approve on the calendar or kanban before anything goes live'
			}
		]
	},
	commandReferenceSection: {
		subtitle: 'CLI',
		title: 'Command reference',
		description:
			'Commands from the openquok-core skill — structured JSON on stdout, human-in-the-loop drafts, and workspace media uploads.',
		commands: OPENQUOK_CLI_COMMAND_REFERENCE
	},
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Hermes Agent + OpenQuok, answered',
	faqDescription:
		'What Hermes Agent is, how to install openquok-core, supported platforms, human approval, and how agents draft and schedule posts from chat.',
	faqItems: [
		{
			title: 'What is Hermes Agent?',
			description:
				'Hermes Agent is an autonomous AI assistant built by Nous Research. It runs on your laptop, a VPS, or serverless hosts, connects to 20+ chat platforms, creates and improves skills from experience, and takes real actions — including drafting and scheduling social media through OpenQuok.'
		},
		{
			title: 'How do I install the openquok-core skill in Hermes Agent?',
			description:
				'Install the global CLI with npm install -g @openquok/auto-cli, then run hermes skills install with the openquok-core SKILL.md URL from the monorepo (or copy the file into ~/.hermes/skills/openquok-core/). Set OPENQUOK_API_KEY from Account → Settings → Developers → Access or run openquok auth:login --json, then start a new Hermes session so the skill loads. See the Hermes agent guide in Dev Docs for exact commands.'
		},
		{
			title: 'What can Hermes Agent do with OpenQuok?',
			description:
				'Hermes can draft and schedule posts, upload images and video, apply per-platform settings, schedule threads and follow-up comments, and pull platform and post analytics — across every channel connected in your workspace. The openquok-core skill documents integrations:list, posts:create, posts:status, analytics:platform, upload, and more; every command returns structured JSON for the agent to parse.'
		},
		{
			title: 'Which social media platforms are supported?',
			description:
				'Facebook, Instagram (Business and Standalone), Threads, YouTube, and TikTok are available today. LinkedIn and X are on the roadmap. Connect channels in the OpenQuok web app; Hermes uses integration UUIDs from openquok integrations:list to target the right accounts.'
		},
		{
			title: 'Does Hermes publish immediately or wait for approval?',
			description:
				'Posts created through the CLI land in your OpenQuok workspace as drafts or scheduled items — nothing goes live on autopilot. You review on the calendar or kanban, move posts through draft and review, and approve what should publish. Hermes handles volume; you handle quality.'
		},
		{
			title: 'Does it work with other AI agents?',
			description:
				'Yes. OpenQuok is CLI-first — any agent that can run shell commands can use openquok, including OpenClaw, Claude Code, and custom automation. This page focuses on Hermes plus the openquok-core skill; pair it with Skills Hub workflows, MCP servers, or cron for richer pipelines.'
		},
		{
			title: 'Why use Hermes Agent instead of an MCP client?',
			description:
				'MCP clients like Codex, Claude Code, and Cursor fit focused editor and terminal sessions. Hermes fits always-on scheduling from Telegram, Discord, Slack, or WhatsApp — persistent memory, parallel sessions across channels, and one gateway for 20+ chat platforms. Choose Hermes when messaging and scale matter; choose MCP when OpenQuok should live inside a single coding workflow. Many teams use both.'
		},
		{
			title: 'Can I run Hermes on a VPS or serverless host?',
			description:
				'Yes. Hermes supports local, Docker, SSH, Daytona, Singularity, and Modal backends. Mount a persistent ~/.hermes/ volume, install openquok-core and the global CLI in the same shell Hermes uses for tools, then authenticate. On headless hosts prefer OPENQUOK_API_KEY or openquok auth:login --json so the user opens verification_uri_complete on another device.'
		},
		{
			title: 'Is it free to start?',
			description:
				'Yes. Create an OpenQuok account and start a 7-day free trial, connect your channels, install openquok-core on Hermes, and begin scheduling from chat.'
		}
	],
	docsPath: '/docs/agent-setup-guides/hermes',
	skillInstallOptions: HERMES_SKILL_INSTALL_OPTIONS,
	available: true
};

export const PUBLIC_AGENTS_HUB = {
	subtitle: 'Agents',
	title: 'Social media CLI and MCP for AI agents',
	description:
		'Connect OpenClaw, Hermes, or any skill-based host — install openquok-core for local agents and custom workflows. Or plug OpenQuok into Cursor, Claude Code, Codex, and other MCP clients. Schedule posts from chat while you approve what goes live.',
	cliInstallTitle: 'Install the CLI:',
	skillInstallTitle: 'Install our core skill:',
	mcpHubSubtitle: 'MCP',
	mcpHubTitle: 'Native MCP clients',
	mcpHubDescription:
		'Wire OpenQuok into the editors and terminals where you already chat with an AI agent. Pick a client below for setup steps and a copy-paste MCP config.',
	mcpConfigTitle: 'Copy configuration',
	mcpConfigDescription:
		'Generate a programmatic token after sign-up, then paste the snippet for your client — no CLI skill required.',
	compareSection: {
		subtitle: 'Hosted Agent vs MCP client',
		title: 'agent hosts vs MCP clients, match the tool to how you work',
		description:
			'Both paths connect to OpenQuok. Agent hosts like OpenClaw and Hermes shine when you want messaging, memory, and parallel sessions. MCP clients like Codex and Claude Code shine when you want focused coding workflows in your editor or terminal.',
		leftTitle: 'Agent hosts (OpenClaw, Hermes)',
		rightTitle: 'MCP clients (Codex, Claude Code, Cursor)',
		points: [
			{
				left: 'Schedule from Telegram, Discord, Slack, or WhatsApp',
				right: 'Work in Cursor, Claude Code, or Codex'
			},
			{
				left: 'Persistent memory across sessions',
				right: 'Focused, per-session coding sprints'
			},
			{
				left: 'Parallel sessions across channels',
				right: 'Async tasks with clear specs'
			},
			{
				left: 'Messaging, memory, and workflows in one assistant',
				right: 'Native OpenQuok MCP tool calls'
			},
			{
				left: 'Model-agnostic — swap providers freely',
				right: 'Ticket- and PR-friendly review flows'
			}
		]
	} satisfies PublicAgentsHubCompareSection
} as const;

export const PUBLIC_AGENT_HOST_LANDING_PAGES: readonly PublicAgentHostLandingPageViewModel[] = [
	OPENCLAW_AGENT,
	HERMES_AGENT
];

const agentHostBySlug = new Map(
	PUBLIC_AGENT_HOST_LANDING_PAGES.map((page) => [page.slug, page])
);

export function getPublicAgentHostBySlug(slug: string): PublicAgentHostLandingPageViewModel | undefined {
	const key = slug.trim().toLowerCase();
	return agentHostBySlug.get(key);
}

export function getAvailablePublicAgentHostBySlug(
	slug: string
): PublicAgentHostLandingPageViewModel | undefined {
	const page = getPublicAgentHostBySlug(slug);
	if (!page?.available) return undefined;
	return page;
}

export function listPublicAgentsForHub(): PublicAgentHostLandingPageViewModel[] {
	return [...PUBLIC_AGENT_HOST_LANDING_PAGES];
}

export function listAvailablePublicAgents(): PublicAgentHostLandingPageViewModel[] {
	return PUBLIC_AGENT_HOST_LANDING_PAGES.filter((page) => page.available);
}
