import { icons } from '$data/icons';

import type { FeaturesOrderedStep, PublicAgentFeatureSection } from '$lib/content/constants/agents/types';
import type { SafariMockContentId } from '$lib/ui/templates/device-mocks/safari/safariMock.types';
import type { TerminalMockContentId } from '$lib/ui/templates/device-mocks/terminal/terminalMock.types';

export type MessagingGatewayArchetypeParams = {
	agentLabel: string;
	installStepTitle: string;
	installStepContent: string;
	docsOverviewMockId: SafariMockContentId;
	docsMockUrl: string;
	setupStep2Content: string;
	skillInstallTerminalMockId: TerminalMockContentId;
	integrationsStepProductName: string;
	featureConnectDescription: string;
	featureAnalyticsDescription: string;
	featureScaleDescription: string;
	parallelScheduleAlt: string;
	parallelAnalyticsAlt: string;
	parallelChatAlt: string;
};

export function buildMessagingGatewaySetupSteps(
	params: MessagingGatewayArchetypeParams
): FeaturesOrderedStep[] {
	const {
		agentLabel,
		installStepTitle,
		installStepContent,
		docsOverviewMockId,
		docsMockUrl,
		setupStep2Content,
		skillInstallTerminalMockId,
		integrationsStepProductName
	} = params;

	return [
		{
			id: 1,
			title: installStepTitle,
			content: installStepContent,
			mediaAlt: `${agentLabel} documentation overview`,
			deviceMock: 'safari',
			deviceMockContent: docsOverviewMockId,
			mockUrl: docsMockUrl,
			iconName: icons.Terminal.name
		},
		{
			id: 2,
			title: '2. Select model',
			content: setupStep2Content,
			animatedContent: 'llm-models',
			mediaAlt: `Model selection in ${agentLabel}`,
			iconName: icons.Bot.name
		},
		{
			id: 3,
			title: '3. Configure chat channel',
			content: 'Connect WhatsApp, Telegram, Slack, or another chat app you already use.',
			mediaAlt: `Telegram chat channel configuration for ${agentLabel}`,
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'telegram-connect',
			iconName: icons.MessageCircle.name
		},
		{
			id: 4,
			title: '4. Install openquok-core skill',
			content: 'Add openquok-core skill and authenticate the CLI once.',
			mediaAlt: 'Install openquok-core skill and authenticate the OpenQuok CLI',
			deviceMock: 'terminal',
			deviceMockContent: skillInstallTerminalMockId,
			iconName: icons.OpenQuok.name
		},
		{
			id: 5,
			title: '5. Integrate & customize other skills or MCPs',
			content: `Add Bloom, RevenueCat, or any ${integrationsStepProductName} skill beside openquok-core — find your own viral formats and scale!`,
			animatedContent: 'agent-integrations',
			mediaAlt: 'Agent skills and integrations with OpenQuok',
			iconName: icons.Sparkles.name
		}
	];
}

const KANBAN_CLI = `# Draft + human checklist
openquok posts:create -c "…" -s "…" -t draft -i "<uuid>" --note "Check CTA before schedule"

openquok posts:review-todo <post-id> --note "…"
openquok posts:status <post-id> --status draft
openquok posts:status <post-id> -s schedule`;

const ANALYTICS_CLI = `# Platform metrics (followers, impressions, engagement)
openquok analytics:platform <integration-uuid> -d 30

# Per-post insights (likes, comments, shares)
openquok analytics:post <post-id> -d 7`;

const PARALLEL_CLI = `# Workspace A — launch (client brand)
openquok posts:create -c "…" -s "…" -t draft -i "<uuid>"
openquok posts:status <post-id> -s schedule

# Workspace B — another client (isolated credentials)
openquok posts:list --status draft

# Same workspace — metrics in parallel
openquok analytics:platform <integration-uuid> -d 7
openquok analytics:post <post-id> -d 30`;

export function buildMessagingGatewayFeatureSections(
	params: MessagingGatewayArchetypeParams
): PublicAgentFeatureSection[] {
	const { agentLabel, featureConnectDescription, featureAnalyticsDescription, featureScaleDescription } =
		params;

	return [
		{
			subtitle: 'Connect Once',
			title: 'login from your phone, pick your workspace, chat anywhere securely',
			description: featureConnectDescription,
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'openquok-login',
			imageAlt: `${agentLabel} chat guiding OpenQuok OAuth device login and workspace authorization`,
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
			cliCommands: KANBAN_CLI
		},
		{
			subtitle: 'Analytics',
			title: 'Ask what worked, see winners, and adapt from chat',
			description: featureAnalyticsDescription,
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'telegram-analytics',
			imageAlt: `${agentLabel} Telegram chat showing OpenQuok platform and post analytics`,
			mediaOnRight: true,
			cliCommandsTitle: 'CLI analytics options',
			cliCommands: ANALYTICS_CLI
		},
		{
			subtitle: 'Scale what works',
			title: 'when a format hits, scale by adding workspaces and parallel sessions',
			description: featureScaleDescription,
			parallelMocks: [
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-schedule',
					imageAlt: params.parallelScheduleAlt
				},
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-analytics',
					imageAlt: params.parallelAnalyticsAlt
				},
				{
					deviceMock: 'iphone-15-pro',
					deviceMockContent: 'agent-chat-schedule',
					imageAlt: params.parallelChatAlt
				}
			],
			mediaOnRight: false,
			cliCommandsTitle: 'Parallel CLI sessions',
			cliCommands: PARALLEL_CLI
		}
	];
}
