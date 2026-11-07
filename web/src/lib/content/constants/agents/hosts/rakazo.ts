import { icons } from '$data/icons';

import { buildAgentHostPickerFaqDescription } from '$lib/content/constants/agents/decision-scenarios';
import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/agents/types';
import { faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import {
	OPENQUOK_CLI_COMMAND_REFERENCE,
	RAKAZO_SKILL_INSTALL_OPTIONS
} from '$lib/content/constants/agents/cli-command-reference';
import { PUBLIC_AGENT_OPPORTUNITIES_PREVIEW_SECTION } from '$lib/content/constants/agents/general';
import { buildAgentCloudBrowserVsOpenQuokFaqItem } from '$lib/content/constants/agents/agentCloudSchedulingFaq';
import {
	buildPublishApprovalFaqAnswer,
	COMPARISON_PUBLISH_CHOICE_FEATURE,
	WORKFLOW_PUBLISH_CHOICE_SENTENCE
} from '$lib/content/constants/schedulingPublishChoice';

export const rakazoAgent = {
	pageType: 'agent-host',
	slug: 'rakazo',
	agentId: 'rakazo',
	agentLabel: 'Rakazo',
	icon: icons.Rakazo.name,
	available: true,
	metaTitle: 'Rakazo Social Scheduling — Self-Hosted AI Teammates & Sandboxes',
	metaDescription:
		'Run Rakazo on your machine or VPS. Give each bot an isolated computer, add openquok-core, and schedule Facebook, X, LinkedIn, and more from web, desktop, mobile, or Slack. You approve on OpenQuok.',
	hubDescription:
		'Rakazo is an open-source platform for persistent AI teammates you own. Self-host Docker sandboxes, add openquok-core skills, and message bots from Slack or the desktop app. You approve on OpenQuok.',
	keywords: [
		'Rakazo social media',
		'Rakazo scheduler',
		'self-hosted AI agent scheduling',
		'Rakazo vs Grok Bot',
		'Rakazo OpenQuok',
		'openquok-core skill',
		'Apache agent social posts',
		'Docker AI teammate scheduling',
		'Rakazo Slack scheduling',
		'agentic social media scheduler',
		'OpenQuok Rakazo integration'
	],
	heroTitle: 'Schedule social media from Rakazo then you approve',
	heroDescription:
		'Rakazo is an open-source alternative to Grok Bot you run yourself. You get persistent teammates, memory, routines, and a sandboxed browser per bot — on your hardware with your model keys. Add openquok-core on the bot computer, then message from web, desktop, mobile, or Slack. You review drafts on the calendar or kanban.',
	docsPath: '/docs/agent-setup-guides/rakazo',
	skillInstallOptions: RAKAZO_SKILL_INSTALL_OPTIONS,
	workflowSection: {
		subtitle: 'Your bot team',
		title: 'Message Rakazo from desktop, mobile, or Slack',
		description: `Ask a bot to draft and schedule like any other teammate chat. The openquok-core skill runs in its sandbox. It lists channels, attaches media, and queues posts. ${WORKFLOW_PUBLISH_CHOICE_SENTENCE}`,
		deviceMock: 'desktop',
		deviceMockContent: 'agent-parallel-schedule',
		imageAlt: 'Rakazo desktop chat scheduling social posts via OpenQuok'
	},
	audienceSubtitle: 'Built for Rakazo hosts',
	audienceTitle: 'Who connects Rakazo to OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-neutral-300',
			title: 'Self-hosters who want ownership',
			description:
				'Run the stack on Docker locally or on a VPS. You pick the model and keep credentials on your infrastructure.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.Slack.name,
			iconClass: 'text-emerald-300',
			title: 'Slack and mobile operators',
			description:
				'Mention a bot in Slack or reply from iOS or Android while sandboxes keep working on the server.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CalendarClock.name,
			iconClass: 'text-stone-400',
			title: 'Routines at scale',
			description:
				'Save Markdown routines per bot. Pair scheduled work with OpenQuok drafts and approval gates.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	setupStepsSubtitle: 'How it works',
	setupStepsTitle: 'Five steps,to Rakazo + OpenQuok',
	setupSteps: [
		{
			id: 1,
			title: '1. Run Rakazo',
			content:
				'Install published images with Docker, or run from source. Open the web app, create an account, connect a model, and create your first bot with its own computer.',
			mediaAlt: 'Rakazo self-hosting documentation',
			deviceMock: 'safari',
			deviceMockContent: 'rakazo-docs-overview',
			mockUrl: 'rakazo.com',
			iconName: icons.Terminal.name
		},
		{
			id: 2,
			title: '2. Open the bot computer',
			content:
				'Each bot gets an isolated sandbox with browser, shell, and filesystem. Use local Docker sandboxes or a remote provider your operator configures.',
			animatedContent: 'llm-models',
			mediaAlt: 'Rakazo bot sandbox computer',
			iconName: icons.Bot.name
		},
		{
			id: 3,
			title: '3. Message from your surface',
			content:
				'Chat in the web or desktop app, on mobile, or mention the bot in Slack. Context and memory stay with the bot across sessions.',
			mediaAlt: 'Rakazo chat for scheduling requests',
			deviceMock: 'desktop',
			deviceMockContent: 'agent-parallel-schedule',
			iconName: icons.MessageCircle.name
		},
		{
			id: 4,
			title: '4. Install openquok-core',
			content:
				'On the bot computer, install the global CLI and save openquok-core from SKILL.md as a bot skill. You can also add OpenQuok as an HTTPS MCP integration when you prefer tools over CLI.',
			mediaAlt: 'Install openquok-core on a Rakazo bot computer',
			deviceMock: 'terminal',
			deviceMockContent: 'openquok-skill-install-rakazo',
			iconName: icons.OpenQuok.name
		},
		{
			id: 5,
			title: '5. Integrate & customize other skills or MCPs',
			content:
				'Add other skills beside openquok-core. Use Integrations for MCP, OpenAPI, or managed catalogs; keep CLI-first scheduling for volume.',
			animatedContent: 'agent-integrations',
			mediaAlt: 'Rakazo integrations with OpenQuok',
			iconName: icons.Sparkles.name
		}
	],
	featureSections: [
		{
			subtitle: 'Connect once',
			title: 'authenticate on the bot computer, pick your workspace, chat from Slack securely',
			description:
				'Run OAuth device login on the bot sandbox once. Credentials stay on your server. Message from desktop or Slack to draft and schedule without opening another dashboard.',
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'openquok-login',
			imageAlt: 'Rakazo chat guiding OpenQuok OAuth device login and workspace authorization',
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
				'Message your bot to pull impressions, likes, comments, and shares for any connected channel. Compare performance and schedule more of what already resonates — without opening the dashboard.',
			deviceMock: 'desktop',
			deviceMockContent: 'agent-parallel-analytics',
			imageAlt: 'Rakazo chat showing OpenQuok platform and post analytics',
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
		withTitle: 'OpenQuok + Rakazo',
		points: [
			{
				pain: 'Copy posts between your AI chat and a separate scheduling tool',
				feature: 'Message Rakazo from desktop, mobile, or Slack to draft and schedule'
			},
			{
				pain: 'Vendor cloud computers that hold your credentials offsite',
				feature: 'Sandboxes run on infrastructure you control — workspace isolated per bot'
			},
			{
				pain: 'Always-on integrations that bloat agent context',
				feature: 'Skills and MCP load on demand — keep chat context clean'
			},
			{
				pain: "Locked to one vendor's models or automation layer",
				feature: 'Bring your own model keys; CLI-first openquok-core beside any other skill'
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
		title: 'Web, desktop, mobile, and Slack',
		description:
			'Rakazo bots keep persistent sandboxes. Message them from the web app, Electron desktop, Expo mobile, or Slack when your operator enables messaging:',
		extensionLabel: 'MCP & integrations (optional)'
	},
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Rakazo + OpenQuok, answered',
	faqDescription:
		'What Rakazo is, self-hosting basics, sandbox computers, skill install, credential safety, human approval, and how it compares to managed teammates.',
	faqItems: [
		{
			title: 'What is Rakazo?',
			description: `Rakazo is an open-source platform for persistent AI teammates with isolated computers, memory, and routines. You self-host the API and worker, connect your own model keys, and message bots from web, desktop, mobile, or Slack. See the ${faqLink(publicFaqHref.rakazoLanding, 'Rakazo integration')} and ${faqLink(publicFaqHref.agentSetupGuides, 'agent setup guides')}.`
		},
		{
			title: 'How is Rakazo different from Grok Bot?',
			description: buildAgentHostPickerFaqDescription('rakazo')
		},
		{
			title: 'When should I choose Grok Bot over Rakazo?',
			description: `Choose ${faqLink(publicFaqHref.grokBotLanding, 'Grok Bot')} when you want a managed xAI cloud desktop with Cursor, iOS, and plugin installs — no API server, worker, or database to operate. Choose Rakazo when you need Apache-2.0 source, self-hosted sandboxes, and your own model keys. Both pair with openquok-core for scheduling; see the ${faqLink(publicFaqHref.blogGrokBotVsOpenclaw, 'agent host comparison guide')}.`
		},
		{
			title: 'How do I install the openquok-core skill on Rakazo?',
			description: `Install @openquok/auto-cli on the bot sandbox, save SKILL.md as a bot skill, and authenticate once. Optional: add OpenQuok as an HTTPS MCP server under Integrations. See the ${faqLink(publicFaqHref.rakazoAgentGuide, 'Rakazo agent guide')}.`
		},
		{
			title: 'Where do OpenQuok credentials live?',
			description: `The global CLI and auth files live on the bot sandbox — the same environment where openquok-core runs shell commands. Tokens stay off chat threads; use OAuth device flow or a programmatic opo_ token on that computer. See ${faqLink(publicFaqHref.oauthApps, 'OAuth2 for apps')} and ${faqLink(publicFaqHref.publicApi, 'Public API')} docs.`
		},
		{
			title: 'What can Rakazo do with OpenQuok?',
			description: `Draft and schedule posts, upload media, configure plugs, and pull analytics across your connected channels. See ${faqLink(publicFaqHref.channels, 'supported channels')} and ${faqLink(publicFaqHref.cliManagingPosts, 'CLI post commands')}; openquok-core returns structured JSON for the agent.`
		},
		buildAgentCloudBrowserVsOpenQuokFaqItem('Rakazo'),
		{
			title: 'Which social media platforms are supported?',
			description: `Facebook, Instagram, Threads, YouTube, TikTok, LinkedIn, and X are supported today. Connect channels in the OpenQuok web app or follow the ${faqLink(publicFaqHref.socialIntegration, 'channel setup guides')}; see every network on ${faqLink(publicFaqHref.channels, 'Supported channels')}. Bots use integration UUIDs from openquok integrations:list to target the right accounts.`
		},
		{
			title: 'Does Rakazo publish immediately or wait for approval?',
			description: buildPublishApprovalFaqAnswer('Rakazo')
		},
		{
			title: 'Why use Rakazo with CLI instead of MCP-only?',
			description: `openquok-core is CLI-first for repeatable bot workflows on the sandbox. MCP fits ad hoc tool calls from Integrations — see ${faqLink(publicFaqHref.mcpSetupGuides, 'MCP setup')}. Many teams use both.`
		},
		{
			title: 'Is it free to start?',
			description: `OpenQuok offers a 7-day free trial on ${faqLink(publicFaqHref.pricing, 'Pricing')}. Rakazo software is Apache-2.0 — you pay for your own server and model usage. Install Rakazo, add openquok-core, and begin scheduling from chat.`
		}
	]
} satisfies PublicAgentHostLandingPageViewModel;
