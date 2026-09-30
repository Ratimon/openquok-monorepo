import { icons } from '$data/icons';

import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/agents/types';
import { faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import {
	META_MUSE_SKILL_INSTALL_OPTIONS,
	OPENQUOK_CLI_COMMAND_REFERENCE
} from '$lib/content/constants/agents/cli-command-reference';
import { PUBLIC_AGENT_LISTINGS_PREVIEW_SECTION } from '$lib/content/constants/agents/general';

export const metaMuseAgent = {
	pageType: 'agent-host',
	slug: 'meta-muse',
	agentId: 'meta-muse',
	agentLabel: 'Meta Muse',
	icon: icons.MetaMuse.name,
	available: true,
	metaTitle: 'Meta Muse Social Scheduling for Facebook, Instagram & WhatsApp',
	metaDescription:
		'Connect OpenQuok to Meta Muse — Meta\'s personal AI agent on muse.ai and WhatsApp. Schedule Facebook, Instagram, Threads, and other channels with a custom connector or openquok-core in Muse Secure VM. You approve every publish on the calendar or kanban.',
	hubDescription:
		'Meta Muse runs in Muse Secure VM and can build custom connectors from public APIs. Facebook and Instagram creators can draft from chat or WhatsApp. You approve on OpenQuok.',
	keywords: [
		'Meta Muse social media',
		'Meta Muse Facebook',
		'Meta Muse Instagram',
		'Meta Muse WhatsApp',
		'Meta Muse Threads',
		'Meta Muse custom connector',
		'Muse Secure VM scheduling',
		'muse.ai OpenQuok',
		'Meta AI agent schedule posts',
		'Meta Muse vs Muse Code',
		'OpenQuok Meta Muse integration',
		'schedule Facebook from Meta Muse'
	],
	heroTitle: 'Schedule social media from Meta Muse then you approve',
	heroDescription:
		'Meta Muse is Meta\'s personal AI agent for iOS, Android, muse.ai, and WhatsApp. Connect OpenQuok for Facebook, Instagram, Threads, and more — custom connector from the public API or openquok-core in Muse Secure VM. You review and approve on the calendar or kanban.',
	docsPath: '/docs/agent-setup-guides/meta-muse',
	skillInstallOptions: META_MUSE_SKILL_INSTALL_OPTIONS,
	workflowSection: {
		subtitle: 'Your everyday agent',
		title: 'Message Meta Muse from phone, web, or WhatsApp',
		description:
			'Ask Muse to list connected channels, draft platform-specific copy, and queue schedules through OpenQuok. Start with drafts and validation. You sign off before anything publishes.',
		deviceMock: 'iphone-15-pro',
		deviceMockContent: 'agent-chat-schedule',
		imageAlt: 'Meta Muse chat scheduling social posts via OpenQuok'
	},
	audienceSubtitle: 'Built for Meta Muse users',
	audienceTitle: 'Who connects Meta Muse to OpenQuok?',
	audienceCards: [
		{
			iconName: icons.WhatsApp.name,
			iconClass: 'text-emerald-400',
			title: 'Messaging-first users',
			description:
				'You chat with Muse like a person in the Muse app or WhatsApp. Ask it to queue OpenQuok drafts while you are on the go. You still approve publishes on the calendar.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.Lock.name,
			iconClass: 'text-fuchsia-300',
			title: 'Secure VM operators',
			description:
				'Muse runs on Muse Secure VM with its own browser and isolated credentials. Point a custom connector at OpenQuok or run openquok-core in the VM — tokens stay out of casual chat.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnClapperboard.name,
			iconClass: 'text-violet-300',
			title: 'Creators and marketers',
			description:
				'Muse can plan launches and keep working after you close the app. When a reel, event, or campaign is ready, have Muse draft channel-specific posts — OpenQuok holds the approval step.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	setupStepsSubtitle: 'How it works',
	setupStepsTitle: 'Five steps,to Meta Muse + OpenQuok',
	setupSteps: [
		{
			id: 1,
			title: '1. Use Meta Muse',
			content:
				'Sign in to Meta Muse on iOS, Android, or muse.ai. Meta ships this product separately from Muse Code, the terminal coding agent on dev.meta.ai.',
			mediaAlt: 'Meta Muse product overview at meta.ai',
			deviceMock: 'safari',
			deviceMockContent: 'meta-muse-docs-overview',
			mockUrl: 'meta.ai/muse',
			iconName: icons.Terminal.name
		},
		{
			id: 2,
			title: '2. Create an OpenQuok API key',
			content:
				'Open Developers → Access in your OpenQuok workspace and create a programmatic token for the workspace Muse should use.',
			animatedContent: 'llm-models',
			mediaAlt: 'Create a scoped OpenQuok programmatic token',
			iconName: icons.Lock.name
		},
		{
			id: 3,
			title: '3. Ask for a custom connector',
			content:
				'Tell Muse to build a custom connector from https://www.openquok.com/api/v1/openapi.json. Paste the API key into Muse secure credential prompts — not into ordinary chat.',
			mediaAlt: 'Meta Muse custom connector conversation for OpenQuok',
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'agent-chat-schedule',
			iconName: icons.MessageCircle.name
		},
		{
			id: 4,
			title: '4. Optional: openquok-core in the VM',
			content:
				'For terminal workflows, ask Muse to install @openquok/auto-cli in the Secure VM and curl openquok-core SKILL.md into a workspace folder.',
			mediaAlt: 'Install openquok-core in Meta Muse Secure VM',
			deviceMock: 'terminal',
			deviceMockContent: 'openquok-skill-install-meta-muse',
			iconName: icons.OpenQuok.name
		},
		{
			id: 5,
			title: '5. Verify accounts before you schedule',
			content:
				'Ask Muse to list integrations and publishing rules first. Then draft, validate targets, and keep results as drafts until you approve on OpenQuok.',
			animatedContent: 'agent-integrations',
			mediaAlt: 'Validate OpenQuok channels before scheduling from Meta Muse',
			iconName: icons.Sparkles.name
		}
	],
	featureSections: [
		{
			subtitle: 'Connect once',
			title: 'store credentials in Muse, pick your workspace, chat from anywhere securely',
			description:
				'Use Muse secure credential storage for your OpenQuok API key. Choose a workspace, validate connected channels, and draft from mobile or web without opening another scheduling tab.',
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'openquok-login',
			imageAlt: 'Meta Muse chat guiding OpenQuok workspace setup',
			mediaOnRight: true,
			cliCommandsTitle: 'Public API authentication',
			cliCommands: `# Programmatic token (Authorization header)
export OPENQUOK_API_KEY=opo_your_programmatic_token

# Custom connector: give Muse the OpenAPI URL
# https://www.openquok.com/api/v1/openapi.json`
		},
		{
			subtitle: 'Kanban + smart filters',
			title: 'Review every AI draft, sign off confidently, before it goes live',
			description:
				'Move agent-generated posts from draft to review to scheduled on a kanban board—with the same smart filters as your calendar. Approve quality at scale instead of trusting autopilot.',
			bentoId: 'agent-multi-platform-bulk-scheduling',
			mediaOnRight: false,
			cliCommandsTitle: 'CLI command options (Secure VM)',
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
				'Message Muse to pull impressions, likes, comments, and shares for any connected channel. Compare performance and schedule more of what already resonates — without opening the dashboard.',
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'agent-chat-schedule',
			imageAlt: 'Meta Muse chat showing OpenQuok platform and post analytics',
			mediaOnRight: true,
			cliCommandsTitle: 'CLI analytics options',
			cliCommands: `# Platform metrics (followers, impressions, engagement)
openquok analytics:platform <integration-uuid> -d 30

# Per-post insights (likes, comments, shares)
openquok analytics:post <post-id> -d 7`
		},
		{
			subtitle: 'Scale what works',
			title: 'when a format hits, scale by adding workspaces and parallel tasks',
			description:
				'Spot a winner in analytics, then spin up another workspace for the next client or brand while Muse queues the next wave — credentials, channels, and drafts stay isolated as you scale.',
			parallelMocks: [
				{
					deviceMock: 'iphone-15-pro',
					deviceMockContent: 'agent-chat-schedule',
					imageAlt: 'Meta Muse session scheduling posts in parallel'
				},
				{
					deviceMock: 'iphone-15-pro',
					deviceMockContent: 'agent-chat-schedule',
					imageAlt: 'Second Meta Muse task pulling live analytics'
				},
				{
					deviceMock: 'iphone-15-pro',
					deviceMockContent: 'agent-chat-schedule',
					imageAlt: 'Meta Muse chat scheduling while another task validates targets'
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
		withTitle: 'OpenQuok + Meta Muse',
		points: [
			{
				pain: 'Copy posts between your AI chat and a separate scheduling tool',
				feature: 'Message Meta Muse to draft and schedule through OpenQuok'
			},
			{
				pain: 'No first-party Muse connector for every SaaS on day one',
				feature: 'Custom connectors from the public OpenAPI document Meta documents for APIs'
			},
			{
				pain: 'API keys pasted into chat history',
				feature: 'Store OpenQuok tokens in Muse secure credential prompts'
			},
			{
				pain: 'Autopilot publishing with no human checkpoint',
				feature:
					'Every post lands as draft or scheduled — you approve before anything goes live'
			},
			{
				pain: 'One workspace mixing every client as you add channels',
				feature:
					'Multi-workspace isolation — scoped API keys per brand so drafts never cross wires'
			},
			{
				pain: 'Terminal coding agents mixed up with consumer Muse',
				feature:
					'Clear split: Meta Muse here; Muse Code MCP setup lives on its own integration page'
			}
		]
	},
	commandReferenceSection: {
		subtitle: 'CLI',
		title: 'Command reference',
		description:
			'Commands from openquok-core when Muse runs the CLI inside its Secure VM — structured JSON on stdout and human-in-the-loop drafts.',
		commands: OPENQUOK_CLI_COMMAND_REFERENCE
	},
	supportedChannelsSection: {
		subtitle: 'Where you chat',
		title: 'Mobile, web, and connectors',
		description:
			'Meta Muse meets you on the devices you already use. OpenQuok connects through custom connectors, the public API, CLI in the Secure VM, or hosted MCP when your environment supports it:',
		extensionLabel: 'OpenQuok surfaces'
	},
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Meta Muse + OpenQuok, answered',
	faqDescription:
		'Muse Secure VM, WhatsApp, proactive tasks, Muse Code vs consumer Muse, custom connectors, credentials, and OpenQuok approval.',
	faqItems: [
		{
			title: 'What is Meta Muse?',
			description:
				`Meta Muse is Meta's personal AI agent for everyday work — not just Q&A. It runs on Muse Secure VM, can use a browser on your behalf, and chats like messaging in the Muse app or WhatsApp. It is powered by Muse Spark for agentic tasks. US rollout includes iOS, Android, and muse.ai. Overview: https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/. See the ${faqLink(publicFaqHref.metaMuseLanding, 'Meta Muse integration')} and ${faqLink(publicFaqHref.metaMuseAgentGuide, 'agent guide')}.`
		},
		{
			title: 'What is Muse Secure VM?',
			description:
				'Muse Secure VM is a dedicated cloud computer for one person\'s Muse. It holds connected app data and credentials in isolated storage. Muse asks before sensitive actions like email or purchases. OpenQuok fits the same pattern: schedule posts as drafts, then you approve on OpenQuok before anything goes live.'
		},
		{
			title: 'Can Muse keep working while I am away?',
			description:
				'Yes. Muse can continue long tasks after you close the app and return when it needs input or when something changes. Pair that with OpenQuok so Muse queues social drafts while you focus elsewhere — publishing still waits for your calendar or kanban approval.'
		},
		{
			title: 'Can Meta Muse schedule Facebook or Instagram posts?',
			description:
				`Yes — when your OpenQuok workspace has Facebook or Instagram connected. Ask Muse to call OpenQuok through a custom connector or openquok-core in the Secure VM. Muse drafts and queues posts; you approve on OpenQuok before anything publishes to your Page or professional account. See ${faqLink(publicFaqHref.channels, 'supported channels')}.`
		},
		{
			title: 'Is Meta Muse the same as Muse Code?',
			description:
				`No. Meta Muse is the personal agent product for everyone. Muse Code is Meta's terminal coding agent for developers on macOS and Linux. Muse Code connects to OpenQuok over MCP in ~/.config/muse/settings.json — see the ${faqLink(publicFaqHref.museCodeLanding, 'Muse Code MCP guide')}. Consumer Muse and Muse Code are separate subscriptions and apps.`
		},
		{
			title: 'Does Meta Muse ship a built-in OpenQuok connector?',
			description:
				'Not as a pre-reviewed directory connector on day one. Meta says you can ask Muse to create a custom connector when a service exposes an API. OpenQuok publishes a public OpenAPI document and REST API so Muse can wire scheduling without a separate adapter.'
		},
		{
			title: 'How do I authenticate OpenQuok for Muse?',
			description:
				`Create a programmatic token under Developers → Access in your OpenQuok workspace. When Muse asks for credentials, use its secure credential prompt — do not repeat the key in normal chat. API requests use the Authorization header with your opo_ token. See ${faqLink(publicFaqHref.publicApi, 'Public API')} docs.`
		},
		{
			title: 'Should I use a custom connector, CLI skill, or MCP?',
			description:
				`Start with a custom connector and the OpenAPI URL when you use consumer Muse in chat. Install openquok-core in the Secure VM when you want shell workflows. Use ${faqLink(publicFaqHref.mcpSetupGuides, 'hosted MCP')} when your Muse environment exposes MCP configuration — same tools as other MCP clients.`
		},
		{
			title: 'What can Meta Muse do with OpenQuok?',
			description:
				`List connected channels, inspect publishing rules, draft and schedule posts, upload media, and pull analytics. See ${faqLink(publicFaqHref.channels, 'supported channels')} and ${faqLink(publicFaqHref.cliManagingPosts, 'CLI post commands')}.`
		},
		{
			title: 'Does Meta Muse publish immediately or wait for approval?',
			description:
				'Posts created through OpenQuok land as drafts or scheduled items in your workspace. Review on the calendar or kanban, move posts through draft and review, and approve what should publish.'
		},
		{
			title: 'Where do credentials live?',
			description:
				'Muse stores connector secrets in its secure credential store. When you use the CLI path, auth files live inside the Secure VM — not on your phone chat history. Rotate tokens from OpenQuok Developers → Access if you revoke access.'
		},
		{
			title: 'Is it free to start?',
			description:
				`OpenQuok offers a 7-day free trial for scheduling on ${faqLink(publicFaqHref.pricing, 'Pricing')}. Meta Muse access depends on Meta's plans for your region — connect OpenQuok once your Muse account is active.`
		}
	]
} satisfies PublicAgentHostLandingPageViewModel;
