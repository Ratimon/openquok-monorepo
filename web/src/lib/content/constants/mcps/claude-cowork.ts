import { icons } from '$data/icons';

import type { McpLandingSeed } from '$lib/content/constants/mcps/types';
export const claude_coworkMcpSeed = {
		slug: 'claude-cowork',
		label: 'Claude Cowork',
		mcpClient: 'Claude Cowork',
		icon: icons.ClaudeGlyph.name,
		hubDescription: 'Custom connectors and managedMcpServers',
		heroDescription:
			'Claude Cowork brings Anthropic\'s models to organization-wide AI workflows with custom connectors. Connect OpenQuok over MCP so coworkers draft and schedule social posts while you review and approve on the calendar or kanban.',
		metaDescription:
			'Connect OpenQuok MCP to Claude Cowork — organization-wide social scheduling with human approval on every publish.',
		workflowPhrase: 'your Cowork sessions',
		setupSteps: [
			'Access Claude Cowork through claude.com',
			'Generate a programmatic token for your workspace under Developers → Access.',
			'Add the openquok connector JSON from the configuration section via Custom connectors or managedMcpServers in Cowork organization settings.',
			'Start a new Cowork session and verify with: List my connected social media accounts.'
		]
	} satisfies McpLandingSeed;
