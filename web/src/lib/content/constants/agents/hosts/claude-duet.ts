import { icons } from '$data/icons';

import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/agents/types';
import { faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import {
	CLAUDE_DUET_SKILL_INSTALL_OPTIONS,
	OPENQUOK_CLI_COMMAND_REFERENCE
} from '$lib/content/constants/agents/cli-command-reference';
import { PUBLIC_AGENT_OPPORTUNITIES_PREVIEW_SECTION } from '$lib/content/constants/agents/general';
import { buildAgentCloudBrowserVsOpenQuokFaqItem } from '$lib/content/constants/agents/agentCloudSchedulingFaq';
import {
	buildPublishApprovalFaqAnswer,
	COMPARISON_PUBLISH_CHOICE_FEATURE,
	WORKFLOW_PUBLISH_CHOICE_SENTENCE
} from '$lib/content/constants/schedulingPublishChoice';

export const claudeDuetAgent = {
	pageType: 'agent-host',
	slug: 'claude-duet',
	agentId: 'claude-duet',
	agentLabel: 'Claude Duet',
	icon: icons.ClaudeDuet.name,
	available: true,
	metaTitle: 'Claude Duet Social Scheduling — Proactive Agent & Virtual Machine',
	metaDescription:
		'Add openquok-core to Claude Duet on iOS, Android, or claude.ai. Duet runs background tasks on its virtual machine, lists OpenQuok channels, and queues social drafts. You approve on the calendar or kanban.',
	hubDescription:
		'Claude Duet is Anthropic’s proactive agent app. It carries your memory, skills, and connectors from Claude. Add openquok-core so Duet drafts and schedules posts while you review on OpenQuok.',
	keywords: [
		'Claude Duet social media',
		'Claude Duet scheduling',
		'Anthropic proactive agent',
		'Claude Duet vs Claude Code',
		'Claude Duet vs Claude Cowork',
		'Claude Duet vs Grok Bot',
		'openquok-core Claude skill',
		'Claude virtual machine scheduling',
		'Claude Duet morning brief social',
		'OpenQuok Claude Duet integration',
		'schedule social media Claude Duet'
	],
	heroTitle: 'Schedule social media from Claude Duet then you approve',
	heroDescription:
		'Claude Duet messages you first — morning briefs, background checks, and tasks on its virtual machine. Reply by text or voice on iOS, Android, or claude.ai. Add openquok-core so it lists channels and queues social posts while you approve on the calendar or kanban.',
	docsPath: '/docs/agent-setup-guides/claude-duet',
	skillInstallOptions: CLAUDE_DUET_SKILL_INSTALL_OPTIONS,
	workflowSection: {
		subtitle: 'Your proactive partner',
		title: 'One thread on mobile, web, and voice',
		description:
			`Hand Duet a scheduling task in the same thread as your other work. The openquok-core skill runs on its virtual machine. It lists integrations, attaches media, and queues posts. ${WORKFLOW_PUBLISH_CHOICE_SENTENCE}`,
		deviceMock: 'iphone-15-pro',
		deviceMockContent: 'agent-chat-schedule',
		imageAlt: 'Claude Duet chat scheduling social posts via OpenQuok'
	},
	audienceSubtitle: 'Built for Claude Pro and Max subscribers',
	audienceTitle: 'Who connects Claude Duet to OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CalendarClock.name,
			iconClass: 'text-amber-300',
			title: 'Operators who want proactive nudges',
			description:
				'You want a partner that flags calendar conflicts and drafts follow-ups. Pair Duet’s briefs with OpenQuok so social publishes still wait for your approval.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.Phone.name,
			iconClass: 'text-orange-300',
			title: 'Mobile-first founders',
			description:
				'You reply on iOS or Android between meetings. Ask Duet to queue launch posts without opening a separate scheduler app.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-stone-300',
			title: 'Small business owners in Claude',
			description:
				'You wear every hat—support, books, and marketing—from one Claude account. Teach Duet the openquok-core skill so launch posts stay in the same thread as the rest of your work.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	setupStepsSubtitle: 'How it works',
	setupStepsTitle: 'Five steps,to Claude Duet + OpenQuok',
	setupSteps: [
		{
			id: 1,
			title: '1. Join the Claude Duet preview',
			content:
				'Claude Duet is a research preview for US Claude Pro and Max subscribers. Install the Claude Duet app on iOS or Android, or open claude.ai when Duet is enabled for your account.',
			mediaAlt: 'Claude Duet product overview',
			deviceMock: 'safari',
			deviceMockContent: 'claude-duet-docs-overview',
			mockUrl: 'claude.com',
			iconName: icons.Terminal.name
		},
		{
			id: 2,
			title: '2. Connect the apps you already use',
			content:
				'Duet inherits connectors and skills from your Claude account. Turn on the workplace apps you want in morning briefs before you add social scheduling.',
			animatedContent: 'llm-models',
			mediaAlt: 'Claude Duet connected apps and skills',
			iconName: icons.ClaudeGlyph.name
		},
		{
			id: 3,
			title: '3. Message from phone or browser',
			content:
				'Reply in the ongoing Duet thread by typing or voice. Ask for a channel list, draft copy, or a queued post — same conversation as your other tasks.',
			mediaAlt: 'Claude Duet mobile thread for scheduling requests',
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'agent-chat-schedule',
			iconName: icons.MessageCircle.name
		},
		{
			id: 4,
			title: '4. Install openquok-core',
			content:
				'Ask Duet to install @openquok/auto-cli on its virtual machine, or curl SKILL.md and save openquok-core to your Claude skills library.',
			mediaAlt: 'Install openquok-core on Claude Duet virtual machine',
			deviceMock: 'terminal',
			deviceMockContent: 'openquok-skill-install-claude-duet',
			iconName: icons.OpenQuok.name
		},
		{
			id: 5,
			title: '5. Verify channels, then queue drafts',
			content:
				'Ask Duet to list OpenQuok integrations before it schedules. Keep results as drafts until you approve on OpenQuok.',
			animatedContent: 'agent-integrations',
			mediaAlt: 'Validate OpenQuok channels before scheduling from Claude Duet',
			iconName: icons.Lock.name
		}
	],
	featureSections: [
		{
			subtitle: 'Connect once',
			title: 'authenticate on the VM, pick your workspace, chat from mobile securely',
			description:
				'Run openquok auth:login on Duet’s virtual machine once. Credentials stay on that VM while you message from iOS, Android, or claude.ai.',
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'openquok-login',
			imageAlt: 'Claude Duet guiding OpenQuok OAuth device login',
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
				'Move agent-generated posts from draft to review to scheduled on a kanban board — with the same smart filters as your calendar. Approve quality at scale instead of trusting autopilot.',
			bentoId: 'agent-multi-platform-bulk-scheduling',
			mediaOnRight: false,
			cliCommandsTitle: 'CLI command options',
			cliCommands: `openquok posts:create -c "…" -s "…" -t draft -i "<integration-id>"
openquok posts:review-todo <post-id> --note "…"
openquok posts:status <post-id> -s schedule`
		},
		{
			subtitle: 'Analytics',
			title: 'Ask what worked, see winners, and adapt from Duet',
			description:
				'Assign a follow-up task to pull impressions, likes, comments, and shares for any connected channel. Compare performance and schedule more of what already resonates.',
			deviceMock: 'desktop',
			deviceMockContent: 'agent-parallel-analytics',
			imageAlt: 'Claude Duet thread showing OpenQuok analytics',
			mediaOnRight: true,
			cliCommandsTitle: 'CLI analytics options',
			cliCommands: `openquok analytics:platform <integration-id> -d 30
openquok analytics:post <post-id> -d 7`
		},
		{
			subtitle: 'Scale what works',
			title: 'background VM tasks while you focus elsewhere',
			description:
				'Duet keeps working when you step away. Spin up another OpenQuok workspace for the next client and keep credentials isolated as you scale.',
			parallelMocks: [
				{
					deviceMock: 'iphone-15-pro',
					deviceMockContent: 'agent-chat-schedule',
					imageAlt: 'Claude Duet scheduling posts in the background'
				},
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-analytics',
					imageAlt: 'Second task pulling live analytics'
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
		title: 'proactive Claude partner, not another dashboard',
		description:
			'OpenQuok is built for agents that finish work. Claude Duet fits when you want Anthropic’s proactive app with a virtual machine and approval gates.',
		withoutTitle: 'Typical social scheduler SaaS',
		withTitle: 'OpenQuok + Claude Duet',
		points: [
			{
				pain: 'Copy posts between chat and a separate scheduling tool',
				feature: 'Message Duet to draft and schedule with openquok-core on its VM'
			},
			{
				pain: 'Terminal-only MCP with no mobile brief',
				feature: 'Same OpenQuok workspace — use Claude Code MCP when the repo is home'
			},
			{
				pain: 'Autopilot publishing with no human checkpoint',
				feature: COMPARISON_PUBLISH_CHOICE_FEATURE
			},
			{
				pain: 'One API key mixed across every client',
				feature: 'Multi-workspace isolation — scoped tokens per brand'
			},
			{
				pain: 'Confusing Claude Cowork desktop sessions with the Duet app',
				feature:
					'Clear split: Claude Duet here; Claude Cowork and Claude Code MCP guides stay separate'
			}
		]
	},
	commandReferenceSection: {
		subtitle: 'CLI',
		title: 'Command reference',
		description:
			'Commands from the openquok-core skill on Duet’s virtual machine — same tools as the hosted MCP server.',
		commands: OPENQUOK_CLI_COMMAND_REFERENCE
	},
	supportedChannelsSection: {
		subtitle: 'Where you work',
		title: 'iOS, Android, claude.ai, and skills',
		description:
			'Claude Duet meets you on mobile and web. Install openquok-core through skills on the virtual machine:',
		extensionLabel: 'Claude lab surfaces'
	},
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Claude Duet + OpenQuok, answered',
	faqDescription:
		'What Claude Duet is, how it differs from Claude Code and Claude Cowork, preview eligibility, openquok-core install, and human approval.',
	faqItems: [
		{
			title: 'What is Claude Duet?',
			description:
				`Claude Duet is Anthropic’s proactive agent app. It sends briefs, runs tasks on a virtual machine, and checks connected apps before it messages you. You can type or use voice on iOS, Android, or claude.ai. See ${faqLink('https://claude.com/resources/articles/claude-duet', 'Introducing Claude Duet')} and the ${faqLink(publicFaqHref.claudeDuetAgentGuide, 'Claude Duet setup guide')}.`
		},
		{
			title: 'Who can use Claude Duet today?',
			description:
				`Anthropic opened a US research preview for Claude Pro and Max subscribers on a waitlist. Availability can change — check ${faqLink('https://claude.com/resources/articles/claude-duet', 'Introducing Claude Duet')} for the current region and plan list. OpenQuok billing is separate; you still need a workspace and connected channels on ${faqLink(publicFaqHref.pricing, 'Pricing')}.`
		},
		{
			title: 'How do I install openquok-core on Claude Duet?',
			description:
				`Install @openquok/auto-cli on Duet’s virtual machine and add openquok-core to your Claude skills, or curl SKILL.md from the agent package. Follow the ${faqLink(publicFaqHref.claudeDuetAgentGuide, 'Claude Duet agent guide')}.`
		},
		buildAgentCloudBrowserVsOpenQuokFaqItem('Claude Duet'),
		{
			title: 'Does Claude Duet publish immediately or wait for approval?',
			description: buildPublishApprovalFaqAnswer('Claude Duet')
		},
		{
			title: 'Can Claude Duet schedule every supported network?',
			description:
				`Yes — when your OpenQuok workspace has the channel connected. Ask Duet to list integrations, draft copy, and queue drafts or schedules through openquok-core. See ${faqLink(publicFaqHref.channels, 'supported channels')}.`
		},
		{
			title: 'Is it free to start on OpenQuok?',
			description:
				`OpenQuok offers a 7-day free trial on ${faqLink(publicFaqHref.pricing, 'Pricing')}. Claude Duet requires an eligible Claude subscription from Anthropic; connect OpenQuok once Duet is enabled for your account.`
		}
	]
} satisfies PublicAgentHostLandingPageViewModel;
