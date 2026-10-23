import { icons } from '$data/icons';

import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/agents/types';
import { faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import {
	GEMINI_SKILL_INSTALL_OPTIONS,
	OPENQUOK_CLI_COMMAND_REFERENCE
} from '$lib/content/constants/agents/cli-command-reference';
import { PUBLIC_AGENT_OPPORTUNITIES_PREVIEW_SECTION } from '$lib/content/constants/agents/general';
import {
	buildPublishApprovalFaqAnswer,
	COMPARISON_PUBLISH_CHOICE_FEATURE,
	WORKFLOW_PUBLISH_CHOICE_SENTENCE
} from '$lib/content/constants/schedulingPublishChoice';

export const geminiAgent = {
	pageType: 'agent-host',
	slug: 'gemini',
	agentId: 'gemini',
	agentLabel: 'Gemini Task',
	icon: icons.Gemini.name,
	available: true,
	metaTitle: 'Gemini Task Social Scheduling — Connected Apps, Skills & Workspace',
	metaDescription:
		'Connect OpenQuok to Gemini Task in the Gemini app. Add OpenQuok as a custom Connected App (MCP), use skills and schedules, and draft social posts from Google Workspace context. Requires Google AI Pro or Ultra on a personal account. You approve on OpenQuok.',
	hubDescription:
		'Gemini Task runs multi-step work in the Gemini app — formerly marketed as Gemini Spark. Connect OpenQuok MCP in Connected Apps, or wire skills for recurring social drafts. You approve on the calendar or kanban.',
	keywords: [
		'Gemini Task social media',
		'Gemini Spark scheduling',
		'Gemini Connected Apps MCP',
		'OpenQuok Gemini integration',
		'Google AI Pro Ultra agent',
		'Gemini Workspace scheduling',
		'Gemini Chrome auto browse',
		'schedule social media Gemini',
		'Gemini skills OpenQuok',
		'Gemini Task YouTube launch'
	],
	heroTitle: 'Schedule social media from Gemini Task then you approve',
	heroDescription:
		'Gemini Task is Google’s personal agent in the Gemini app. Click Task below the prompt, connect Google Workspace and OpenQuok, and assign work that lists channels, drafts copy, and queues posts. Sensitive publishes still wait for you on OpenQuok.',
	docsPath: '/docs/agent-setup-guides/gemini',
	skillInstallOptions: GEMINI_SKILL_INSTALL_OPTIONS,
	workflowSection: {
		subtitle: 'Your Gemini task thread',
		title: 'Assign tasks, monitor progress, keep approval on OpenQuok',
		description:
			`Describe the outcome in Task mode. Gemini can call OpenQuok MCP tools, reuse skills with @, and run on a schedule. ${WORKFLOW_PUBLISH_CHOICE_SENTENCE}`,
		deviceMock: 'desktop',
		deviceMockContent: 'agent-parallel-schedule',
		imageAlt: 'Gemini Task desktop thread scheduling social posts via OpenQuok'
	},
	audienceSubtitle: 'Built for Gemini subscribers',
	audienceTitle: 'Who connects Gemini to OpenQuok?',
	audienceCards: [
		{
			iconName: icons.YouTube.name,
			iconClass: 'text-red-400',
			title: 'YouTube and Google creators',
			description:
				'Use Gemini Task with Drive and YouTube. Turn launch notes into drafts; you approve publish.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CalendarClock.name,
			iconClass: 'text-sky-300',
			title: 'Scheduled operators',
			description:
				'Use Gemini skills and task schedules for ops work. Add OpenQuok MCP to queue social drafts on a cadence.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-blue-300',
			title: 'Workspace-first marketers',
			description:
				'Connected Apps reach Calendar, Docs, and Sheets. OpenQuok adds social scheduling in Gemini.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	setupStepsSubtitle: 'How it works',
	setupStepsTitle: 'Five steps,to Gemini + OpenQuok',
	setupSteps: [
		{
			id: 1,
			title: '1. Open Gemini Task',
			content:
				'Sign in at gemini.google.com with a personal Google Account. Click Task under the prompt box. Google renamed the former Gemini Spark experience to Task; your existing task threads stay in the sidebar.',
			mediaAlt: 'Gemini Task overview in the Gemini app',
			deviceMock: 'safari',
			deviceMockContent: 'gemini-docs-overview',
			mockUrl: 'gemini.google.com',
			iconName: icons.Terminal.name
		},
		{
			id: 2,
			title: '2. Connect Google Workspace',
			content:
				'Open Settings → Connected Apps and turn on the Google services Gemini may use for tasks, including Gmail, Calendar, Drive, Docs, Sheets, and YouTube when you need them.',
			animatedContent: 'llm-models',
			mediaAlt: 'Gemini Connected Apps for Google Workspace',
			iconName: icons.Google.name
		},
		{
			id: 3,
			title: '3. Add OpenQuok MCP',
			content:
				'Under Custom apps, add your OpenQuok MCP server URL from Developers → Access. Google only lets you link custom MCP on the web app; the same Connected App works in Gemini mobile after you connect once.',
			mediaAlt: 'Add OpenQuok as a Gemini custom Connected App',
			deviceMock: 'desktop',
			deviceMockContent: 'agent-parallel-schedule',
			iconName: icons.OpenQuok.name
		},
		{
			id: 4,
			title: '4. Optional: build a skill',
			content:
				'Save openquok-core instructions as a Gemini skill. In a task, type @ and pick the skill when you want repeatable scheduling behavior.',
			mediaAlt: 'Gemini skill referenced from a task thread',
			iconName: icons.Sparkles.name
		},
		{
			id: 5,
			title: '5. Verify channels, then queue drafts',
			content:
				'Ask Gemini to list OpenQuok integrations and publishing rules before it schedules. Keep results as drafts until you approve on OpenQuok.',
			animatedContent: 'agent-integrations',
			mediaAlt: 'Validate OpenQuok channels before scheduling from Gemini',
			iconName: icons.Lock.name
		}
	],
	featureSections: [
		{
			subtitle: 'Connect once',
			title: 'MCP in Connected Apps, workspace token, tasks on web and mobile',
			description:
				'Paste the hosted OpenQuok MCP URL once in gemini.google.com. Gemini Task threads on phone and desktop can call the same tools. Rotate tokens from Developers → Access if you revoke access.',
			deviceMock: 'desktop',
			deviceMockContent: 'openquok-login',
			imageAlt: 'Gemini Connected Apps guiding OpenQuok MCP setup',
			mediaOnRight: true,
			cliCommandsTitle: 'MCP URL (from Developers → Access)',
			cliCommands: `# Copy the MCP server URL shown for your workspace — do not share it in public chat.
# Custom apps: gemini.google.com → Settings → Connected Apps → Add a custom app`
		},
		{
			subtitle: 'Kanban + smart filters',
			title: 'Review every AI draft, sign off confidently, before it goes live',
			description:
				'Move agent-generated posts from draft to review to scheduled on a kanban board — with the same smart filters as your calendar. Approve quality at scale instead of trusting autopilot.',
			bentoId: 'agent-multi-platform-bulk-scheduling',
			mediaOnRight: false,
			cliCommandsTitle: 'Public API (when tasks call REST directly)',
			cliCommands: `export OPENQUOK_API_KEY=opo_your_programmatic_token
openquok integrations:list
openquok posts:create -c "…" -s "…" -t draft -i "<integration-id>"`
		},
		{
			subtitle: 'Analytics',
			title: 'Ask what worked, see winners, and adapt from Task',
			description:
				'Assign a follow-up task to pull impressions, likes, comments, and shares for any connected channel. Compare performance and schedule more of what already resonates.',
			deviceMock: 'desktop',
			deviceMockContent: 'agent-parallel-analytics',
			imageAlt: 'Gemini Task thread showing OpenQuok analytics',
			mediaOnRight: true,
			cliCommandsTitle: 'CLI analytics options',
			cliCommands: `openquok analytics:platform <integration-id> -d 30
openquok analytics:post <post-id> -d 7`
		},
		{
			subtitle: 'Scale what works',
			title: 'parallel tasks, skills, and schedules for the next launch wave',
			description:
				'Gemini can run background task threads while you work elsewhere. Spin up another OpenQuok workspace for the next client and keep credentials isolated as you scale.',
			parallelMocks: [
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-schedule',
					imageAlt: 'Gemini task scheduling posts in parallel'
				},
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-analytics',
					imageAlt: 'Second Gemini task pulling live analytics'
				}
			],
			mediaOnRight: false,
			cliCommandsTitle: 'Parallel workspaces',
			cliCommands: `# Use separate API keys per brand when tasks run in parallel
openquok posts:list --status draft`
		}
	],
	opportunitiesPreviewSection: PUBLIC_AGENT_OPPORTUNITIES_PREVIEW_SECTION,
	comparisonSection: {
		subtitle: 'comparisons',
		title: 'agent-native scheduling, not another dashboard',
		description:
			'Most social scheduler SaaS keeps you in a browser tab. OpenQuok is built for agents',
		withoutTitle: 'Typical social scheduler SaaS',
		withTitle: 'OpenQuok + Gemini Task',
		points: [
			{
				pain: 'Copy posts between Gemini chat and a separate scheduling tool',
				feature: 'Assign Gemini tasks that call OpenQuok MCP tools in place'
			},
			{
				pain: 'Workspace context stuck in Docs while social lives elsewhere',
				feature: 'Connected Apps bridge Gmail, Drive, and OpenQuok in one task thread'
			},
			{
				pain: 'Autopilot publishing with no human checkpoint',
				feature: COMPARISON_PUBLISH_CHOICE_FEATURE
			},
			{
				pain: 'One API key mixed across every client',
				feature:
					'Multi-workspace isolation — scoped tokens per brand so drafts never cross wires'
			},
			{
				pain: 'Terminal MCP clients confused with the consumer Gemini agent',
				feature:
					'Clear split: Gemini Task here; Android Studio and Antigravity CLI MCP guides stay separate'
			}
		]
	},
	commandReferenceSection: {
		subtitle: 'CLI & API',
		title: 'Command reference',
		description:
			'When a task uses the public API or openquok-core skill content, these commands match the hosted MCP tools.',
		commands: OPENQUOK_CLI_COMMAND_REFERENCE
	},
	supportedChannelsSection: {
		subtitle: 'Where you work',
		title: 'Web, mobile, Workspace, and MCP',
		description:
			'Gemini Task meets you in the Gemini app on web, iOS, Android, and Mac. OpenQuok connects through Connected Apps (MCP) and optional skills:',
		extensionLabel: 'OpenQuok surfaces'
	},
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Gemini Task + OpenQuok, answered',
	faqDescription:
		'What Gemini Task is, Google AI plan eligibility, Spark rename, Connected Apps MCP, skills, Chrome browsing, and OpenQuok approval.',
	faqItems: [
		{
			title: 'What is Gemini Task?',
			description:
				`Gemini Task is the personal agent mode in the Gemini app. You click Task under the prompt to assign multi-step work with skills, schedules, and Connected Apps. Google renamed the earlier Gemini Spark branding to Task; existing tasks remain in the sidebar. See ${faqLink(publicFaqHref.geminiAgentGuide, 'Gemini setup guide')}, Google’s agent overview at https://gemini.google/overview/agent/spark/, and https://support.google.com/gemini/answer/17094507 for tasks and workflows.`
		},
		{
			title: 'Which plans can use Gemini Task?',
			description:
				`Gemini Task requires a ${faqLink('https://gemini.google/subscriptions/', 'Google AI Pro or Google AI Ultra')} subscription on a personal Google Account. Google documents Tasks in Gemini, Connected Apps, and skills for those paid plans in ${faqLink('https://support.google.com/gemini/answer/16275805', 'Gemini Apps limits and upgrades')}; full task requirements are in ${faqLink('https://support.google.com/gemini/answer/17094507', 'Manage tasks & workflows in Gemini Apps')}. OpenQuok billing is separate — you still need an OpenQuok workspace and connected channels. OpenQuok plan limits are on ${faqLink(publicFaqHref.pricing, 'Pricing')}.`
		},
		{
			title: 'Who can use Gemini Task?',
			description:
				`Beyond a Google AI Pro or Ultra plan, Google requires age 18+, Keep Activity on, and Personal Intelligence opt-in on a personal account (not work or school). Tasks are not available in the European Economic Area, Nigeria, Switzerland, or the United Kingdom yet. See ${faqLink('https://support.google.com/gemini/answer/17094507', 'Google’s tasks help article')} for the current eligibility and region list.`
		},
		{
			title: 'How do I connect OpenQuok to Gemini?',
			description:
				`On gemini.google.com, open Settings → Connected Apps (or Personal Intelligence → Connected Apps), add a custom app under Custom apps, and paste your OpenQuok MCP server URL from ${faqLink(publicFaqHref.docsDevelopers, 'Developers → Access')}. Link custom MCP on the web only; standard MCP URLs; mobile can use the app after that. See ${faqLink('https://support.google.com/gemini/answer/17209137', 'Google’s custom apps guide')}, ${faqLink(publicFaqHref.geminiAgentGuide, 'Gemini setup guide')}, and ${faqLink(publicFaqHref.mcpSetupGuides, 'MCP guides')}.`
		},
		{
			title: 'Can Gemini Task schedule YouTube or other social posts?',
			description:
				`Yes — when your OpenQuok workspace has the channel connected. Ask a task to list integrations, draft copy, and queue drafts or schedules through MCP tools. You approve publishes on OpenQuok. ${faqLink(publicFaqHref.channels, 'Supported channels')} include YouTube as a natural fit for Google users.`
		},
		{
			title: 'Does Gemini browse the web for tasks?',
			description:
				'Google documents that tasks can use your local Chrome browser (Gemini in Chrome auto browse on desktop) or a remote browser in the cloud. Web tasks ask for confirmation before browsing and may pause for you to sign in on sensitive steps.'
		},
		{
			title: 'What are Gemini skills and schedules?',
			description:
				'Skills are reusable instructions you reference with @ in a task. Schedules run tasks on a time or condition. They are separate from chat schedules. Google groups Tasks, Skills, and Schedules together for long-running agent work.'
		},
		{
			title: 'Are custom Connected Apps available in every language and country?',
			description:
				`Google documents custom Connected Apps (MCP URLs you add yourself) as English-only in the Gemini app today, linkable only on the web, and for now limited to personal accounts that are 18+ and in the United States, with Keep Activity on. Task mode has separate regional rules. See ${faqLink('https://support.google.com/gemini/answer/17209137', 'Connect & manage custom apps')} and ${faqLink('https://support.google.com/gemini/answer/17094507', 'Manage tasks & workflows')}.`
		},
		{
			title: 'Does Gemini publish immediately or wait for approval?',
			description: buildPublishApprovalFaqAnswer('Gemini Task')
		},
		{
			title: 'Is it free to start on OpenQuok?',
			description:
				`OpenQuok offers a 7-day free trial on ${faqLink(publicFaqHref.pricing, 'Pricing')}. Gemini Task requires a paid Google AI plan from Google; connect OpenQuok once your Gemini account has Task access.`
		}
	]
} satisfies PublicAgentHostLandingPageViewModel;
