import { icons } from '$data/icons';

import type { McpLandingSeed } from '$lib/content/constants/mcps/types';
export const codexMcpSeed = {
		slug: 'codex',
		label: 'Codex',
		mcpClient: 'Codex',
		icon: icons.ChatGPT.name,
		hubDescription: 'OpenAI Codex config.toml MCP servers',
		heroDescription:
			'OpenAI Codex is a terminal-first coding agent — run it from your CLI or IDE to ship code with natural language. Connect OpenQuok over MCP so Codex drafts and schedules social posts while you review and approve on the calendar or kanban.',
		metaDescription:
			'Connect OpenQuok MCP to OpenAI Codex — draft and schedule social posts from your CLI and IDE. Approve every publish on the calendar or kanban.',
		workflowPhrase: 'the CLI and your IDE',
		setupSteps: [
			'Install OpenAI Codex from the official docs',
			'Generate a programmatic token under Developers → Access.',
			'Append the [mcp_servers.openquok] block from the configuration section to ~/.codex/config.toml.',
			'Restart Codex or open a fresh session, then ask: List my connected social media accounts.'
		]
	} satisfies McpLandingSeed;
