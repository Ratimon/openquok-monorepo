import { icons } from '$data/icons';

import type { McpLandingSeed } from '$lib/content/constants/mcps/types';
export const vscode_copilotMcpSeed = {
		slug: 'vscode-copilot',
		label: 'VS Code / Copilot',
		mcpClient: 'VS Code / Copilot',
		icon: icons.Copilot.name,
		hubDescription: 'Project .vscode/mcp.json for GitHub Copilot',
		heroDescription:
			'GitHub Copilot in VS Code brings AI chat and agent tools into the editor you already use. Connect OpenQuok over MCP so Copilot drafts and schedules social posts while you review and approve on the calendar or kanban.',
		metaDescription:
			'Connect OpenQuok MCP to VS Code and GitHub Copilot — schedule social posts from your IDE. Approve every publish on the calendar or kanban.',
		workflowPhrase: 'your IDE',
		setupSteps: [
			'Install VS Code from code.visualstudio.com and enable GitHub Copilot',
			'Create a programmatic token under Developers → Access.',
			'Create or edit .vscode/mcp.json in your workspace root and paste the openquok server entry with type http.',
			'Reload the window, confirm openquok appears in the MCP panel, and ask Copilot to list your channels.'
		]
	} satisfies McpLandingSeed;
