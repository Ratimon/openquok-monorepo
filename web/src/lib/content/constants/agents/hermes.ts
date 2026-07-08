import { icons } from '$data/icons';

import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/agents/types';
import {
	HERMES_SKILL_INSTALL_OPTIONS,
	OPENQUOK_CLI_COMMAND_REFERENCE
} from '$lib/content/constants/openquokCliCommandReference';
import { PUBLIC_AGENT_LISTINGS_PREVIEW_SECTION } from '$lib/content/constants/agents/shared';

export const hermesAgent = {
	pageType: 'agent-host',
	slug: 'hermes',
	agentId: 'hermes',
	agentLabel: 'Hermes Agent',
	telegramBotLabel: 'Hermes',
	icon: icons.HermesAgent.name,
	available: true,
	metaTitle: 'Hermes Agent Social Media Skill for OpenQuok',
	metaDescription: 'Hermes Agent is an autonomous AI assistant with a built-in learning loop, 20+ messaging gateways, and MCP support. Connect OpenQuok to draft and schedule social posts from chat — approve every publish on the calendar or kanban.',
	hubDescription: 'Hermes Agent runs wherever you put it — a laptop, a $5 VPS, or serverless infrastructure. Talk to it from Telegram while it works on a host you never SSH into, with skills that load on demand.',
	keywords: [
		'Hermes Agent social media',
		'Hermes Agent skill',
		'openquok-core skill',
		'Nous Research Hermes',
		'Hermes CLI posting',
		'agentic social media',
		'OpenQuok Hermes integration'
	],
	heroTitle: 'Schedule social media from Hermes then you approve',
	heroDescription: 'Hermes Agent is a self-improving AI assistant you run on your own hardware or a cloud VM — message it from Telegram, Discord, or Slack. Add the openquok-core skill so it drafts and schedules social posts while you review and approve on the calendar or kanban.',
	docsPath: '/docs/agent-setup-guides/hermes',
	skillInstallOptions: HERMES_SKILL_INSTALL_OPTIONS,
	workflowSection: {
		subtitle: 'Your messaging gateways',
		title: 'Message Hermes from Telegram, Discord, or Slack',
		description:
			'Send a scheduling request through any gateway Hermes already bridges. The openquok-core skill drafts posts, uploads media, and queues them on your OpenQuok calendar — you sign off before publish.',
		deviceMock: 'iphone-15-pro',
		deviceMockContent: 'agent-chat-schedule',
		imageAlt: 'Hermes chat scheduling social posts via OpenQuok'
	},
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
			bentoId: 'agent-multi-platform-bulk-scheduling',
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
				'Message Hermes on Telegram to pull impressions, likes, comments, and shares for any connected channel. Compare performance and schedule more of what already resonates — without opening the dashboard.',
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
			title: 'when a format hits, scale by adding workspaces and parallel sessions',
			description:
				'Spot a winner in analytics, then cl a dedicated workspace for the next client or brand while Hermes queues the next wave in parallel — credentials, channels, and agent context stay isolated as you scale.',
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
			cliCommands: `# Workspace A — launch (client brand)
openquok posts:create -c "…" -s "…" -t draft -i "<uuid>"
openquok posts:status <post-id> -s schedule

# Workspace B — another client (isolated credentials)
openquok posts:list --status draft

# Same workspace — metrics in parallel
openquok analytics:platform <integration-uuid> -d 7
openquok analytics:post <post-id> -d 30`
		}
	],
	listingsPreviewSection: PUBLIC_AGENT_LISTINGS_PREVIEW_SECTION,
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
					'Message Hermes from Telegram, Discord, or Slack to draft and schedule'
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
				pain: 'One workspace mixing every context as you add channels and parallel sessions',
				feature:
					'Multi-workspace isolation — spin up a workspace per context so channels, and drafts never cross wires'
			},
			{
				pain: 'Autopilot publishing with no human checkpoint',
				feature:
					'Every post lands as draft or scheduled — you approve before anything goes live'
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
	supportedChannelsSection: {
		subtitle: 'Messaging gateway',
		title: 'Supported channels',
		description:
			'Hermes Agent connects Telegram, Discord, Slack, WhatsApp, and 20+ more platforms from one gateway:',
		extensionLabel: 'Microsoft 365, Chinese platforms & more'
	},
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Hermes Agent + OpenQuok, answered',
	faqDescription: 'What Hermes Agent is, how to install openquok-core, supported platforms, human approval, and how agents draft and schedule posts from chat.',
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
				'Facebook, Instagram (Business and Standalone), Threads, YouTube, TikTok, LinkedIn, and X are available today. Connect channels in the OpenQuok web app; Hermes uses integration UUIDs from openquok integrations:list to target the right accounts.'
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
} satisfies PublicAgentHostLandingPageViewModel;
