import { icons } from '$data/icons';

import type { McpLandingSeed } from '$lib/content/constants/mcps/types';
export const devin_desktopMcpSeed = {
		slug: 'devin-desktop',
		label: 'Devin Desktop',
		mcpClient: 'Devin Desktop',
		icon: icons.Devin.name,
		hubDescription: 'Add OpenQuok in ~/.codeium/mcp_config.json for Devin Local.',
		heroDescription:
			'Devin Desktop is a local AI coding agent. Devin Local runs in your editor with MCP tool support. Connect OpenQuok. Devin drafts and schedules social posts. You review and approve on the calendar or kanban.',
		metaDescription:
			'Connect OpenQuok MCP to Devin Desktop. Schedule social posts from Devin Local. Approve every publish on the calendar or kanban.',
		workflowPhrase: 'your editor',
		setupSteps: [
			'Download and install Devin Desktop from docs.devin.ai',
			'Generate a programmatic token under Developers → Access.',
			'Add the openquok entry to ~/.codeium/mcp_config.json using the snippet below (serverUrl ending in /mcp; or Settings → Tools → View Raw Config).',
			'Reload Devin Desktop (or refresh MCP in Settings → Tools) and verify with: List my connected social media accounts.'
		]
	} satisfies McpLandingSeed;
