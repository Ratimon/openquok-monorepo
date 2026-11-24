import { icons } from '$data/icons';

import { buildAgentHostPickerFaqDescription } from '$lib/content/constants/agents/decision-scenarios';
import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/agents/types';
import { faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import {
	OPENQUOK_CLI_COMMAND_REFERENCE,
	OPENBOT_SKILL_INSTALL_OPTIONS
} from '$lib/content/constants/agents/cli-command-reference';
import { PUBLIC_AGENT_OPPORTUNITIES_PREVIEW_SECTION } from '$lib/content/constants/agents/general';
import { buildAgentCloudBrowserVsOpenQuokFaqItem } from '$lib/content/constants/agents/agentCloudSchedulingFaq';
import {
	buildPublishApprovalFaqAnswer,
	COMPARISON_PUBLISH_CHOICE_FEATURE,
	WORKFLOW_PUBLISH_CHOICE_SENTENCE
} from '$lib/content/constants/schedulingPublishChoice';

export const openbotAgent = {
	pageType: 'agent-host',
	slug: 'openbot',
	agentId: 'openbot',
	agentLabel: 'OpenBot',
	icon: icons.OpenBot.name,
	available: true,
	metaTitle: 'OpenBot Social Scheduling — Multi-Agent Desktop & BYO AI',
	metaDescription:
		'Run a team of model-agnostic agents on your Mac, Windows, or Linux computer. Add openquok-core, connect your ChatGPT, Claude, or Grok plan, and schedule social posts from desktop or mobile chat. You approve on OpenQuok.',
	hubDescription:
		'OpenBot is a polished desktop and mobile workspace for many agents. Bring your own AI subscriptions, add openquok-core as a skill, and message agents from shared project rooms. You approve on OpenQuok.',
	keywords: [
		'OpenBot social media',
		'OpenBot scheduler',
		'OpenBot BYO AI',
		'model agnostic agent scheduling',
		'OpenBot multi-agent brainstorm',
		'OpenBot vs OpenClaw',
		'OpenBot OpenQuok',
		'openquok-core skill',
		'OpenBot macOS scheduling',
		'agentic social media scheduler',
		'OpenQuok OpenBot integration'
	],
	heroTitle: 'Schedule social media from OpenBot then you approve',
	heroDescription:
		'OpenBot runs Codex, Claude Code, Gemini, Grok, and custom providers from one workspace on your computer. Agent settings show memory, skills, files, and tables at a glance. Add openquok-core so your agents draft and schedule posts from chat or multiplayer rooms. You review and approve on the calendar or kanban.',
	docsPath: '/docs/agent-setup-guides/openbot',
	skillInstallOptions: OPENBOT_SKILL_INSTALL_OPTIONS,
	workflowSection: {
		subtitle: 'Your agent team',
		title: 'Brainstorm in OpenBot, schedule with openquok-core',
		description: `Pull QA, SecOps, and Dev agents into one channel for a launch, then ask your scheduling agent to queue drafts. openquok-core runs the CLI on the OpenBot computer. ${WORKFLOW_PUBLISH_CHOICE_SENTENCE}`,
		deviceMock: 'desktop',
		deviceMockContent: 'agent-parallel-schedule',
		imageAlt: 'OpenBot desktop chat scheduling social posts via OpenQuok'
	},
	audienceSubtitle: 'Built for OpenBot users',
	audienceTitle: 'Who connects OpenBot to OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-zinc-400',
			title: 'Mac-first power users',
			description:
				'You want a strong macOS client, clean agent settings, and mobile apps that pair with your desktop.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.Sparkles.name,
			iconClass: 'text-neutral-300',
			title: 'Bring-your-own-AI operators',
			description:
				'You already pay for Claude, ChatGPT, Grok, or Gemini. You route agents through custom OpenAI-compatible endpoints.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.Users.name,
			iconClass: 'text-stone-400',
			title: 'Multi-agent project leads',
			description:
				'You spawn specialist agents in one room to brainstorm, then delegate scheduling to openquok-core.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	setupStepsSubtitle: 'How it works',
	setupStepsTitle: 'Five steps to OpenBot + OpenQuok',
	setupSteps: [
		{
			id: 1,
			title: '1. Install OpenBot',
			content:
				'Download OpenBot for macOS, Windows, or Linux from openbot.run. Connect a provider with the subscription or API key you already use.',
			mediaAlt: 'OpenBot guides and download page',
			deviceMock: 'safari',
			deviceMockContent: 'openbot-docs-overview',
			mockUrl: 'openbot.run',
			iconName: icons.Terminal.name
		},
		{
			id: 2,
			title: '2. Create or import agents',
			content:
				'Give each agent a role and instructions. Open Agent settings to review memory, skills, files, database tables, and optional publish settings.',
			animatedContent: 'llm-models',
			mediaAlt: 'OpenBot agent settings overview',
			iconName: icons.Bot.name
		},
		{
			id: 3,
			title: '3. Chat solo or in a team room',
			content:
				'Message one agent or invite teammates into a shared channel. Agents can hand off tasks and keep context on your computer.',
			mediaAlt: 'OpenBot multi-agent chat for scheduling requests',
			deviceMock: 'desktop',
			deviceMockContent: 'agent-parallel-schedule',
			iconName: icons.MessageCircle.name
		},
		{
			id: 4,
			title: '4. Install openquok-core',
			content:
				'Install @openquok/auto-cli on the OpenBot computer. Add openquok-core from the Marketplace Skills tab or register a local SKILL.md on the agent.',
			mediaAlt: 'Install openquok-core skill and authenticate the OpenQuok CLI',
			deviceMock: 'terminal',
			deviceMockContent: 'openquok-skill-install-openbot',
			iconName: icons.OpenQuok.name
		},
		{
			id: 5,
			title: '5. Integrate & customize other skills or MCPs',
			content:
				'When a native app connector is missing, add a skill that calls OpenQuok over MCP or keep CLI-first scheduling for volume.',
			animatedContent: 'agent-integrations',
			mediaAlt: 'OpenBot skills and MCP integrations with OpenQuok',
			iconName: icons.Sparkles.name
		}
	],
	featureSections: [
		{
			subtitle: 'Connect once',
			title: 'authenticate on your OpenBot computer, pick your workspace, chat securely',
			description:
				'Run OAuth device login once on the machine that hosts OpenBot. Credentials stay local. Ask any agent in chat to draft and schedule without opening another dashboard.',
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'openquok-login',
			imageAlt: 'OpenBot chat guiding OpenQuok OAuth device login and workspace authorization',
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
				'Ask your scheduling agent to pull impressions, likes, comments, and shares for any connected channel. Compare performance and schedule more of what already resonates — without opening the dashboard.',
			deviceMock: 'desktop',
			deviceMockContent: 'agent-parallel-analytics',
			imageAlt: 'OpenBot chat showing OpenQuok platform and post analytics',
			mediaOnRight: true,
			cliCommandsTitle: 'CLI analytics options',
			cliCommands: `# Platform metrics (followers, impressions, engagement)
openquok analytics:platform <integration-uuid> -d 30

# Per-post insights (likes, comments, shares)
openquok analytics:post <post-id> -d 7`
		}
	],
	opportunitiesPreviewSection: PUBLIC_AGENT_OPPORTUNITIES_PREVIEW_SECTION,
	comparisonSection: {
		subtitle: 'comparisons',
		title: 'agent-native scheduling, not another dashboard',
		description:
			'Most social scheduler SaaS keeps you in a browser tab. OpenQuok is built for agents',
		withoutTitle: 'Typical social scheduler SaaS',
		withTitle: 'OpenQuok + OpenBot',
		points: [
			{
				pain: 'Copy posts between your AI chat and a separate scheduling tool',
				feature: 'Message OpenBot agents from desktop or mobile to draft and schedule'
			},
			{
				pain: 'Locked to one model vendor inside the scheduler',
				feature: 'Bring Claude, ChatGPT, Grok, Gemini, or custom OpenAI-compatible endpoints'
			},
			{
				pain: 'One bot thread with no specialist handoffs',
				feature: 'Run QA, SecOps, and Dev agents in one room, then delegate openquok-core'
			},
			{
				pain: 'Opaque skills and files scattered across apps',
				feature: 'Agent settings surface memory, skills, files, and tables in one view'
			},
			{
				pain: 'Autopilot publishing with no human checkpoint',
				feature: COMPARISON_PUBLISH_CHOICE_FEATURE
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
		subtitle: 'Where you chat',
		title: 'Desktop, mobile, and shared channels',
		description:
			'OpenBot keeps workspaces on the computer you run. Chat from the native apps or invite teammates into multiplayer rooms:',
		extensionLabel: 'Skills & MCP (when apps are missing)'
	},
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'OpenBot + OpenQuok, answered',
	faqDescription:
		'What OpenBot is, BYO AI providers, multi-agent rooms, skill install, licensing, team hosting, and how it compares to other agent hosts.',
	faqItems: [
		{
			title: 'What is OpenBot?',
			description: `OpenBot is a model-agnostic workspace for a team of AI agents on your computer. The macOS app is the flagship experience; Windows, Linux, and mobile clients connect to the same machine. Each agent has its own instructions, memory, skills, files, and optional database tables. Agent settings give you that overview in one place. You can also publish an agent for others when the product allows it. See the ${faqLink(publicFaqHref.openbotLanding, 'OpenBot integration')} and ${faqLink(publicFaqHref.agentSetupGuides, 'agent setup guides')}.`
		},
		{
			title: 'How is OpenBot model-agnostic?',
			description: `You connect the AI plan or API key you already pay for. OpenBot supports Codex with ${faqLink(publicFaqHref.chatgptLanding, 'ChatGPT')}, Claude Code with ${faqLink(publicFaqHref.claudeCodeLanding, 'Claude Code')}, ${faqLink(publicFaqHref.geminiLanding, 'Gemini')}, ${faqLink(publicFaqHref.grokBotLanding, 'Grok Bot')}, ${faqLink(publicFaqHref.opencodeLanding, 'OpenCode')}, ${faqLink(publicFaqHref.cursorLanding, 'Cursor')}, Cline, and more. You can add custom OpenAI-compatible providers (for example 9router or omniroute) or local models through Ollama and LM Studio. When one plan hits a limit, an agent can fail over to a backup model and keep its workspace. Need tool-style access instead of a skill? See ${faqLink(publicFaqHref.mcpSetupGuides, 'MCP setup guides')} and the ${faqLink(publicFaqHref.agents, 'Agents hub')}.`
		},
		{
			title: 'How do multi-agent brainstorm rooms work?',
			description: `OpenBot agents message each other in shared channels. You can stand up a new project room, add specialist agents such as QA, SecOps, and Dev, and let them bounce ideas before you ask a scheduling agent to draft launch posts with openquok-core. See the ${faqLink(publicFaqHref.openbotAgentGuide, 'OpenBot agent guide')} and ${faqLink(publicFaqHref.cliGettingStarted, 'CLI getting started')}. Workflows can include human approval steps before anything ships — review on the ${faqLink(publicFaqHref.docsKanban, 'kanban board')} or follow ${faqLink(publicFaqHref.docsApprovals, 'post approvals')}.`
		},
		{
			title: 'How do I connect OpenQuok when OpenBot has few native app connectors?',
			description: `OpenBot’s built-in app and connector catalog is still growing, and some suites (such as Google) may be missing native entries. You can add openquok-core as a skill and run the CLI on the OpenBot computer, or author a skill that calls OpenQuok over MCP when you need tool-style access. See the ${faqLink(publicFaqHref.openbotAgentGuide, 'OpenBot agent guide')}.`
		},
		{
			title: 'When should I pick OpenBot over Rakazo or OpenClaw?',
			description: buildAgentHostPickerFaqDescription('openbot')
		},
		{
			title: 'How do I install the openquok-core skill on OpenBot?',
			description: `Install @openquok/auto-cli on the computer that runs OpenBot. Fetch SKILL.md from the public repo, then install it on the target agent from the Marketplace Skills tab or register it with your agent’s create_skill flow. See the ${faqLink(publicFaqHref.openbotAgentGuide, 'OpenBot agent guide')}.`
		},
		{
			title: 'Where do OpenQuok credentials live?',
			description: `The global CLI and auth files stay on the OpenBot computer — the same machine where agents run shell commands. Tokens do not belong in chat threads. Use OAuth device flow or a programmatic opo_ token on that computer. See ${faqLink(publicFaqHref.oauthApps, 'OAuth2 for apps')} and ${faqLink(publicFaqHref.publicApi, 'Public API')} docs.`
		},
		{
			title: 'What can OpenBot do with OpenQuok?',
			description: `Draft and schedule posts, upload media, configure plugs, and pull analytics across your connected channels. See ${faqLink(publicFaqHref.channels, 'supported channels')} and ${faqLink(publicFaqHref.cliManagingPosts, 'CLI post commands')}; openquok-core returns structured JSON for the agent.`
		},
		buildAgentCloudBrowserVsOpenQuokFaqItem('OpenBot'),
		{
			title: 'Which social media platforms are supported?',
			description: `Facebook, Instagram, Threads, YouTube, TikTok, LinkedIn, and X are supported today. Connect channels in the OpenQuok web app or follow the ${faqLink(publicFaqHref.socialIntegration, 'channel setup guides')}; see every network on ${faqLink(publicFaqHref.channels, 'Supported channels')}. Agents use integration UUIDs from openquok integrations:list to target the right accounts.`
		},
		{
			title: 'Does OpenBot publish immediately or wait for approval?',
			description: buildPublishApprovalFaqAnswer('OpenBot')
		},
		{
			title: 'What about the OpenBot license and team hosting?',
			description: `Personal and other noncommercial use is free under PolyForm Noncommercial 1.0.0 — read the license before you use OpenBot in a commercial setting. Source is available so you can audit behavior on your own machine. OpenBot for Teams runs on vendor-managed servers only; there is no self-hosted team server option today. Personal use still runs on hardware you control.`
		},
		{
			title: 'Is it free to start?',
			description: `OpenQuok offers a 7-day free trial on ${faqLink(publicFaqHref.pricing, 'Pricing')}. OpenBot software is free for noncommercial personal use; you pay your AI providers separately. Install OpenBot, add openquok-core, and begin scheduling from chat.`
		}
	]
} satisfies PublicAgentHostLandingPageViewModel;