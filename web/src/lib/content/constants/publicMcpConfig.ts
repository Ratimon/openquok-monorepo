import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import type { FeaturesOrderedStep } from '$lib/content/constants/publicAgentConfig';
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

export type PublicMcpIntegration = {
	slug: string;
	label: string;
	mcpClient: McpClient;
	icon: IconName;
	/** Hub card blurb; aligned with mcp-setup-guides index LinkCard descriptions. */
	hubDescription: string;
};

export type PublicMcpLandingPage = {
	pageType: 'mcp-client';
	slug: string;
	agentId: string;
	agentLabel: string;
	mcpClient: McpClient;
	icon: IconName;
	heroTitle: string;
	heroDescription: string;
	metaTitle: string;
	metaDescription: string;
	hubDescription: string;
	keywords: string[];
	docsPath: string;
	setupStepsSubtitle: string;
	setupStepsTitle: string;
	setupSteps: FeaturesOrderedStep[];
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: PublicFaqItem[];
	available: boolean;
};

type McpLandingSeed = PublicMcpIntegration & {
	heroDescription: string;
	metaDescription: string;
	/** Plain-text steps: install client, generate token, add MCP config, verify. */
	setupSteps: readonly [string, string, string, string];
};

function buildMcpFaqItems(label: string): PublicFaqItem[] {
	return [
		{
			title: `What is OpenQuok MCP for ${label}?`,
			description: `OpenQuok exposes social scheduling tools over HTTP MCP so ${label} can list connected channels, read platform limits, and draft or schedule posts in natural language — you approve what publishes in your OpenQuok workspace.`
		},
		{
			title: 'Do I need the CLI or openquok-core skill?',
			description:
				'No. Native MCP clients connect directly with an opo_ programmatic token. Agent hosts like OpenClaw and Hermes can still use the CLI skill if you prefer shell-based workflows.'
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
				'Facebook, Instagram (Business and Standalone), Threads, YouTube, and TikTok are available today. LinkedIn and X are on the roadmap. Connect channels in the OpenQuok web app first.'
		}
	];
}

function toSetupSteps(
	label: string,
	steps: readonly [string, string, string, string],
	mcpClient: McpClient
): FeaturesOrderedStep[] {
	const titles = ['Install', 'Generate your token', 'Add OpenQuok MCP', 'Verify in your client'] as const;
	const mcpInstallCommand = getMcpClientConfig(
		mcpClient,
		'header',
		resolveMcpBaseUrl(),
		MCP_TOKEN_PLACEHOLDER
	).config;
	const installTheme = getMcpVerifyMockThemeForClient(mcpClient);

	return steps.map((content, index) => ({
		id: index + 1,
		title: `${index + 1}. ${index === 0 ? `${titles[index]} ${label}` : titles[index]}`,
		content,
		iconName: index === steps.length - 1 ? icons.Check.name : icons.Terminal.name,
		...(index === 0
			? {
					deviceMock: 'safari' as const,
					deviceMockContent: getMcpInstallSafariContentId(mcpClient),
					mockUrl: installTheme.mockUrl,
					mediaAlt: `${label} documentation at ${installTheme.mockUrl}`
				}
			: {}),
		...(index === 1
			? {
					deviceMock: 'settings-panel' as const,
					deviceMockContent: 'programmatic-access-token' as const,
					mediaAlt: 'Generate a programmatic access token in Developers Access'
				}
			: {}),
		...(index === 2
			? {
					deviceMock: 'terminal' as const,
					terminalCode: mcpInstallCommand,
					mediaAlt: `Add OpenQuok MCP configuration for ${mcpClient}`
				}
			: {}),
		...(index === 3
			? {
					deviceMock: 'desktop' as const,
					deviceMockContent: getMcpVerifySafariContentId(mcpClient),
					mediaAlt: `Verify OpenQuok MCP in ${mcpClient}`
				}
			: {})
	}));
}

function buildMcpLandingPage(seed: McpLandingSeed): PublicMcpLandingPage {
	const { slug, label, mcpClient, icon, hubDescription, heroDescription, metaDescription, setupSteps } =
		seed;

	return {
		pageType: 'mcp-client',
		slug,
		agentId: slug,
		agentLabel: label,
		mcpClient,
		icon,
		heroTitle: `Schedule social media from ${label} then you approve`,
		heroDescription,
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
		docsPath: `/docs/mcp-setup-guides/${slug}`,
		setupStepsSubtitle: 'How it works',
		setupStepsTitle: `Four steps,to ${label} + OpenQuok`,
		setupSteps: toSetupSteps(label, setupSteps, mcpClient),
		faqSubtitle: 'Frequently asked questions',
		faqTitle: `${label} + OpenQuok MCP, answered`,
		faqDescription: `Connect ${label} to OpenQuok over HTTP MCP — authentication, verification, and scheduling posts from chat.`,
		faqItems: buildMcpFaqItems(label),
		available: true
	};
}

