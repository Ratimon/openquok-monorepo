import type { McpClient } from '$lib/developers/utils/getMcpClientConfig';

export type OnboardingMcpClientId = 'cursor' | 'claude-code' | 'codex' | 'vscode';

export type OnboardingMcpClientDefinition = {
	id: OnboardingMcpClientId;
	label: string;
	mcpClient: McpClient;
	docsSlug: string;
	summary: string;
	steps: readonly string[];
};

export const ONBOARDING_MCP_CLIENTS: readonly OnboardingMcpClientDefinition[] = [
	{
		id: 'cursor',
		label: 'Cursor',
		mcpClient: 'Cursor',
		docsSlug: 'cursor',
		summary:
			'Cursor reads MCP servers from .cursor/mcp.json',
		steps: [
			'Create or open .cursor/mcp.json at your project root.',
			'Add the openquok server entry from Developers → Access (or the snippet on the next step).',
			'Reload Cursor and start a new Agent session.'
		]
	},
	{
		id: 'claude-code',
		label: 'Claude Code',
		mcpClient: 'Claude Code',
		docsSlug: 'claude-code',
		summary:
			'Claude Code registers remote MCP servers with claude mcp add over HTTP transport — no local proxy required.',
		steps: [
			'Generate an opo_ programmatic token in Developers → Access.',
			'Run the claude mcp add openquok command from the next step in your terminal.',
			'Start a new Claude Code session and ask your agent to list connected channels.'
		]
	},
	{
		id: 'codex',
		label: 'Codex',
		mcpClient: 'Codex',
		docsSlug: 'codex',
		summary:
			'OpenAI Codex loads MCP servers from ~/.codex/config.toml. Add an [mcp_servers.openquok] table with your API URL and token.',
		steps: [
			'Append the OpenQuok block to ~/.codex/config.toml.',
			'Restart Codex or open a fresh session.',
			'Verify with: List my connected social media accounts.'
		]
	},
	{
		id: 'vscode',
		label: 'VS Code / Copilot',
		mcpClient: 'VS Code / Copilot',
		docsSlug: 'vscode-copilot',
		summary:
			'VS Code with GitHub Copilot reads MCP servers from .vscode/mcp.json in the workspace you opened.',
		steps: [
			'Create or edit .vscode/mcp.json in your workspace root.',
			'Paste the openquok server entry under servers with type http.',
			'Reload the window and confirm openquok appears in the MCP panel.'
		]
	}
];

export function getOnboardingMcpClientById(
	id: OnboardingMcpClientId
): OnboardingMcpClientDefinition {
	return ONBOARDING_MCP_CLIENTS.find((c) => c.id === id) ?? ONBOARDING_MCP_CLIENTS[0]!;
}
