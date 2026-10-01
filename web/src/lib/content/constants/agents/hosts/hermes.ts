import { icons } from '$data/icons';

import { buildMessagingGatewayHermesFaqParams } from '$lib/content/constants/agents/archetypes/messaging-gateway-faq';
import { buildAgentHostLandingPage } from '$lib/content/constants/agents/buildAgentHostLandingPage';
import { buildAgentHostPickerFaqDescription } from '$lib/content/constants/agents/decision-scenarios';
import type { AgentHostLandingSeed } from '$lib/content/constants/agents/types';
import {
	HERMES_SKILL_INSTALL_OPTIONS,
	OPENQUOK_CLI_COMMAND_REFERENCE
} from '$lib/content/constants/agents/cli-command-reference';
import {
	COMPARISON_PUBLISH_CHOICE_FEATURE,
	WORKFLOW_PUBLISH_CHOICE_SENTENCE
} from '$lib/content/constants/schedulingPublishChoice';

export const hermesAgentSeed = {
	slug: 'hermes',
	agentId: 'hermes',
	agentLabel: 'Hermes Agent',
	telegramBotLabel: 'Hermes',
	icon: icons.HermesAgent.name,
	available: true,
	metaTitle: 'Hermes Agent Social Scheduling — Gateway, Skills Hub & MCP',
	metaDescription:
		'Hermes Agent from Nous Research connects Telegram, Discord, Slack, and 20+ chat apps to openquok-core. Draft and schedule Facebook, X, LinkedIn, and more from your gateway. You approve on the calendar or kanban.',
	hubDescription:
		'Hermes runs on laptop, VPS, or Docker with a unified messaging gateway. Add openquok-core to Skills Hub and schedule from Telegram or Discord. You approve on OpenQuok.',
	keywords: [
		'Hermes Agent social media',
		'Hermes Telegram scheduler',
		'Hermes gateway social posts',
		'Hermes Skills Hub OpenQuok',
		'Nous Research Hermes scheduling',
		'openquok-core skill',
		'Hermes CLI posting',
		'agentic social media scheduler',
		'Hermes MCP OpenQuok',
		'OpenQuok Hermes integration',
		'schedule LinkedIn Hermes Agent'
	],
	heroTitle: 'Schedule social media from Hermes then you approve',
	heroDescription:
		'Hermes Agent is a self-improving AI assistant you run on your own hardware or a cloud VM. Message it from Telegram, Discord, or Slack. Add the openquok-core skill so it drafts and schedules social posts. You review and approve on the calendar or kanban.',
	docsPath: '/docs/agent-setup-guides/hermes',
	skillInstallOptions: HERMES_SKILL_INSTALL_OPTIONS,
	workflowSection: {
		subtitle: 'Your messaging gateways',
		title: 'Message Hermes from Telegram, Discord, or Slack',
		description: `Send a scheduling request through any gateway Hermes already bridges. The openquok-core skill drafts posts, uploads media, and queues them on your OpenQuok calendar. ${WORKFLOW_PUBLISH_CHOICE_SENTENCE}`,
		deviceMock: 'iphone-15-pro',
		deviceMockContent: 'agent-chat-schedule',
		imageAlt: 'Hermes chat scheduling social posts via OpenQuok'
	},
	audienceSubtitle: 'Built for Hermes hosts',
	audienceTitle: 'Who connects Hermes Agent to OpenQuok?',
	audienceCards: [
		{
			iconName: icons.MessageCircle.name,
			iconClass: 'text-violet-400',
			title: 'Gateway operators',
			description:
				'You run hermes gateway setup once and reach Telegram, Discord, Slack, WhatsApp, Signal, and 20+ more surfaces from a single Hermes Agent.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.Sparkles.name,
			iconClass: 'text-indigo-400',
			title: 'Skills Hub users',
			description:
				'Hermes can create and refine skills from experience. Add openquok-core under ~/.hermes/skills/ beside MCP servers and your own automations.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-fuchsia-400',
			title: 'VPS and desktop hosts',
			description:
				'Run the CLI installer on Linux, macOS, WSL2, or Windows — or use the Hermes Desktop app. Keep calendar approval while Hermes handles chat volume.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	messagingGateway: {
		agentLabel: 'Hermes Agent',
		installStepTitle: '1. Install Hermes Agent',
		installStepContent:
			'Run the one-line installer on Linux, macOS, WSL2, or Windows — or use the Desktop app on macOS and Windows.',
		docsOverviewMockId: 'hermes-docs-overview',
		docsMockUrl: 'hermes-agent.nousresearch.com',
		setupStep2Content:
			'Run hermes setup --portal for the fastest path, or hermes model to pick Claude, GPT, Gemini, OpenRouter, or a self-hosted endpoint.',
		skillInstallTerminalMockId: 'openquok-skill-install-hermes',
		integrationsStepProductName: 'Hermes',
		featureConnectDescription:
			'Choose a workspace, connect with OAuth2 — approve in your browser, and credentials stay on the host. Message Hermes from Telegram, Discord, or Slack to draft and schedule without opening another app.',
		featureAnalyticsDescription:
			'Message Hermes on Telegram to pull impressions, likes, comments, and shares for any connected channel. Compare performance and schedule more of what already resonates — without opening the dashboard.',
		featureScaleDescription:
			'Spot a winner in analytics, then clone more dedicated workspaces for the next client or brand while Hermes queues the next wave in parallel — credentials, channels, and agent context stay isolated as you scale.',
		parallelScheduleAlt: 'Hermes desktop chat session scheduling posts in parallel',
		parallelAnalyticsAlt: 'Second Hermes desktop chat session pulling live analytics concurrently',
		parallelChatAlt: 'Hermes Telegram chat scheduling posts while desktop sessions run in parallel'
	},
	comparisonSection: {
		subtitle: 'comparisons',
		title: 'agent-native scheduling, not another dashboard',
		description: 'Most social scheduler SaaS keeps you in a browser tab. OpenQuok is built for agents',
		withoutTitle: 'Typical social scheduler SaaS',
		withTitle: 'OpenQuok + Hermes Agent',
		points: [
			{
				pain: 'Copy posts between your AI chat and a separate scheduling tool',
				feature: 'Message Hermes from Telegram, Discord, or Slack to draft and schedule'
			},
			{
				pain: 'Siloed API keys and workflows that do not compose with your agent stack',
				feature: 'Eligibility is checked automatically — credentials stay on your host'
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
		subtitle: 'Messaging gateway',
		title: 'Supported channels',
		description:
			'Hermes Agent connects Telegram, Discord, Slack, WhatsApp, and 20+ more platforms from one gateway:',
		extensionLabel: 'Microsoft 365, Chinese platforms & more'
	},
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Hermes Agent + OpenQuok, answered',
	faqDescription:
		'What Hermes Agent is, how to install openquok-core, supported platforms, human approval, and how agents draft and schedule posts from chat.',
	messagingGatewayFaq: buildMessagingGatewayHermesFaqParams(),
	overrides: {
		faqItemsAfterFirst: [
			{
				title: 'How do I pick Hermes vs Grok Bot or Dots?',
				description: buildAgentHostPickerFaqDescription('hermes')
			}
		]
	}
} satisfies AgentHostLandingSeed;

export const hermesAgent = buildAgentHostLandingPage(hermesAgentSeed);
