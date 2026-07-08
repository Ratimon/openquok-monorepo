import { icons } from '$data/icons';

import type { McpLandingSeed } from '$lib/content/constants/mcps/types';
export const antigravity_cliMcpSeed = {
		slug: 'antigravity-cli',
		label: 'Antigravity CLI',
		mcpClient: 'Antigravity CLI',
		icon: icons.Antigravity.name,
		hubDescription: 'Global ~/.gemini/config/mcp_config.json for agy',
		heroDescription:
			'Antigravity CLI is Google\'s terminal agent for Gemini — run agy from your shell to automate tasks with natural language. Connect OpenQuok over MCP so your agent drafts and schedules social posts while you review and approve on the calendar or kanban.',
		metaDescription:
			'Connect OpenQuok MCP to Antigravity CLI — draft and schedule social posts from your terminal agent. Approve every publish on the calendar or kanban.',
		workflowPhrase: 'your terminal',
		setupSteps: [
			'Install Antigravity CLI from antigravity.google —  with the agy binary',
			'Create a programmatic token under Developers → Access.',
			'Add the openquok entry to ~/.gemini/config/mcp_config.json using the snippet below (serverUrl ending in /mcp — not url).',
			'Restart agy and verify with: List my connected social media accounts.'
		]
	} satisfies McpLandingSeed;
