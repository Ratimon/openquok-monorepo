import { icons } from '$data/icons';

import { buildAgentHostPickerFaqDescription } from '$lib/content/constants/agents/decision-scenarios';
import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/agents/types';
import { faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import {
	OPENQUOK_CLI_COMMAND_REFERENCE,
	TUCANO_SKILL_INSTALL_OPTIONS
} from '$lib/content/constants/agents/cli-command-reference';
import { PUBLIC_AGENT_OPPORTUNITIES_PREVIEW_SECTION } from '$lib/content/constants/agents/general';
import { buildAgentCloudBrowserVsOpenQuokFaqItem } from '$lib/content/constants/agents/agentCloudSchedulingFaq';
import {
	buildPublishApprovalFaqAnswer,
	COMPARISON_PUBLISH_CHOICE_FEATURE,
	WORKFLOW_PUBLISH_CHOICE_SENTENCE
} from '$lib/content/constants/schedulingPublishChoice';

export const tucanoAgent = {
	pageType: 'agent-host',
	slug: 'tucano',
	agentId: 'tucano',
	agentLabel: 'Tucano',
	icon: icons.Tucano.name,
	available: true,
	metaTitle: 'Tucano Social Scheduling — Multi-Agent Team & BYO Harness',
	metaDescription:
		'Run a team of AI agents in channels on your Mac, Windows, or Linux. Use Claude, ChatGPT, or your company gateway. Add openquok-core, queue social drafts, and approve on OpenQuok.',
	hubDescription:
		'Tucano is a free desktop app for a team of agents in channels. Each agent uses your existing harness. Add openquok-core and queue social drafts. You approve on OpenQuok.',
	keywords: [
		'Tucano social media',
		'Tucano scheduler',
		'Tucano multi-agent',
		'Tucano BYO AI',
		'Tucano OpenQuok',
		'openquok-core skill',
		'multi-agent social scheduling',
		'Claude Code Codex Tucano',
		'model agnostic agent team Tucano'
	],
	heroTitle: 'Schedule social media from Tucano then you approve',
	heroDescription:
		'Tucano runs Claude Code, Codex, Cursor, Grok, and other harnesses you already configured. Pin a scheduling agent beside brand or launch specialists in channels. openquok-core runs on the computer or isolated Linux box your agent uses. You review on the calendar or kanban.',
	docsPath: '/docs/agent-setup-guides/tucano',
	skillInstallOptions: TUCANO_SKILL_INSTALL_OPTIONS,
	workflowSection: {
		subtitle: 'Your agent team',
		title: 'Channels, routines, and openquok-core',
		description: `Run Leo on copy and Pia on product while a scheduling agent queues drafts with openquok-core. Routines fire on the calendar you pick. ${WORKFLOW_PUBLISH_CHOICE_SENTENCE}`,
		deviceMock: 'desktop',
		deviceMockContent: 'agent-parallel-schedule',
		imageAlt: 'Tucano desktop channels scheduling social posts via OpenQuok'
	},
	audienceSubtitle: 'Built for Tucano users',
	audienceTitle: 'Who connects Tucano to OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-zinc-400',
			title: 'Desktop agent teams',
			description:
				'You want many specialists in channels on macOS, Windows, or Linux without a vendor proxy.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.Sparkles.name,
			iconClass: 'text-neutral-300',
			title: 'BYO subscription users',
			description:
				'You already pay for Claude, ChatGPT, or a company gateway. Tucano routes agents through harnesses you control.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CalendarClock.name,
			iconClass: 'text-stone-400',
			title: 'Approval-first publishers',
			description:
				'You wire routines for weekday social runs, then approve every OpenQuok publish yourself.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	setupStepsSubtitle: 'How it works',
	setupStepsTitle: 'Five steps,to Tucano + OpenQuok',
	setupSteps: [
		{
			id: 1,
			title: '1. Install Tucano',
			content:
				'Download Tucano for your platform from tucano.sh. Sign in to at least one harness in onboarding—Claude Code, Codex, Cursor, Gemini, Grok, OpenCode, or Pi.',
			mediaAlt: 'Tucano download and harness sign-in',
			deviceMock: 'safari',
			deviceMockContent: 'tucano-docs-overview',
			mockUrl: 'tucano.sh',
			iconName: icons.Terminal.name
		},
		{
			id: 2,
			title: '2. Build your scheduling agent',
			content:
				'Ask Tuca to propose a social agent or add one yourself. Pick a model per agent. Grant shell access on your computer or an isolated Linux box when the agent must run the CLI.',
			animatedContent: 'llm-models',
			mediaAlt: 'Create a Tucano scheduling agent with your harness',
			iconName: icons.Bot.name
		},
		{
			id: 3,
			title: '3. Chat in channels or routines',
			content:
				'Message agents in team channels or set routines for recurring social workflows. Sensitive tool calls pause for your yes before they run.',
			mediaAlt: 'Tucano channels and routines for scheduling',
			deviceMock: 'desktop',
			deviceMockContent: 'agent-parallel-schedule',
			iconName: icons.MessageCircle.name
		},
		{
			id: 4,
			title: '4. Install openquok-core',
			content:
				'Install @openquok/auto-cli where the scheduling agent runs commands. Add SKILL.md to a folder the agent can read.',
			mediaAlt: 'Install openquok-core and authenticate the OpenQuok CLI',
			deviceMock: 'terminal',
			deviceMockContent: 'openquok-skill-install-tucano',
			iconName: icons.OpenQuok.name
		},
		{
			id: 5,
			title: '5. Integrate & customize other skills or MCPs',
			content:
				'Grant only the tools each agent needs. Add more skills when a suite is missing from the default harness.',
			animatedContent: 'agent-integrations',
			mediaAlt: 'Tucano agent tools with OpenQuok',
			iconName: icons.Sparkles.name
		}
	],
	featureSections: [
		{
			subtitle: 'Connect once',
			title: 'authenticate on the agent computer, pick your workspace, chat securely',
			description:
				'Run OAuth device login once on the machine where your scheduling agent runs shell commands. Credentials stay local on your computer. Ask the agent to draft and schedule without opening another dashboard.',
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'openquok-login',
			imageAlt: 'Tucano channel chat guiding OpenQuok OAuth device login and workspace authorization',
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
				'Move agent-generated posts from draft to review to scheduled on a kanban board—with the same smart filters as your calendar. Approve quality at scale instead of trusting autopilot.',
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
			imageAlt: 'Tucano channel chat showing OpenQuok platform and post analytics',
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
		withTitle: 'OpenQuok + Tucano',
		points: [
			{
				pain: 'Copy posts between your AI chat and a separate scheduling tool',
				feature: 'Message Tucano agents in channels to draft and schedule'
			},
			{
				pain: 'Locked to one model vendor inside the scheduler',
				feature: 'Pick Claude, Codex, Grok, or other harnesses per agent with BYO logins'
			},
			{
				pain: 'One agent thread with no specialist handoffs',
				feature: 'Run brand, launch, and scheduling agents in parallel channels'
			},
			{
				pain: 'Weekday routines with no visibility into cost or limits',
				feature: 'Calendar routines plus per-agent token limits before each reply'
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
		title: 'Desktop, Telegram, channels, and routines',
		description:
			'Agents run on your computer or an isolated Linux environment you assign. Approve sensitive actions from the desktop app or Telegram. Optional Tucano Pro keeps the team in the cloud when your laptop sleeps:',
		extensionLabel: 'Harnesses, memory & routines'
	},
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Tucano + OpenQuok, answered',
	faqDescription:
		'What Tucano is, BYO harnesses, multi-agent channels, skill install, and how it compares to other agent hosts.',
	faqItems: [
		{
			title: 'What is Tucano?',
			description: `Tucano is a free desktop app for a team of AI agents in channels. You message agents like teammates. Each agent has tools, memory, and a harness you configure. Data stays on your computer by default. Optional paid Tucano Pro runs your team in the cloud. See the ${faqLink(publicFaqHref.tucanoLanding, 'Tucano integration')} and ${faqLink(publicFaqHref.agentSetupGuides, 'agent setup guides')}.`
		},
		{
			title: 'How is Tucano model-agnostic?',
			description: `You connect Claude Code, Codex, Cursor, Gemini, Grok, OpenCode, or Pi with the subscription or gateway you already pay for. Each agent can use a different model. Tucano does not proxy your credentials through a single vendor. Need an editor MCP path too? See ${faqLink(publicFaqHref.mcpSetupGuides, 'MCP setup guides')} and the ${faqLink(publicFaqHref.agents, 'Agents hub')}.`
		},
		{
			title: 'How do Tucano multi-agent workflows work?',
			description: `You can run many agents at once—each with a role in a channel like launch or social. Specialists finish briefs; your scheduling agent queues posts with openquok-core. See the ${faqLink(publicFaqHref.tucanoAgentGuide, 'Tucano agent guide')} and ${faqLink(publicFaqHref.cliGettingStarted, 'CLI getting started')}. Review drafts on the ${faqLink(publicFaqHref.docsKanban, 'kanban board')} or follow ${faqLink(publicFaqHref.docsApprovals, 'post approvals')}.`
		},
		{
			title: 'When should I pick Tucano over MausBot or OpenBot?',
			description: buildAgentHostPickerFaqDescription('tucano')
		},
		{
			title: 'How do I install the openquok-core skill on Tucano?',
			description: `Install @openquok/auto-cli on the computer or isolated Linux box where the scheduling agent runs shell commands. Fetch SKILL.md into a folder the agent can read. See the ${faqLink(publicFaqHref.tucanoAgentGuide, 'Tucano agent guide')}.`
		},
		{
			title: 'Where do OpenQuok credentials live?',
			description: `The global CLI and auth files stay on the machine that runs commands for your agent—not inside chat transcripts. Use OAuth device flow or a programmatic opo_ token on that computer. See ${faqLink(publicFaqHref.oauthApps, 'OAuth2 for apps')} and ${faqLink(publicFaqHref.publicApi, 'Public API')} docs.`
		},
		{
			title: 'What can Tucano do with OpenQuok?',
			description: `Draft and schedule posts, upload media, configure plugs, and pull analytics across your connected channels. See ${faqLink(publicFaqHref.channels, 'supported channels')} and ${faqLink(publicFaqHref.cliManagingPosts, 'CLI post commands')}; openquok-core returns structured JSON for the agent.`
		},
		buildAgentCloudBrowserVsOpenQuokFaqItem('Tucano'),
		{
			title: 'Which social media platforms are supported?',
			description: `Facebook, Instagram, Threads, YouTube, TikTok, LinkedIn, and X are supported today. Connect channels in the OpenQuok web app or follow the ${faqLink(publicFaqHref.socialIntegration, 'channel setup guides')}; see every network on ${faqLink(publicFaqHref.channels, 'Supported channels')}. Agents use integration UUIDs from openquok integrations:list to target the right accounts.`
		},
		{
			title: 'Does Tucano publish immediately or wait for approval?',
			description: buildPublishApprovalFaqAnswer('Tucano')
		},
		{
			title: 'Is Tucano free for commercial use?',
			description: `The Tucano app is free with no locked features. You still pay model providers for usage. Optional Tucano Pro and Team plans bill separately for always-on cloud hosting. Read the current license and cloud terms before production social workflows.`
		},
		{
			title: 'Is it free to start?',
			description: `OpenQuok offers a 7-day free trial on ${faqLink(publicFaqHref.pricing, 'Pricing')}. Tucano software is free to download; model usage follows your provider plans. Install Tucano, add openquok-core, and begin scheduling from channels.`
		}
	]
} satisfies PublicAgentHostLandingPageViewModel;