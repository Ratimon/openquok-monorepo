import { icons } from '$data/icons';

import type { McpLandingSeed } from '$lib/content/constants/mcps/types';
export const ampMcpSeed = {
		slug: 'amp',
		label: 'Amp',
		mcpClient: 'Amp',
		icon: icons.Amp.name,
		hubDescription: 'amp mcp add or Amp settings.json',
		heroDescription:
			'Amp is a fast AI coding agent built for terminal and IDE workflows. Connect OpenQuok over MCP so Amp drafts and schedules social posts while you review and approve on the calendar or kanban.',
		metaDescription:
			'Connect OpenQuok MCP to Amp — schedule social posts from your coding agent. Approve every publish on the calendar or kanban.',
		workflowPhrase: 'your terminal and IDE',
		setupSteps: [
			'Install Amp from amp.dev and sign in',
			'Create a programmatic token under Developers → Access.',
			'Run amp mcp add openquok with your URL, or add the amp.mcpServers block from the configuration section to your Amp settings.json.',
			'Open a fresh Amp session and ask: List my connected social media accounts.'
		]
	} satisfies McpLandingSeed;
