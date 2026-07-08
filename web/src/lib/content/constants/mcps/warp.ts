import { icons } from '$data/icons';

import type { McpLandingSeed } from '$lib/content/constants/mcps/types';
export const warpMcpSeed = {
		slug: 'warp',
		label: 'Warp',
		mcpClient: 'Warp',
		icon: icons.Warp.name,
		hubDescription: 'Warp terminal MCP server settings',
		heroDescription:
			'Warp is a modern terminal with built-in AI — run commands and agent workflows from one place. Connect OpenQuok over MCP so Warp AI drafts and schedules social posts while you review and approve on the calendar or kanban.',
		metaDescription:
			'Connect OpenQuok MCP to Warp terminal — schedule social posts from Warp AI. Approve every publish on the calendar or kanban.',
		workflowPhrase: 'your terminal',
		setupSteps: [
			'Download and install Warp from warp.dev',
			'Generate an opo_ programmatic token under Developers → Access.',
			'Open Settings → MCP Servers → + Add in Warp and paste the openquok config from the section.',
			'Start a new Warp AI session and ask: List my connected social media accounts.'
		]
	} satisfies McpLandingSeed;
