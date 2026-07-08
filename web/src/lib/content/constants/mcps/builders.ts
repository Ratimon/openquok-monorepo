import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import type {
	FeaturesOrderedStep,
	PublicAgentComparisonSection,
	PublicAgentFeatureSection,
	PublicLandingWorkflowSection
} from '$lib/content/constants/agents/types';
import { PUBLIC_AGENT_LISTINGS_PREVIEW_SECTION } from '$lib/content/constants/agents/shared';
import {
	getMcpClientConfig,
	MCP_TOKEN_PLACEHOLDER,
	resolveMcpBaseUrl,
	type McpClient
} from '$lib/developers/utils/getMcpClientConfig';
import {
	getMcpInstallSafariContentId,
	getMcpVerifyMockThemeForClient,
	getMcpVerifySafariContentId
} from '$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig';
import { getMcpWorkflowScheduleContentId } from '$lib/ui/templates/device-mocks/safari/mcpWorkflowScheduleMockConfig';
import { getMcpWorkflowAnalyticsContentId } from '$lib/ui/templates/device-mocks/safari/mcpWorkflowAnalyticsMockConfig';

import type { McpLandingSeed, PublicMcpIntegrationViewModel, PublicMcpLandingPageViewModel } from '$lib/content/constants/mcps/types';

function buildMcpAudienceSection(
	label: string,
	workflowPhrase: string
): Pick<PublicMcpLandingPageViewModel, 'audienceSubtitle' | 'audienceTitle' | 'audienceCards'> {
	return {
		audienceSubtitle: `Built for ${label}`,
		audienceTitle: `Who connects ${label} to OpenQuok?`,
		audienceCards: [
			{
				iconName: icons.CustomizedDrawnLaptop.name,
				iconClass: 'text-sky-400',
				title: 'IDE & workflow users',
				description: `Stay in ${workflowPhrase} — Schedule social posts from your agent without opening another dashboard.`,
				containerClass: 'h-full min-h-[18rem]'
			},
			{
				iconName: icons.CustomizedDrawnRobot.name,
				iconClass: 'text-cyan-400',
				title: 'Developers & builders',
				description: `Connect OpenQuok over MCP with a programmatic token — ${label} lists channels and schedules posts with structured tools.`,
				containerClass: 'h-full min-h-[18rem]'
			},
			{
				iconName: icons.CustomizedDrawnHouse.name,
				iconClass: 'text-teal-400',
				title: 'Startup founders',
				description:
					'Schedule across Facebook, Instagram, Threads, YouTube, and TikTok from one workspace — you approve on the calendar or kanban before anything goes live.',
				containerClass: 'h-full min-h-[18rem]'
			}
		]
	};
}

function buildMcpFaqItems(label: string): PublicFaqItem[] {
	return [
		{
			title: `What is OpenQuok MCP for ${label}?`,
			description: `OpenQuok exposes social scheduling tools over MCP so ${label} can list connected channels, read platform limits, and draft or schedule posts in natural language — you approve what publishes in your OpenQuok workspace.`
		},
		{
			title: 'Do I need the CLI or openquok-core skill?',
			description: `No — ${label} connects over MCP with an opo_ token and built-in tools, which is the fastest path for editor and terminal workflows. The openquok-core skill on agent hosts like OpenClaw and Hermes is worth it when you want deeper customization: compose OpenQuok with other skills, run parallel sessions, automate from shell scripts, and scale into workflows MCP alone does not cover yet.`
		},
		{
			title: `Why use ${label} MCP instead of an agent host?`,
			description: `OpenClaw and Hermes fit always-on scheduling from Telegram, Discord, or Slack — persistent memory and parallel sessions across channels. ${label} fits when OpenQuok should live inside your editor or terminal: native MCP tool calls, focused sessions, and async tasks with clear specs. Choose ${label} when you already work there; choose an agent host when messaging-first scale matters. Many teams use both.`
		},
		{
			title: 'How do I authenticate?',
			description:
				'Create an OAuth app in Developers → Apps, generate an opo_ token under Developers → Access, then paste the MCP config with either an Authorization header or the API key in the URL path.'
		},
		{
			title: 'How do I verify the connection?',
			description:
				'Start a fresh session in your client and ask: List my connected social media accounts. The agent should call integrationList and return your workspace channels.'
		},
		{
			title: 'Which social platforms are supported?',
			description:
				'Facebook, Instagram (Business and Standalone), Threads, YouTube, TikTok, LinkedIn, and X are available today. Connect channels in the OpenQuok web app first.'
		}
	];
}