const MCP_LANDING_SEEDS: readonly McpLandingSeed[] = [
	{
		slug: 'cursor',
		label: 'Cursor',
		mcpClient: 'Cursor',
		icon: icons.Cursor.name,
		hubDescription: 'Project-level .cursor/mcp.json for Agent and Composer',
		heroDescription:
			'Cursor reads MCP servers from .cursor/mcp.json at your project root. Add the openquok server with your programmatic token so Agent and Composer can draft and schedule social posts while you approve on the calendar or kanban.',
		metaDescription:
			'Connect OpenQuok MCP to Cursor via .cursor/mcp.json for Agent, Composer, and inline chat tools — schedule social posts from your editor.',
		setupSteps: [
			'Download and install Cursor from cursor.com — recent stable builds include MCP support for Agent and Composer.',
			'Create an opo_ programmatic token under Account → Settings → Developers → Access.',
			'Create or open .cursor/mcp.json at your project root and add the openquok server entry from the configuration section.',
			'Reload Cursor, start a new Agent session, and ask: List my connected social media accounts.'
		]
	},
	{
		slug: 'claude-code',
		label: 'Claude Code',
		mcpClient: 'Claude Code',
		icon: icons.Claude.name,
		hubDescription: 'claude mcp add with HTTP transport',
		heroDescription:
			'Claude Code registers remote MCP servers with claude mcp add over HTTP transport — no local proxy required. Connect OpenQuok so your terminal agent drafts and schedules posts while you approve what goes live.',
		metaDescription:
			'Add OpenQuok to Claude Code with claude mcp add and HTTP streamable transport — schedule social posts from your terminal agent.',
		setupSteps: [
			'Install Claude Code from the official Anthropic docs — use the one-line installer or your preferred package manager.',
			'Generate a programmatic token in Developers → Access.',
			'Run the claude mcp add openquok command from the configuration section in your terminal.',
			'Start a new Claude Code session and ask your agent to list connected channels.'
		]
	},
	{
		slug: 'claude-cowork',
		label: 'Claude Cowork',
		mcpClient: 'Claude Cowork',
		icon: icons.ClaudeGlyph.name,
		hubDescription: 'Custom connectors and managedMcpServers',
		heroDescription:
			'Claude Cowork supports custom connectors and managedMcpServers for organization-wide MCP. Wire OpenQuok so coworkers draft and schedule social posts with human approval in your workspace.',
		metaDescription:
			'Connect OpenQuok MCP to Claude Cowork via custom connectors or managedMcpServers — organization-wide social scheduling for AI coworkers.',
		setupSteps: [
			'Access Claude Cowork through claude.com — your organization needs custom connectors or managed MCP servers enabled.',
			'Generate a programmatic token for your workspace under Developers → Access.',
			'Add the openquok connector JSON from the configuration section via Custom connectors or managedMcpServers in Cowork organization settings.',
			'Start a new Cowork session and verify with: List my connected social media accounts.'
		]
	},
	{
		slug: 'vscode-copilot',
		label: 'VS Code / Copilot',
		mcpClient: 'VS Code / Copilot',
		icon: icons.Copilot.name,
		hubDescription: 'Project .vscode/mcp.json for GitHub Copilot',
		heroDescription:
			'VS Code with GitHub Copilot reads MCP servers from .vscode/mcp.json in the workspace you opened. Add openquok so Copilot Chat can schedule social posts while you stay in control of publishing.',
		metaDescription:
			'Connect OpenQuok MCP to VS Code and GitHub Copilot via .vscode/mcp.json — schedule social posts from your IDE.',
		setupSteps: [
			'Install VS Code from code.visualstudio.com and enable GitHub Copilot — MCP servers load from .vscode/mcp.json in your workspace.',
			'Create a programmatic token under Developers → Access.',
			'Create or edit .vscode/mcp.json in your workspace root and paste the openquok server entry with type http.',
			'Reload the window, confirm openquok appears in the MCP panel, and ask Copilot to list your channels.'
		]
	},
	{
		slug: 'windsurf',
		label: 'Windsurf',
		mcpClient: 'Windsurf',
		icon: icons.Sparkles.name,
		hubDescription: 'Codeium Windsurf MCP config file',
		heroDescription:
			'Windsurf loads MCP servers from its mcp_config.json. Add openquok with your programmatic token so Cascade can draft and schedule social posts from the editor.',
		metaDescription:
			'Connect OpenQuok MCP to Windsurf via the Codeium MCP config file — schedule social posts from Cascade.',
		setupSteps: [
			'Download and install Windsurf from windsurf.com — Cascade reads MCP servers from the Windsurf MCP config.',
			'Generate a programmatic token under Developers → Access.',
			'Add the openquok entry to ~/.codeium/windsurf/mcp_config.json using the snippet below.',
			'Reload Windsurf and verify with: List my connected social media accounts.'
		]
	},
	{
		slug: 'amp',
		label: 'Amp',
		mcpClient: 'Amp',
		icon: icons.Terminal.name,
		hubDescription: 'amp mcp add or Amp settings.json',
		heroDescription:
			'Amp supports MCP over HTTP via amp mcp add or settings.json. Connect OpenQuok so your Amp agent can schedule social posts with structured tools and human approval.',
		metaDescription:
			'Connect OpenQuok MCP to Amp with amp mcp add or Amp settings.json — schedule social posts from your Amp agent.',
		setupSteps: [
			'Install Amp from amp.dev and sign in — register remote MCP servers via amp mcp add or settings.json.',
			'Create a programmatic token under Developers → Access.',
			'Run amp mcp add openquok with your URL, or add the amp.mcpServers block from the configuration section to your Amp settings.json.',
			'Open a fresh Amp session and ask: List my connected social media accounts.'
		]
	},
	{
		slug: 'codex',
		label: 'Codex',
		mcpClient: 'Codex',
		icon: icons.ChatGPT.name,
		hubDescription: 'OpenAI Codex config.toml MCP servers',
		heroDescription:
			'OpenAI Codex loads MCP servers from ~/.codex/config.toml. Add an [mcp_servers.openquok] table with your API URL and token so Codex can draft and schedule posts while you approve.',
		metaDescription:
			'Connect OpenQuok MCP to OpenAI Codex via config.toml — schedule social posts from your Codex agent.',
		setupSteps: [
			'Install OpenAI Codex from the official docs — MCP servers are configured in ~/.codex/config.toml.',
			'Generate a programmatic token under Developers → Access.',
			'Append the [mcp_servers.openquok] block from the configuration section to ~/.codex/config.toml.',
			'Restart Codex or open a fresh session, then ask: List my connected social media accounts.'
		]
	},
	{
		slug: 'gemini-cli',
		label: 'Gemini CLI',
		mcpClient: 'Gemini CLI',
		icon: icons.Gemini.name,
		hubDescription: 'Google Gemini CLI settings.json',
		heroDescription:
			'Google Gemini CLI reads MCP servers from ~/.gemini/settings.json. Add openquok so your CLI agent can list channels and schedule social posts from natural language.',
		metaDescription:
			'Connect OpenQuok MCP to Google Gemini CLI via settings.json — schedule social posts from your terminal agent.',
		setupSteps: [
			'Install Google Gemini CLI from the official docs — MCP servers load from ~/.gemini/settings.json.',
			'Create a programmatic token under Developers → Access.',
			'Add the mcpServers.openquok entry from the configuration section to ~/.gemini/settings.json.',
			'Restart Gemini CLI and verify with: List my connected social media accounts.'
		]
	},
	{
		slug: 'warp',
		label: 'Warp',
		mcpClient: 'Warp',
		icon: icons.Terminal.name,
		hubDescription: 'Warp terminal MCP server settings',
		heroDescription:
			'Warp terminal supports MCP server settings in-app. Add openquok with your programmatic token so Warp AI can draft and schedule social posts while you approve in OpenQuok.',
		metaDescription:
			'Connect OpenQuok MCP to Warp terminal — schedule social posts from Warp AI with your programmatic token.',
		setupSteps: [
			'Download and install Warp from warp.dev — add MCP servers under Settings → MCP Servers.',
			'Generate an opo_ programmatic token under Developers → Access.',
			'Open Settings → MCP Servers → + Add in Warp and paste the openquok config from the section.',
			'Start a new Warp AI session and ask: List my connected social media accounts.'
		]
	}
];

export const PUBLIC_MCP_LANDING_PAGES: readonly PublicMcpLandingPage[] =
	MCP_LANDING_SEEDS.map(buildMcpLandingPage);

const mcpBySlug = new Map(PUBLIC_MCP_LANDING_PAGES.map((page) => [page.slug, page]));

export function getPublicMcpLandingBySlug(slug: string): PublicMcpLandingPage | undefined {
	const key = slug.trim().toLowerCase();
	return mcpBySlug.get(key);
}

export function getAvailablePublicMcpLandingBySlug(slug: string): PublicMcpLandingPage | undefined {
	const page = getPublicMcpLandingBySlug(slug);
	if (!page?.available) return undefined;
	return page;
}

export function listPublicMcpLandingPages(): PublicMcpLandingPage[] {
	return [...PUBLIC_MCP_LANDING_PAGES];
}

export function listPublicMcpIntegrationsForHub(): PublicMcpIntegration[] {
	return PUBLIC_MCP_LANDING_PAGES.map(
		({ slug, agentLabel, mcpClient, icon, hubDescription }) => ({
			slug,
			label: agentLabel,
			mcpClient,
			icon,
			hubDescription
		})
	);
}
