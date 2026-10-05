import { icons } from '$data/icons';

import { buildAgentHostPickerFaqDescription } from '$lib/content/constants/agents/decision-scenarios';
import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/agents/types';
import { faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import {
	DOTS_SKILL_INSTALL_OPTIONS,
	OPENQUOK_CLI_COMMAND_REFERENCE
} from '$lib/content/constants/agents/cli-command-reference';
import { PUBLIC_AGENT_OPPORTUNITIES_PREVIEW_SECTION } from '$lib/content/constants/agents/general';
import { buildPublishApprovalFaqAnswer } from '$lib/content/constants/schedulingPublishChoice';

export const dotsAgent = {
	pageType: 'agent-host',
	slug: 'dots',
	agentId: 'dots',
	agentLabel: 'Dots',
	icon: icons.Dots.name,
	available: true,
	metaTitle: 'Dots Social Scheduling — Always-On ChatGPT Agent & Cloud Computer',
	metaDescription:
		'Connect openquok-core to OpenAI Dots on its cloud computer. Draft and schedule Facebook, LinkedIn, X, and more from ChatGPT, Slack, or Teams. Custom Rules and approvals on OpenQuok — not the ChatGPT MCP connector path.',
	hubDescription:
		'Dots are always-on agents with their own cloud computer inside ChatGPT. Message from desktop, mobile, Slack, or Teams. Add openquok-core via plugins. You approve on OpenQuok.',
	keywords: [
		'Dots social media',
		'OpenAI Dots scheduling',
		'ChatGPT dot social posts',
		'Dots vs Grok Bot scheduler',
		'Dots vs OpenClaw scheduling',
		'Dots vs ChatGPT MCP OpenQuok',
		'OpenAI agent cloud computer',
		'Dots Slack Teams scheduling',
		'openquok-core Dots plugin',
		'proactive agent social drafts',
		'OpenQuok Dots integration',
		'schedule social media Dots'
	],
	heroTitle: 'Schedule social media from Dots then you approve',
	heroDescription:
		'Dots are always-on OpenAI agents with a dedicated cloud computer, browser, and plugins. Message your dot from ChatGPT, Slack, or Microsoft Teams. Add openquok-core so it drafts and queues social posts while you review on the calendar or kanban.',
	docsPath: '/docs/agent-setup-guides/dots',
	skillInstallOptions: DOTS_SKILL_INSTALL_OPTIONS,
	workflowSection: {
		subtitle: 'Your always-on dot',
		title: 'Chat in ChatGPT, Slack, or Teams',
		description:
			'Ask your dot to draft and schedule like any other project. The openquok-core skill runs on its cloud computer. It lists integrations, attaches media, and queues posts. You can publish now, schedule for later, or save drafts and approve on OpenQuok when you are ready.',
		deviceMock: 'desktop',
		deviceMockContent: 'agent-parallel-schedule',
		imageAlt: 'Dots chat scheduling social posts via OpenQuok'
	},
	audienceSubtitle: 'Built for Dots users',
	audienceTitle: 'Who connects Dots to OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnClapperboard.name,
			iconClass: 'text-violet-300',
			title: 'Content and launch operators',
			description:
				'Your dot can turn transcripts into clips, show notes, and social drafts — the same workflow OpenAI describes for creators. OpenQuok holds the approval step before publish.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.Slack.name,
			iconClass: 'text-emerald-300',
			title: 'Slack and Teams first',
			description:
				'You start work in ChatGPT and follow through in Slack or Teams without losing context. Ask your dot to queue OpenQuok drafts from the channel you already use.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CalendarClock.name,
			iconClass: 'text-stone-400',
			title: 'Proactive scheduling with guardrails',
			description:
				'Dots can research in the background with read-only tools, then act when you approve. Pair Custom Rules with OpenQuok so you choose publish-now, schedule, or draft-and-review on the calendar.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	setupStepsSubtitle: 'How it works',
	setupStepsTitle: 'Five steps,to Dots + OpenQuok',
	setupSteps: [
		{
			id: 1,
			title: '1. Create your dot',
			content:
				'Open ChatGPT on desktop or browser in an eligible market. Create and name your primary dot, connect apps, and open its cloud computer when you want to inspect work.',
			mediaAlt: 'OpenAI Dots product overview',
			deviceMock: 'safari',
			deviceMockContent: 'dots-docs-overview',
			mockUrl: 'openai.com',
			iconName: icons.Terminal.name
		},
		{
			id: 2,
			title: '2. Set Custom Rules',
			content:
				'Decide when your dot may act alone and when it must ask you. Require approval for outbound posts and keep OpenQuok as the publish checkpoint.',
			animatedContent: 'llm-models',
			mediaAlt: 'Dots Custom Rules and Activity View',
			iconName: icons.Lock.name
		},
		{
			id: 3,
			title: '3. Message from your surface',
			content:
				'Chat in ChatGPT on web or mobile, or message your dot in Slack or Microsoft Teams. Context carries across channels.',
			mediaAlt: 'Dots desktop chat for scheduling requests',
			deviceMock: 'desktop',
			deviceMockContent: 'agent-parallel-schedule',
			iconName: icons.MessageCircle.name
		},
		{
			id: 4,
			title: '4. Install openquok-core',
			content:
				'Ask your dot to install @openquok/auto-cli on its cloud computer and save openquok-core from SKILL.md through the plugins workflow.',
			mediaAlt: 'Install openquok-core on the dot cloud computer',
			deviceMock: 'terminal',
			deviceMockContent: 'openquok-skill-install-dots',
			iconName: icons.OpenQuok.name
		},
		{
			id: 5,
			title: '5. Integrate & customize other skills or MCPs',
			content:
				'Add other plugins beside openquok-core. Use OpenQuok for scheduling volume and keep optional MCP clients for editor sessions.',
			animatedContent: 'agent-integrations',
			mediaAlt: 'Dot plugins and integrations with OpenQuok',
			iconName: icons.Sparkles.name
		}
	],
	featureSections: [
		{
			subtitle: 'Connect once',
			title: 'authenticate on the dot computer, pick your workspace, chat from Slack securely',
			description:
				'Run OAuth device login on the dot cloud computer once. Credentials stay off casual chat threads. Message from ChatGPT or Slack to draft and schedule without opening another dashboard.',
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'openquok-login',
			imageAlt: 'Dots chat guiding OpenQuok OAuth device login and workspace authorization',
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
				'Message your dot to pull impressions, likes, comments, and shares for any connected channel. Compare performance and schedule more of what already resonates.',
			deviceMock: 'desktop',
			deviceMockContent: 'agent-parallel-analytics',
			imageAlt: 'Dots chat showing OpenQuok platform and post analytics',
			mediaOnRight: true,
			cliCommandsTitle: 'CLI analytics options',
			cliCommands: `# Platform metrics (followers, impressions, engagement)
openquok analytics:platform <integration-uuid> -d 30

# Per-post insights (likes, comments, shares)
openquok analytics:post <post-id> -d 7`
		},
		{
			subtitle: 'Scale what works',
			title: 'when a format hits, scale with workspaces and parallel projects',
			description:
				'Spot a winner in analytics, then spin up another OpenQuok workspace for the next brand while your dot queues the next wave on its computer — credentials and channels stay isolated.',
			parallelMocks: [
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-schedule',
					imageAlt: 'First dot session scheduling posts in parallel'
				},
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-analytics',
					imageAlt: 'Second dot session pulling live analytics concurrently'
				},
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-schedule',
					imageAlt: 'Dots chat scheduling posts while another session runs analytics'
				}
			],
			mediaOnRight: false,
			cliCommandsTitle: 'Parallel CLI sessions',
			cliCommands: `# Workspace A — brand one
openquok posts:create -c "…" -s "…" -t draft -i "<uuid>"
openquok posts:status <post-id> -s schedule

# Workspace B — brand two (isolated credentials)
openquok posts:list --status draft

# Metrics in parallel
openquok analytics:platform <integration-uuid> -d 7`
		}
	],
	opportunitiesPreviewSection: PUBLIC_AGENT_OPPORTUNITIES_PREVIEW_SECTION,
	comparisonSection: {
		subtitle: 'comparisons',
		title: 'always-on dot, not another tab',
		description:
			'OpenQuok is built for agents that finish work. Dots fit when you want ChatGPT-native always-on help with a cloud computer.',
		withoutTitle: 'Typical social scheduler SaaS',
		withTitle: 'OpenQuok + Dots',
		points: [
			{
				pain: 'Copy posts between chat and a separate scheduling dashboard',
				feature: 'Message your dot from ChatGPT, Slack, or Teams to draft and schedule'
			},
			{
				pain: 'Self-host ops when you only need a managed cloud agent',
				feature: 'Dots run on OpenAI cloud computers — you inspect work in Activity View'
			},
			{
				pain: 'Many named bots on a different vendor desktop app',
				feature: 'One primary dot today — deep ChatGPT, Slack, and Teams context'
			},
			{
				pain: 'MCP-only sessions that end when you close the connector chat',
				feature: 'openquok-core on the dot computer for repeatable CLI scheduling'
			},
			{
				pain: 'Autopilot publishing with no human checkpoint',
				feature: 'You choose publish-now, schedule, or draft — approve on OpenQuok when you want a review step'
			},
			{
				pain: 'One workspace mixing every brand as you scale',
				feature: 'Multi-workspace isolation — separate credentials per client or channel set'
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
		title: 'ChatGPT, Slack, Teams, and plugins',
		description:
			'Dots meet you on the surfaces you already use. Install openquok-core through plugins on the dot cloud computer:',
		extensionLabel: 'Optional MCP in editors'
	},
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Dots + OpenQuok, answered',
	faqDescription:
		'What Dots are, how they differ from ChatGPT MCP and Grok Bot, plan eligibility, openquok-core install, and human approval.',
	faqItems: [
		{
			title: 'What are Dots?',
			description:
				`Dots are always-on OpenAI agents with their own cloud computer, browser, and plugin ecosystem. You create a dot in ChatGPT, message it from desktop, mobile, Slack, or Teams, and set Custom Rules for approvals. See ${faqLink(publicFaqHref.dotsLanding, 'Dots + OpenQuok')} and OpenAI's ${faqLink('https://openai.com/index/introducing-dots/', 'Introducing dots')} overview.`
		},
		{
			title: 'How are Dots different from ChatGPT MCP?',
			description:
				`${faqLink(publicFaqHref.dotsAgentGuide, 'Dots')} can run openquok-core on a persistent cloud computer with proactive background work. ${faqLink(publicFaqHref.chatgptLanding, 'ChatGPT MCP')} connects OpenQuok inside a chat session via a custom connector — better for ad hoc questions, not long-running scheduling on the dot computer. Many teams use both.`
		},
		{
			title: 'How do Dots compare to Grok Bot or OpenClaw?',
			description: buildAgentHostPickerFaqDescription('dots')
		},
		{
			title: 'Which plans include Dots?',
			description:
				`Dots roll out on eligible ChatGPT Pro, Business Premium, and Enterprise plans (workspace admins enable Enterprise). OpenQuok billing is separate — you still need a workspace and connected channels on ${faqLink(publicFaqHref.pricing, 'Pricing')}.`
		},
		{
			title: 'How do I install openquok-core on my dot?',
			description:
				`Install @openquok/auto-cli on the dot cloud computer, fetch SKILL.md, and register openquok-core through plugins. Follow the ${faqLink(publicFaqHref.dotsAgentGuide, 'Dots agent guide')}.`
		},
		{
			title: 'Where do OpenQuok credentials live?',
			description:
				`The CLI and auth files live on the dot cloud computer — not in Slack or Teams message history. Use OAuth device flow or a programmatic opo_ token on that computer. See ${faqLink(publicFaqHref.oauthApps, 'OAuth2 for apps')} and ${faqLink(publicFaqHref.publicApi, 'Public API')} docs.`
		},
		{
			title: 'What can my dot do with OpenQuok?',
			description:
				`Draft and schedule posts, upload media, configure plugs, and pull analytics across connected channels. See ${faqLink(publicFaqHref.channels, 'supported channels')} and ${faqLink(publicFaqHref.cliManagingPosts, 'CLI post commands')}.`
		},
		{
			title: 'Does my dot publish immediately or wait for approval?',
			description: buildPublishApprovalFaqAnswer('your dot')
		},
		{
			title: 'Is it free to start?',
			description:
				`OpenQuok offers a 7-day free trial on ${faqLink(publicFaqHref.pricing, 'Pricing')}. Dots access depends on your ChatGPT plan eligibility — add openquok-core on the dot computer and connect channels in OpenQuok.`
		}
	]
} satisfies PublicAgentHostLandingPageViewModel;