function buildMcpIntegrationsSetupStep(stepId: number, label: string): FeaturesOrderedStep {
	return {
		id: stepId,
		title: `${stepId}. Integrate & customize other skills or MCPs`,
		content: `Add Bloom, RevenueCat, or any skill or MCP beside openquok-core in ${label} — find your own viral formats and scale!`,
		animatedContent: 'agent-integrations',
		mediaAlt: 'Agent skills and integrations with OpenQuok',
		iconName: icons.Sparkles.name
	};
}

type McpStepBuildContext = {
	label: string;
	mcpClient: McpClient;
	installTheme: ReturnType<typeof getMcpVerifyMockThemeForClient>;
	mcpInstallCommand: string;
};

type McpSetupStepVisual = Partial<
	Pick<
		FeaturesOrderedStep,
		'deviceMock' | 'deviceMockContent' | 'terminalCode' | 'mockUrl' | 'mediaAlt'
	>
>;

/** Declarative step shape — edit titles, icons, and media here; per-client copy stays in MCP_LANDING_SEEDS. */
type McpSetupStepTemplate = {
	title: string;
	/** When true, title becomes "{title} {label}" (e.g. "Install Cursor"). */
	suffixLabel?: boolean;
	iconName: IconName;
	resolveVisual: (ctx: McpStepBuildContext) => McpSetupStepVisual;
	/** When set, overrides seed copy for this step (skill flow uses this for steps 2–3). */
	resolveContent?: (ctx: McpStepBuildContext, seedContent?: string) => string;
};

const MCP_SETUP_STEP_TEMPLATES: readonly McpSetupStepTemplate[] = [
	{
		title: 'Install',
		suffixLabel: true,
		iconName: icons.Terminal.name,
		resolveVisual: ({ label, mcpClient, installTheme }) => ({
			deviceMock: 'safari',
			deviceMockContent: getMcpInstallSafariContentId(mcpClient),
			mockUrl: installTheme.mockUrl,
			mediaAlt: `${label} documentation at ${installTheme.mockUrl}`
		})
	},
	{
		title: 'Generate your token',
		iconName: icons.OpenQuok.name,
		resolveVisual: () => ({
			deviceMock: 'settings-panel',
			deviceMockContent: 'programmatic-access-token',
			mediaAlt: 'Generate a programmatic access token in Developers Access'
		})
	},
	{
		title: 'Add OpenQuok MCP',
		iconName: icons.OpenQuok.name,
		resolveVisual: ({ mcpClient, mcpInstallCommand }) => ({
			deviceMock: 'terminal',
			terminalCode: mcpInstallCommand,
			mediaAlt: `Add OpenQuok MCP configuration for ${mcpClient}`
		})
	},
	{
		title: 'Verify in your client',
		iconName: icons.Check.name,
		resolveVisual: ({ mcpClient }) => ({
			deviceMock: 'desktop',
			deviceMockContent: getMcpVerifySafariContentId(mcpClient),
			mediaAlt: `Verify OpenQuok MCP in ${mcpClient}`
		})
	}
];

const MCP_SKILL_SETUP_STEP_TEMPLATES: readonly McpSetupStepTemplate[] = [
	{
		title: 'Install',
		suffixLabel: true,
		iconName: icons.Terminal.name,
		resolveVisual: ({ label, mcpClient, installTheme }) => ({
			deviceMock: 'safari',
			deviceMockContent: getMcpInstallSafariContentId(mcpClient),
			mockUrl: installTheme.mockUrl,
			mediaAlt: `${label} documentation at ${installTheme.mockUrl}`
		}),
		resolveContent: (_ctx, installStep) => installStep ?? ''
	},
	{
		title: 'Install openquok-core',
		iconName: icons.Terminal.name,
		resolveVisual: () => ({
			deviceMock: 'terminal',
			deviceMockContent: 'openquok-skill-install',
			mediaAlt: 'Install openquok-core skill and authenticate the OpenQuok CLI'
		}),
		resolveContent: ({ label }) =>
			`'Add openquok-core skill and authenticate the CLI once.' — ${label} discovers commands from SKILL.md in your project.`
	},
	{
		title: 'Verify in your client',
		iconName: icons.Check.name,
		resolveVisual: ({ label, mcpClient }) => ({
			deviceMock: 'desktop',
			deviceMockContent: getMcpWorkflowScheduleContentId(mcpClient),
			mediaAlt: `Verify openquok-core skill in ${label}`
		}),
		resolveContent: ({ label }) =>
			`Start a fresh ${label} session and ask: List my connected social media accounts — the agent should read the skill and return your workspace channels.`
	}
];

function createMcpStepBuildContext(label: string, mcpClient: McpClient): McpStepBuildContext {
	return {
		label,
		mcpClient,
		installTheme: getMcpVerifyMockThemeForClient(mcpClient),
		mcpInstallCommand: getMcpClientConfig(
			mcpClient,
			'header',
			resolveMcpBaseUrl(),
			MCP_TOKEN_PLACEHOLDER
		).config
	};
}

