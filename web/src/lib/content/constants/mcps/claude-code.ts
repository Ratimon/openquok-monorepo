import { icons } from '$data/icons';

import type { McpLandingSeed } from '$lib/content/constants/mcps/types';
export const claude_codeMcpSeed = {
		slug: 'claude-code',
		label: 'Claude Code',
		mcpClient: 'Claude Code',
		icon: icons.Claude.name,
		hubDescription: 'claude mcp add with HTTP transport',
		heroDescription:
			'Claude Code is Anthropic\'s terminal-first coding agent — run it from your shell with remote MCP servers over HTTP. Connect OpenQuok so Claude Code drafts and schedules social posts while you review and approve on the calendar or kanban.',
		metaDescription:
			'Connect OpenQuok MCP to Claude Code — schedule social posts from your terminal agent. Approve every publish on the calendar or kanban.',
		workflowPhrase: 'your terminal',
		setupSteps: [
			'Install Claude Code from the official Anthropic docs',
			'Generate a programmatic token in Developers → Access.',
			'Run the claude mcp add openquok command from the configuration section in your terminal.',
			'Start a new Claude Code session and ask your agent to list connected channels.'
		]
	} satisfies McpLandingSeed;
