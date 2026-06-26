import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

import type { McpClient } from '$lib/developers/utils/getMcpClientConfig';

export type PublicMcpIntegration = {
	/** Docs path segment under `/docs/mcp-setup-guides/`. */
	slug: string;
	label: string;
	mcpClient: McpClient;
	icon: IconName;
	/** Hub card blurb; aligned with mcp-setup-guides index LinkCard descriptions. */
	hubDescription: string;
};

export const PUBLIC_MCP_INTEGRATIONS: readonly PublicMcpIntegration[] = [
	{
		slug: 'cursor',
		label: 'Cursor',
		mcpClient: 'Cursor',
		icon: icons.Code.name,
		hubDescription: 'Project-level .cursor/mcp.json for Agent and Composer'
	},
	{
		slug: 'claude-code',
		label: 'Claude Code',
		mcpClient: 'Claude Code',
		icon: icons.Claude.name,
		hubDescription: 'claude mcp add with HTTP transport'
	},
	{
		slug: 'claude-cowork',
		label: 'Claude Cowork',
		mcpClient: 'Claude Cowork',
		icon: icons.Claude.name,
		hubDescription: 'Custom connectors and managedMcpServers'
	},
	{
		slug: 'vscode-copilot',
		label: 'VS Code / Copilot',
		mcpClient: 'VS Code / Copilot',
		icon: icons.FolderCode.name,
		hubDescription: 'Project .vscode/mcp.json for GitHub Copilot'
	},
	{
		slug: 'windsurf',
		label: 'Windsurf',
		mcpClient: 'Windsurf',
		icon: icons.Sparkles.name,
		hubDescription: 'Codeium Windsurf MCP config file'
	},
	{
		slug: 'amp',
		label: 'Amp',
		mcpClient: 'Amp',
		icon: icons.Terminal.name,
		hubDescription: 'amp mcp add or Amp settings.json'
	},
	{
		slug: 'codex',
		label: 'Codex',
		mcpClient: 'Codex',
		icon: icons.ChatGPT.name,
		hubDescription: 'OpenAI Codex config.toml MCP servers'
	},
	{
		slug: 'gemini-cli',
		label: 'Gemini CLI',
		mcpClient: 'Gemini CLI',
		icon: icons.Gemini.name,
		hubDescription: 'Google Gemini CLI settings.json'
	},
	{
		slug: 'warp',
		label: 'Warp',
		mcpClient: 'Warp',
		icon: icons.Terminal.name,
		hubDescription: 'Warp terminal MCP server settings'
	}
];

export function listPublicMcpIntegrationsForHub(): PublicMcpIntegration[] {
	return [...PUBLIC_MCP_INTEGRATIONS];
}