function formatMcpSetupStepTitle(
	stepNumber: number,
	{ title, suffixLabel }: McpSetupStepTemplate,
	label: string
): string {
	const stepTitle = suffixLabel ? `${title} ${label}` : title;
	return `${stepNumber}. ${stepTitle}`;
}

function buildSetupStepsFromTemplates(
	templates: readonly McpSetupStepTemplate[],
	seedContents: readonly string[] | null,
	ctx: McpStepBuildContext,
	integrationsStepId: number
): FeaturesOrderedStep[] {
	return [
		...templates.map((template, index) => ({
			id: index + 1,
			title: formatMcpSetupStepTitle(index + 1, template, ctx.label),
			content: template.resolveContent
				? template.resolveContent(ctx, seedContents?.[index])
				: (seedContents?.[index] ?? ''),
			iconName: template.iconName,
			...template.resolveVisual(ctx)
		})),
		buildMcpIntegrationsSetupStep(integrationsStepId, ctx.label)
	];
}

function toSetupSteps(
	label: string,
	steps: readonly [string, string, string, string],
	mcpClient: McpClient
): FeaturesOrderedStep[] {
	return buildSetupStepsFromTemplates(
		MCP_SETUP_STEP_TEMPLATES,
		steps,
		createMcpStepBuildContext(label, mcpClient),
		5
	);
}

export function toSkillSetupSteps(
	label: string,
	installStep: string,
	mcpClient: McpClient
): FeaturesOrderedStep[] {
	return buildSetupStepsFromTemplates(
		MCP_SKILL_SETUP_STEP_TEMPLATES,
		[installStep],
		createMcpStepBuildContext(label, mcpClient),
		4
	);
}

function buildMcpWorkflowSection(
	label: string,
	mcpClient: McpClient,
	workflowPhrase: string
): PublicLandingWorkflowSection {
	return {
		subtitle: `Prompt from ${workflowPhrase}`,
		title: 'One prompt, cross-channel schedule',
		description: `Describe what to publish in ${label}. Agent lists your connected channels, attaches media, and queues drafts for the time you pick — you approve on the calendar before anything goes live.`,
		deviceMock: 'desktop',
		deviceMockContent: getMcpWorkflowScheduleContentId(mcpClient),
		imageAlt: `Schedule social posts from ${label} via OpenQuok MCP`
	};
}

function buildMcpFeatureSections(label: string, mcpClient: McpClient): PublicAgentFeatureSection[] {
	const scheduleContentId = getMcpWorkflowScheduleContentId(mcpClient);
	const analyticsContentId = getMcpWorkflowAnalyticsContentId(mcpClient);

	return [
		{
			subtitle: 'Minimal setup',
			title: 'stay in your editor or terminal, connect once, schedule without switching apps',
			description: `${label} is built for focused sessions where you already ship work — paste one MCP config, and OpenQuok tools live inside that flow. List channels, draft posts, and queue schedules, without opening another dashboard or chat app.`,
			parallelMocks: [
				{
					deviceMock: 'settings-panel',
					deviceMockContent: 'programmatic-access-token',
					imageAlt: 'Generate a programmatic OpenQuok access token'
				},
				{
					deviceMock: 'desktop',
					deviceMockContent: getMcpVerifySafariContentId(mcpClient),
					imageAlt: `Verify OpenQuok MCP connection inside ${label}`
				}
			],
			imageAlt: `Connect OpenQuok to ${label} with a token and in-client verification`,
			mediaOnRight: true,
			cliCommandsTitle: 'First prompt to try',
			cliCommands: `List my connected social media accounts`
		},
		{
			subtitle: 'Kanban + smart filters',
			title: 'Review every AI draft, sign off confidently, before it goes live',
			description:
				'Move agent-generated posts from draft to review to scheduled on a kanban board — with the same smart filters as your calendar. Approve quality at scale instead of trusting autopilot.',
			bentoId: 'agent-multi-platform-bulk-scheduling',
			mediaOnRight: false,
			cliCommandsTitle: 'Example prompts',
			cliCommands: `Move post <id> to review and add a note to check the CTA before schedule`
		},
		{
			subtitle: 'Analytics',
			title: 'Ask what worked, see winners, and adapt from chat',
			description: `Ask ${label} to pull impressions, engagement, and post insights for any connected channel — compare without opening the dashboard.`,
			deviceMock: 'desktop',
			deviceMockContent: analyticsContentId,
			imageAlt: `${label} chat showing OpenQuok platform and post analytics`,
			mediaOnRight: true,
			cliCommandsTitle: 'Example prompts',
			cliCommands: `What performed best on my channels over the last 30 days?
Break down likes, comments, and shares for post <id>`
		},
		{
			subtitle: 'Scale what works',
			title: 'when a format hits, scale by adding workspaces and parallel sessions',
			description: `Spot a winner in analytics, then clone more dedicated workspaces for the next client or brand while parallel ${label} sessions queue posts and pull metrics — multi-workspace isolation keeps credentials and channels from mixing as you scale.`,
			parallelMocks: [
				{
					deviceMock: 'desktop',
					deviceMockContent: scheduleContentId,
					imageAlt: `${label} desktop session scheduling posts in parallel`
				},
				{
					deviceMock: 'desktop',
					deviceMockContent: analyticsContentId,
					imageAlt: `Second ${label} desktop session pulling live analytics concurrently`
				}
			],
			mediaOnRight: false,
			cliCommandsTitle: 'Parallel sessions',
			cliCommands: `# Workspace A — launch (client brand)
Queue my launch thread for Tue 9am across Facebook and Instagram

# Workspace B — another client (switch workspace + token)
List draft posts waiting for review in this workspace

# Same workspace — metrics in parallel
What performed best on my channels over the last 7 days?`
		}
	];
}

