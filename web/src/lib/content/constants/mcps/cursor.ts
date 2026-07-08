import { icons } from '$data/icons';

import type { McpLandingSeed } from '$lib/content/constants/mcps/types';
export const cursorMcpSeed = {
		slug: 'cursor',
		label: 'Cursor',
		mcpClient: 'Cursor',
		icon: icons.Cursor.name,
		hubDescription: 'Project-level .cursor/mcp.json for Agent and Composer',
		heroDescription:
			'Cursor is an AI-native code editor with Agent and Composer built in. Connect OpenQuok over MCP so you draft and schedule social posts from your editor while you review and approve on the calendar or kanban.',
		metaDescription:
			'Connect OpenQuok MCP to Cursor — schedule social posts from Agent and Composer. Approve every publish on the calendar or kanban.',
		workflowPhrase: 'your editor',
		setupSteps: [
			'Download and install Cursor from cursor.com',
			'Create an opo_ programmatic token under Account → Settings → Developers → Access.',
			'Create or open .cursor/mcp.json at your project root and add the openquok server entry from the configuration section.',
			'Reload Cursor, start a new Agent session, and ask: List my connected social media accounts.'
		]
	} satisfies McpLandingSeed;
