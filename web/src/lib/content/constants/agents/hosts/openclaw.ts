import { icons } from '$data/icons';

import { buildMessagingGatewayOpenClawFaqParams } from '$lib/content/constants/agents/archetypes/messaging-gateway-faq';
import { buildAgentHostLandingPage } from '$lib/content/constants/agents/buildAgentHostLandingPage';
import { buildAgentHostPickerFaqDescription } from '$lib/content/constants/agents/decision-scenarios';
import type { AgentHostLandingSeed } from '$lib/content/constants/agents/types';
import {
	OPENCLAW_SKILL_INSTALL_OPTIONS,
	OPENQUOK_CLI_COMMAND_REFERENCE
} from '$lib/content/constants/agents/cli-command-reference';
import {
	COMPARISON_PUBLISH_CHOICE_FEATURE,
	WORKFLOW_PUBLISH_CHOICE_SENTENCE
} from '$lib/content/constants/schedulingPublishChoice';

export const openclawAgentSeed = {
	slug: 'openclaw',
	agentId: 'openclaw',
	agentLabel: 'OpenClaw',
	icon: icons.OpenClaw.name,
	available: true,
	metaTitle: 'OpenClaw Social Scheduling — Telegram, WhatsApp & Self-Hosted Agent',
	metaDescription:
		'Self-host OpenClaw and add openquok-core to schedule Facebook, Instagram, X, LinkedIn, and more from Telegram, WhatsApp, Slack, or Discord. Local Gateway, ClawHub skills, human approval on OpenQuok.',
	hubDescription:
		'OpenClaw is a personal AI assistant on your own Gateway. Message from WhatsApp or Telegram, add openquok-core, and schedule social posts. You approve on OpenQuok.',
	keywords: [
		'OpenClaw social media',
		'OpenClaw Telegram scheduler',
		'OpenClaw WhatsApp social posts',
		'OpenClaw skill',
		'openquok-core skill',
		'self-hosted AI agent scheduling',
		'OpenClaw ClawHub OpenQuok',
		'OpenClaw CLI posting',
		'agentic social media scheduler',
		'OpenQuok OpenClaw integration',
		'schedule X from OpenClaw'
	],
	heroTitle: 'Schedule social media from OpenClaw then you approve',
	heroDescription:
		'OpenClaw is a personal AI assistant on your own devices. Message it from Telegram, WhatsApp, or Slack. Add the openquok-core skill so it drafts and schedules social posts. You review and approve on the calendar or kanban.',
	docsPath: '/docs/agent-setup-guides/openclaw',
	skillInstallOptions: OPENCLAW_SKILL_INSTALL_OPTIONS,
	workflowSection: {
		subtitle: 'Your messaging apps',
		title: 'Text from Telegram, WhatsApp, or Slack',
		description: `Send a scheduling request to OpenClaw like any other message. The openquok-core skill runs on your host. It finds connected channels, attaches media, and queues posts. ${WORKFLOW_PUBLISH_CHOICE_SENTENCE}`,
		deviceMock: 'iphone-15-pro',
		deviceMockContent: 'agent-chat-schedule',
		imageAlt: 'OpenClaw chat scheduling social posts via OpenQuok'
	},
	audienceSubtitle: 'Built for OpenClaw hosts',
	audienceTitle: 'Who connects OpenClaw to OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-emerald-400',
			title: 'Local-first operators',
			description:
				'You run the OpenClaw Gateway on your Mac, Linux box, or VPS. Your workspace and skills stay on hardware you control while you message from chat.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.MessageCircle.name,
			iconClass: 'text-lime-400',
			title: 'Multi-channel inbox users',
			description:
				'OpenClaw bridges dozens of messaging apps — WhatsApp, Telegram, Slack, Discord, Signal, and more. Schedule social posts from the same thread you already use.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.Sparkles.name,
			iconClass: 'text-rose-400',
			title: 'ClawHub skill builders',
			description:
				'Install openquok-core beside browser, cron, and community skills from the registry. OpenClaw returns structured JSON; OpenQuok keeps human approval on the calendar.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	messagingGateway: {
		agentLabel: 'OpenClaw',
		installStepTitle: '1. Install OpenClaw',
		installStepContent:
			'Go to official site and install locally, in a container, or on a host with a persistent workspace.',
		docsOverviewMockId: 'openclaw-docs-overview',
		docsMockUrl: 'docs.openclaw.ai',
		setupStep2Content: 'Choose the LLM provider and model OpenClaw should use.',
		skillInstallTerminalMockId: 'openquok-skill-install',
		integrationsStepProductName: 'OpenClaw',
		featureConnectDescription:
			'Choose a workspace, connect with OAuth2 — approve in your browser, and credentials stay on the host. Message OpenClaw from Telegram, WhatsApp, or Slack to draft and schedule without opening another app.',
		featureAnalyticsDescription:
			'Message OpenClaw on Telegram to pull impressions, likes, comments, and shares for any connected channel. Compare performance and schedule more of what already resonates — without opening the dashboard.',
		featureScaleDescription:
			'Spot a winner in analytics, then clone more dedicated workspaces for the next client or brand while OpenClaw queues the next wave in parallel — credentials, channels, and agent context stay isolated as you scale.',
		parallelScheduleAlt: 'OpenClaw desktop chat session scheduling posts in parallel',
		parallelAnalyticsAlt: 'Second OpenClaw desktop chat session pulling live analytics concurrently',
		parallelChatAlt:
			'OpenClaw Telegram chat scheduling posts while desktop sessions run in parallel'
	},
	comparisonSection: {
		subtitle: 'comparisons',
		title: 'agent-native scheduling, not another dashboard',
		description: 'Most social scheduler SaaS keeps you in a browser tab. OpenQuok is built for agents',
		withoutTitle: 'Typical social scheduler SaaS',
		withTitle: 'OpenQuok + OpenClaw',
		points: [
			{
				pain: 'Copy posts between your AI chat and a separate scheduling tool',
				feature: 'Message OpenClaw from WhatsApp, Telegram, or Slack to draft and schedule'
			},
			{
				pain: 'Siloed API keys and workflows that do not compose with your agent stack',
				feature: 'Eligibility is checked automatically — credentials stay on your host'
			},
			{
				pain: 'Always-on integrations that bloat agent context',
				feature: 'Skills load on-demand, keeping the agent context clean'
			},
			{
				pain: "Locked to one vendor's models or automation layer",
				feature: 'Works with any LLM: Claude, GPT, Gemini, Llama, and more'
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
		subtitle: 'Chat adapters',
		title: 'Supported channels',
		description: 'OpenClaw supports multiple messaging platforms out of the box:',
		extensionLabel: 'Extension Channels'
	},
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'OpenClaw + OpenQuok, answered',
	faqDescription:
		'What OpenClaw is, how to install openquok-core, supported platforms, human approval, and how agents draft and schedule posts from chat.',
	messagingGatewayFaq: buildMessagingGatewayOpenClawFaqParams(),
	overrides: {
		faqItemsAfterFirst: [
			{
				title: 'How do I pick OpenClaw vs Grok Bot or Dots?',
				description: buildAgentHostPickerFaqDescription('openclaw')
			}
		]
	}
} satisfies AgentHostLandingSeed;

export const openclawAgent = buildAgentHostLandingPage(openclawAgentSeed);
