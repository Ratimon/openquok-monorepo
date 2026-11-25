import { icons } from '$data/icons';

import { buildAgentHostPickerFaqDescription } from '$lib/content/constants/agents/decision-scenarios';
import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/agents/types';
import { faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import {
	MAUSBOT_SKILL_INSTALL_OPTIONS,
	OPENQUOK_CLI_COMMAND_REFERENCE
} from '$lib/content/constants/agents/cli-command-reference';
import { PUBLIC_AGENT_OPPORTUNITIES_PREVIEW_SECTION } from '$lib/content/constants/agents/general';
import { buildAgentCloudBrowserVsOpenQuokFaqItem } from '$lib/content/constants/agents/agentCloudSchedulingFaq';
import {
	buildPublishApprovalFaqAnswer,
	COMPARISON_PUBLISH_CHOICE_FEATURE,
	WORKFLOW_PUBLISH_CHOICE_SENTENCE
} from '$lib/content/constants/schedulingPublishChoice';

export const mausbotAgent = {
	pageType: 'agent-host',
	slug: 'mausbot',
	agentId: 'mausbot',
	agentLabel: 'MausBot',
	icon: icons.MausBot.name,
	available: true,
	metaTitle: 'MausBot Social Scheduling — Open-Source Multi-Bot Desktop & BYO AI',
	metaDescription:
		'Run a team of bots in the free MausBot desktop app. Connect Claude, Codex, or Grok with subscriptions you already pay for. Add openquok-core, schedule social posts from chat or automations, and approve on OpenQuok.',
	hubDescription:
		'MausBot is a free, open-source chat app for many bots on your computer. Pick a model per bot, add openquok-core, and queue social drafts from desktop or phone. You approve on OpenQuok.',
	keywords: [
		'MausBot social media',
		'MausBot scheduler',
		'MausBot open source',
		'MausBot BYO AI',
		'MausBot vs Grok Bot',
		'MausBot OpenQuok',
		'openquok-core skill',
		'multi-bot social scheduling',
		'Claude Code Codex Grok MausBot',
		'OpenQuok MausBot integration'
	],
	heroTitle: 'Schedule social media from MausBot then you approve',
	heroDescription:
		'MausBot runs Claude Code, Codex, Grok, and other agent engines on your machine with your logins. Give a bot a working folder, add openquok-core, and ask it to draft and schedule from the bot list or automations. You review and approve on the calendar or kanban.',
	docsPath: '/docs/agent-setup-guides/mausbot',
	skillInstallOptions: MAUSBOT_SKILL_INSTALL_OPTIONS,
	workflowSection: {
		subtitle: 'Your bot team',
		title: 'Many bots, one chat app, openquok-core for social',
		description: `Pin a scheduling bot beside SEO or launch bots. Each bot keeps its own engine and model. openquok-core runs the CLI on this Mac, a bot cloud computer, or your always-on host. ${WORKFLOW_PUBLISH_CHOICE_SENTENCE}`,
		deviceMock: 'desktop',
		deviceMockContent: 'agent-parallel-schedule',
		imageAlt: 'MausBot desktop chat scheduling social posts via OpenQuok'
	},
	audienceSubtitle: 'Built for MausBot users',
	audienceTitle: 'Who connects MausBot to OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-zinc-400',
			title: 'Open-source desktop operators',
			description:
				'You want a free Apache-licensed app on macOS, Windows, or Linux with many parallel bots.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.Sparkles.name,
			iconClass: 'text-neutral-300',
			title: 'BYO subscription users',
			description:
				'You already pay for Claude, ChatGPT, or Grok. You route bots through native CLIs without a proxy.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CalendarClock.name,
			iconClass: 'text-stone-400',
			title: 'Automation-first publishers',
			description:
				'You wire weekday runs or connected-app triggers, then let a bot queue social drafts for approval.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	setupStepsSubtitle: 'How it works',
	setupStepsTitle: 'Five steps,to MausBot + OpenQuok',
	setupSteps: [
		{
			id: 1,
			title: '1. Install MausBot',
			content:
				'Download the desktop app for your platform from mausbot.com. Connect one agent engine in App settings → Agent engines. Companion phone apps pair to the computer that hosts your bots.',
			mediaAlt: 'MausBot download and getting started',
			deviceMock: 'safari',
			deviceMockContent: 'mausbot-docs-overview',
			mockUrl: 'mausbot.com',
			iconName: icons.Terminal.name
		},
		{
			id: 2,
			title: '2. Create a scheduling bot',
			content:
				'Select New bot. Pick an engine and model. Set a working folder when the bot must read or write files—for example openquok-core and media assets.',
			animatedContent: 'llm-models',
			mediaAlt: 'Create a MausBot with Claude, Codex, or Grok',
			iconName: icons.Bot.name
		},
		{
			id: 3,
			title: '3. Chat or automate',
			content:
				'Message the bot from the bot list or add an automation for recurring social workflows. Start with one clear scheduling task before you scale to a full bot team.',
			mediaAlt: 'MausBot chat and automations for scheduling',
			deviceMock: 'desktop',
			deviceMockContent: 'agent-parallel-schedule',
			iconName: icons.MessageCircle.name
		},
		{
			id: 4,
			title: '4. Install openquok-core',
			content:
				'Install @openquok/auto-cli on the computer the bot uses. Add SKILL.md to the working folder or record a skill after a successful scheduling session.',
			mediaAlt: 'Install openquok-core and authenticate the OpenQuok CLI',
			deviceMock: 'terminal',
			deviceMockContent: 'openquok-skill-install-mausbot',
			iconName: icons.OpenQuok.name
		},
		{
			id: 5,
			title: '5. Integrate & customize other skills or MCPs',
			content:
				'Use Composio connected apps when you need Gmail or Slack beside OpenQuok. Add more skills when native connectors are missing.',
			animatedContent: 'agent-integrations',
			mediaAlt: 'MausBot skills and connected apps with OpenQuok',
			iconName: icons.Sparkles.name
		}
	],
	featureSections: [
		{
			subtitle: 'Connect once',
			title: 'authenticate on the bot computer, pick your workspace, chat securely',
			description:
				'Run OAuth device login once on the machine that runs shell commands for your bot. Credentials stay local under your MausBot data directory. Ask the bot to draft and schedule without opening another dashboard.',
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'openquok-login',
			imageAlt: 'MausBot chat guiding OpenQuok OAuth device login and workspace authorization',
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
				'Ask your scheduling bot to pull impressions, likes, comments, and shares for any connected channel. Compare performance and schedule more of what already resonates — without opening the dashboard.',
			deviceMock: 'desktop',
			deviceMockContent: 'agent-parallel-analytics',
			imageAlt: 'MausBot chat showing OpenQuok platform and post analytics',
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
		withTitle: 'OpenQuok + MausBot',
		points: [
			{
				pain: 'Copy posts between your AI chat and a separate scheduling tool',
				feature: 'Message MausBot bots from desktop or phone to draft and schedule'
			},
			{
				pain: 'Locked to one model vendor inside the scheduler',
				feature: 'Pick Claude, Codex, Grok, or other engines per bot with BYO logins'
			},
			{
				pain: 'One bot thread with no specialist handoffs',
				feature: 'Run SEO, launch, and scheduling bots in parallel; each keeps its own brain'
			},
			{
				pain: 'Skills hard to capture after a good run',
				feature: 'Record CLI steps into a skill, including openquok-core workflows'
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
		title: 'Desktop, phone, and automations',
		description:
			'Bots stay on the computer or cloud host you configure. Chat from the desktop app or companion phone. Optional always-on cloud keeps bots working when your laptop sleeps:',
		extensionLabel: 'Engines, skills & connected apps'
	},
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'MausBot + OpenQuok, answered',
	faqDescription:
		'What MausBot is, open-source licensing, BYO engines, multi-bot workflows, skill install, and how it compares to other agent hosts.',
	faqItems: [
		{
			title: 'What is MausBot?',
			description: `MausBot is a free, open-source desktop app for a team of AI bots. You chat like a messaging app. Each bot has its own name, engine, model, working folder, and automations. Data defaults to local storage on your computer. Optional paid cloud plans give bots their own always-on computers. See the ${faqLink(publicFaqHref.mausbotLanding, 'MausBot integration')} and ${faqLink(publicFaqHref.agentSetupGuides, 'agent setup guides')}.`
		},
		{
			title: 'How is MausBot model-agnostic?',
			description: `You connect supported agent engines with the subscription or API key you already pay for. MausBot can run Claude Code, Codex, Grok, Cursor, Kimi, Antigravity, OpenCode, and more through native CLIs on your machine—not a single vendor proxy. Switch a bot's model mid-conversation. Need an editor MCP path too? See ${faqLink(publicFaqHref.mcpSetupGuides, 'MCP setup guides')} and the ${faqLink(publicFaqHref.agents, 'Agents hub')}.`
		},
		{
			title: 'How do MausBot multi-bot workflows work?',
			description: `You can run many bots at once—each with a role like SEO Growth or launch copy. Bots can share connected apps through Composio. Ask your scheduling bot to draft posts with openquok-core after specialists finish briefs. See the ${faqLink(publicFaqHref.mausbotAgentGuide, 'MausBot agent guide')} and ${faqLink(publicFaqHref.cliGettingStarted, 'CLI getting started')}. Review drafts on the ${faqLink(publicFaqHref.docsKanban, 'kanban board')} or follow ${faqLink(publicFaqHref.docsApprovals, 'post approvals')}.`
		},
		{
			title: 'When should I pick MausBot over Grok Bot or OpenBot?',
			description: buildAgentHostPickerFaqDescription('mausbot')
		},
		{
			title: 'How do I install the openquok-core skill on MausBot?',
			description: `Install @openquok/auto-cli on the computer where the bot executes shell commands—your Mac, a bot cloud desktop, or an always-on host. Fetch SKILL.md into the bot working folder, or use the skill recorder after the bot runs openquok successfully. See the ${faqLink(publicFaqHref.mausbotAgentGuide, 'MausBot agent guide')}.`
		},
		{
			title: 'Where do OpenQuok credentials live?',
			description: `The global CLI and auth files stay on the machine that runs commands for your bot—not inside chat transcripts. Use OAuth device flow or a programmatic opo_ token on that computer. See ${faqLink(publicFaqHref.oauthApps, 'OAuth2 for apps')} and ${faqLink(publicFaqHref.publicApi, 'Public API')} docs.`
		},
		{
			title: 'What can MausBot do with OpenQuok?',
			description: `Draft and schedule posts, upload media, configure plugs, and pull analytics across your connected channels. See ${faqLink(publicFaqHref.channels, 'supported channels')} and ${faqLink(publicFaqHref.cliManagingPosts, 'CLI post commands')}; openquok-core returns structured JSON for the bot.`
		},
		buildAgentCloudBrowserVsOpenQuokFaqItem('MausBot'),
		{
			title: 'Which social media platforms are supported?',
			description: `Facebook, Instagram, Threads, YouTube, TikTok, LinkedIn, and X are supported today. Connect channels in the OpenQuok web app or follow the ${faqLink(publicFaqHref.socialIntegration, 'channel setup guides')}; see every network on ${faqLink(publicFaqHref.channels, 'Supported channels')}. Bots use integration UUIDs from openquok integrations:list to target the right accounts.`
		},
		{
			title: 'Does MausBot publish immediately or wait for approval?',
			description: buildPublishApprovalFaqAnswer('MausBot')
		},
		{
			title: 'Is MausBot free for commercial use?',
			description: `The MausBot app is free and open source under Apache 2.0. You still pay model providers for usage. Optional MausBot Cloud plans bill separately for always-on computers and connected-app events. Read the license and cloud terms before production social workflows.`
		},
		{
			title: 'Is it free to start?',
			description: `OpenQuok offers a 7-day free trial on ${faqLink(publicFaqHref.pricing, 'Pricing')}. MausBot software is free to download; model usage follows your provider plans. Install MausBot, add openquok-core, and begin scheduling from chat.`
		}
	]
} satisfies PublicAgentHostLandingPageViewModel;