function buildMcpComparisonSection(
	label: string,
	workflowPhrase: string
): PublicAgentComparisonSection {
	return {
		subtitle: 'comparisons',
		title: 'MCP-native scheduling, not another dashboard',
		description:
			'Most social scheduler SaaS keeps you in a browser tab. OpenQuok is built for MCP clients in your editor and terminal',
		withoutTitle: 'Typical social scheduler SaaS',
		withTitle: `OpenQuok + ${label}`,
		points: [
			{
				pain: 'Copy posts between your AI session and a separate scheduling tool',
				feature: `Stay in ${workflowPhrase} — Schedule from ${label} in one session`
			},
			{
				pain: 'Siloed API keys and workflows that do not compose with your agent stack',
				feature:
					'Connect over MCP — credentials stay in your workspace'
			},
			{
				pain: 'Custom integrations you maintain for every tool and channel',
				feature:
					'Built-in MCP tools that upload media, and schedule with structured responses'
			},
			{
				pain: "Locked to one vendor's models or automation layer",
				feature: `Works with any model ${label} supports — Claude, GPT, Gemini, and more`
			},
			{
				pain: 'Autopilot publishing with no human checkpoint',
				feature:
					'Every post lands as draft or scheduled — you approve before anything goes live'
			}
		]
	};
}

export function buildMcpLandingPage(seed: McpLandingSeed): PublicMcpLandingPageViewModel {
	const {
		slug,
		label,
		mcpClient,
		icon,
		hubDescription,
		heroDescription,
		metaDescription,
		workflowPhrase,
		setupSteps
	} = seed;

	const audience = buildMcpAudienceSection(label, workflowPhrase);

	return {
		pageType: 'mcp-client',
		slug,
		agentId: slug,
		agentLabel: label,
		mcpClient,
		icon,
		available: true,
		metaTitle: `${label} MCP Social Media for OpenQuok`,
		metaDescription,
		hubDescription,
		keywords: [
			`${label} MCP`,
			'OpenQuok MCP',
			'MCP social media scheduler',
			'agentic social media',
			'programmatic token MCP'
		],
		heroTitle: `Schedule social media from ${label} then you approve`,
		heroDescription,
		docsPath: `/docs/mcp-setup-guides/${slug}`,
		workflowSection: buildMcpWorkflowSection(label, mcpClient, workflowPhrase),
		audienceSubtitle: audience.audienceSubtitle,
		audienceTitle: audience.audienceTitle,
		audienceCards: audience.audienceCards,
		setupStepsSubtitle: 'How it works',
		setupStepsTitle: `Five steps,to ${label} + OpenQuok`,
		setupSteps: toSetupSteps(label, setupSteps, mcpClient),
		skillSetupStepsSubtitle: 'How it works',
		skillSetupStepsTitle: `Four steps,to ${label} + openquok-core`,
		skillSetupSteps: toSkillSetupSteps(label, setupSteps[0], mcpClient),
		featureSections: buildMcpFeatureSections(label, mcpClient),
		listingsPreviewSection: PUBLIC_AGENT_LISTINGS_PREVIEW_SECTION,
		comparisonSection: buildMcpComparisonSection(label, workflowPhrase),
		faqSubtitle: 'Frequently asked questions',
		faqTitle: `${label} + OpenQuok MCP, answered`,
		faqDescription: `Connect ${label} to OpenQuok over MCP — authentication, verification, and scheduling posts from chat.`,
		faqItems: buildMcpFaqItems(label)
	};
}

