import { icons } from '$data/icons';

import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/agents/types';
import { faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import {
	GROK_BOT_SKILL_INSTALL_OPTIONS,
	OPENQUOK_CLI_COMMAND_REFERENCE
} from '$lib/content/constants/openquokCliCommandReference';
import { PUBLIC_AGENT_LISTINGS_PREVIEW_SECTION } from '$lib/content/constants/agents/shared';

export const grokBotAgent = {
	pageType: 'agent-host',
	slug: 'grok-bot',
	agentId: 'grok-bot',
	agentLabel: 'Grok Bot',
	icon: icons.GrokBot.name,
	available: true,
	metaTitle: 'Grok Bot Social Media Skill for OpenQuok',
	metaDescription:
		'Grok Bot is an AI teammate on a shared cloud computer with desktop and iOS apps. Connect OpenQuok to draft and schedule social posts from chat — approve every publish on the calendar or kanban.',
	hubDescription:
		'Grok Bot teammates run on a persistent cloud computer with browser, filesystem, and terminal. Message them from macOS, Windows, or iOS, install openquok-core as a skill, and schedule posts while you approve on OpenQuok.',
	keywords: [
		'Grok Bot social media',
		'Grok Bot skill',
		'openquok-core skill',
		'xAI Grok Bot',
		'Grok Bot CLI posting',
		'agentic social media',
		'OpenQuok Grok Bot integration'
	],
	heroTitle: 'Schedule social media from Grok Bot then you approve',
	heroDescription:
		'Grok Bot is an AI teammate on a shared cloud computer — message it from the macOS or Windows desktop app or iOS. Add the openquok-core skill so it drafts and schedules social posts while you review and approve on the calendar or kanban.',
	docsPath: '/docs/agent-setup-guides/grok-bot',
	skillInstallOptions: GROK_BOT_SKILL_INSTALL_OPTIONS,
	workflowSection: {
		subtitle: 'Your desktop teammate',
		title: 'Message Grok Bot from macOS, Windows, or iOS',
		description:
			'Ask your Bot to draft and schedule like any other teammate message. The openquok-core skill runs on its cloud computer, finds connected channels, attaches media, and queues drafts — you approve on the calendar before anything publishes.',
		deviceMock: 'desktop',
		deviceMockContent: 'agent-parallel-schedule',
		imageAlt: 'Grok Bot desktop chat scheduling social posts via OpenQuok'
	},
	audienceSubtitle: 'Built for Grok Bot users',
	audienceTitle: 'Who connects Grok Bot to OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-neutral-300',
			title: 'Cursor & xAI subscribers',
			description:
				'Eligible on SuperGrok Heavy, Cursor Ultra, or Cursor Teams Premium. Sign in with your Cursor account, create a Bot, and schedule social posts without leaving chat.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-zinc-400',
			title: 'Desktop-first operators',
			description:
				'Each Bot gets a persistent cloud computer — browser, files, and shell. Install the global CLI there once, then message the Bot to run openquok commands on demand.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-stone-400',
			title: 'Founders & small teams',
			description:
				'Keep human approval on the calendar while your Bot handles volume. Skills load via Settings → Plugins or / in chat — no always-on MCP bloat.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	setupStepsSubtitle: 'How it works',
	setupStepsTitle: 'Five steps,to Grok Bot + OpenQuok',
	setupSteps: [
		{
			id: 1,
			title: '1. Install Grok Bot',
			content:
				'Download the desktop app for macOS or Windows, or install on iOS. Sign in with your eligible Cursor account and create a Bot teammate.',
			mediaAlt: 'Grok Bot documentation at x.ai/bot',
			deviceMock: 'safari',
			deviceMockContent: 'grok-bot-docs-overview',
			mockUrl: 'x.ai/bot',
			iconName: icons.Terminal.name
		},
		{
			id: 2,
			title: '2. Create a Bot',
			content:
				'Spin up a Bot with its own shared cloud computer — browser, filesystem, and terminal persist across sessions.',
			animatedContent: 'llm-models',
			mediaAlt: 'Create a Grok Bot teammate',
			iconName: icons.Bot.name
		},
		{
			id: 3,
			title: '3. Message from desktop or iOS',
			content:
				'Chat with your Bot from the macOS or Windows app or on iOS. Use / in chat or Settings → Plugins when you need a skill.',
			mediaAlt: 'Grok Bot desktop chat for scheduling requests',
			deviceMock: 'desktop',
			deviceMockContent: 'agent-parallel-schedule',
			iconName: icons.MessageCircle.name
		},
		{
			id: 4,
			title: '4. Install openquok-core skill',
			content:
				'Ask the Bot to install the global CLI on its computer, or curl SKILL.md into /workspace/openquok-core and save it as a skill named openquok-core.',
			mediaAlt: 'Install openquok-core skill and authenticate the OpenQuok CLI',
			deviceMock: 'terminal',
			deviceMockContent: 'openquok-skill-install-grok-bot',
			iconName: icons.OpenQuok.name
		},
		{
			id: 5,
			title: '5. Integrate & customize other skills or MCPs',
			content:
				'Add Bloom, RevenueCat, or any other skill beside openquok-core — optional Connectors/MCP when you need them, CLI-first for scheduling.',
			animatedContent: 'agent-integrations',
			mediaAlt: 'Agent skills and integrations with OpenQuok',
			iconName: icons.Sparkles.name
		}
	],
	featureSections: [
		{
			subtitle: 'Connect once',
			title: 'authenticate on the cloud computer, pick your workspace, chat from desktop securely',
			description:
				'Choose a workspace, connect with OAuth2 — approve in your browser, and credentials stay on the Bot shared computer. Message Grok Bot from desktop or iOS to draft and schedule without opening another app.',
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'openquok-login',
			imageAlt: 'Grok Bot chat guiding OpenQuok OAuth device login and workspace authorization',
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
				'Message Grok Bot on desktop to pull impressions, likes, comments, and shares for any connected channel. Compare performance and schedule more of what already resonates — without opening the dashboard.',
			deviceMock: 'desktop',
			deviceMockContent: 'agent-parallel-analytics',
			imageAlt: 'Grok Bot desktop chat showing OpenQuok platform and post analytics',
			mediaOnRight: true,
			cliCommandsTitle: 'CLI analytics options',
			cliCommands: `# Platform metrics (followers, impressions, engagement)
openquok analytics:platform <integration-uuid> -d 30

# Per-post insights (likes, comments, shares)
openquok analytics:post <post-id> -d 7`
		},
		{
			subtitle: 'Scale what works',
			title: 'when a format hits, scale by adding workspaces and parallel Bots',
			description:
				'Spot a winner in analytics, then spin up another workspace for the next client or brand while Grok Bot queues the next wave on its cloud computer — credentials, channels, and agent context stay isolated as you scale.',
			parallelMocks: [
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-schedule',
					imageAlt: 'First Grok Bot session scheduling posts in parallel'
				},
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-analytics',
					imageAlt: 'Second Grok Bot session pulling live analytics concurrently'
				},
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-schedule',
					imageAlt: 'Grok Bot desktop chat scheduling posts while another session runs analytics'
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
		withTitle: 'OpenQuok + Grok Bot',
		points: [
			{
				pain: 'Copy posts between your AI chat and a separate scheduling tool',
				feature: 'Message Grok Bot from desktop or iOS to draft and schedule'
			},
			{
				pain: 'Siloed API keys and workflows that do not compose with your agent stack',
				feature: 'Credentials stay on the Bot shared cloud computer — workspace isolated'
			},
			{
				pain: 'Always-on integrations that bloat agent context',
				feature: 'Skills load on demand via Plugins or / — keep chat context clean'
			},
			{
				pain: "Locked to one vendor's models or automation layer",
				feature: 'CLI-first openquok-core works beside any other Bot skill or routine'
			},
			{
				pain: 'One workspace mixing every context as you add channels and parallel sessions',
				feature:
					'Multi-workspace isolation — spin up a workspace per context so channels and drafts never cross wires'
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
		subtitle: 'Where you chat',
		title: 'Desktop, mobile, and plugins',
		description:
			'Grok Bot teammates run on a shared cloud computer — message them from macOS, Windows, or iOS, then invoke skills with / in chat or Settings → Plugins:',
		extensionLabel: 'Connectors & MCP (optional)'
	},
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Grok Bot + OpenQuok, answered',
	faqDescription:
		'What Grok Bot is, plan eligibility, how to install openquok-core, shared computer credentials, human approval, and why CLI beats MCP-only for scheduling.',
	faqItems: [
		{
			title: 'What is Grok Bot?',
			description:
				`Grok Bot is an AI teammate product with a shared persistent cloud computer — browser, filesystem, and terminal — for each Bot you create. You message it from macOS, Windows desktop, or iOS, install skills via Settings → Plugins or / in chat, and set up routines for scheduled work. See the ${faqLink(publicFaqHref.grokBotLanding, 'Grok Bot integration')} and ${faqLink(publicFaqHref.agentSetupGuides, 'agent setup guides')}.`
		},
		{
			title: 'Which plans can use Grok Bot?',
			description:
				`Grok Bot requires an eligible subscription such as SuperGrok Heavy, Cursor Ultra, or Cursor Teams Premium. Sign in with your Cursor account when you install the desktop or iOS app. OpenQuok billing is separate — you still need an OpenQuok workspace and connected channels. Plan limits are on ${faqLink(publicFaqHref.pricing, 'Pricing')}.`
		},
		{
			title: 'How do I install the openquok-core skill in Grok Bot?',
			description:
				`Install @openquok/auto-cli on the Bot cloud computer, add openquok-core as a skill, and authenticate once. See the ${faqLink(publicFaqHref.grokBotAgentGuide, 'Grok Bot agent guide')} or the ${faqLink(publicFaqHref.blogGrokBot, 'scheduling walkthrough')}.`
		},
		{
			title: 'Where do OpenQuok credentials live?',
			description:
				`The global CLI and auth files live on the Bot shared cloud computer — the same environment where openquok-core runs shell commands. Your OpenQuok workspace tokens never need to be pasted into chat; use OAuth device flow or a programmatic opo_ token on that computer. See ${faqLink(publicFaqHref.oauthApps, 'OAuth2 for apps')} and ${faqLink(publicFaqHref.publicApi, 'Public API')} docs for token setup.`
		},
		{
			title: 'What can Grok Bot do with OpenQuok?',
			description:
				`Draft and schedule posts, upload media, configure plugs, and pull analytics across your connected channels. See ${faqLink(publicFaqHref.channels, 'supported channels')} and ${faqLink(publicFaqHref.cliManagingPosts, 'CLI post commands')}; openquok-core returns structured JSON for the agent.`
		},
		{
			title: 'Which social media platforms are supported?',
			description:
				`YouTube, TikTok, LinkedIn, and X are available today. Facebook, Instagram, and Threads are coming soon. Connect channels in the OpenQuok web app or follow the ${faqLink(publicFaqHref.socialIntegration, 'channel setup guides')}; see every network on ${faqLink(publicFaqHref.channels, 'Supported channels')}. Grok Bot uses integration UUIDs from openquok integrations:list to target the right accounts.`
		},
		{
			title: 'Does Grok Bot publish immediately or wait for approval?',
			description:
				'Posts created through the CLI land in your OpenQuok workspace as drafts or scheduled items. You can review on the calendar or kanban, move posts through draft and review, and approve what should publish.'
		},
		{
			title: 'Why use Grok Bot with CLI instead of MCP-only?',
			description:
				`openquok-core is CLI-first for repeatable Bot workflows on the shared cloud computer. MCP fits ad hoc editor tools — see ${faqLink(publicFaqHref.cursorLanding, 'OpenQuok for Cursor')} or ${faqLink(publicFaqHref.mcpSetupGuides, 'MCP setup')}. Many teams use both.`
		},
		{
			title: 'How does Grok Bot relate to Cursor?',
			description:
				`Grok Bot is the always-on teammate; ${faqLink(publicFaqHref.cursorLanding, 'Cursor MCP')} is OpenQuok inside Agent and Composer. Same workspace and approval flow — pick Grok Bot for messaging-first volume or Cursor when you stay in the repo. See the ${faqLink(publicFaqHref.blogGrokBot, 'Grok Bot scheduling walkthrough')}.`
		},
		{
			title: 'Is it free to start?',
			description:
				`OpenQuok offers a 7-day free trial for scheduling on ${faqLink(publicFaqHref.pricing, 'Pricing')}. Grok Bot access depends on your xAI or Cursor plan eligibility — install the app, create a Bot, add openquok-core, and begin scheduling from desktop chat.`
		}
	]
} satisfies PublicAgentHostLandingPageViewModel;
