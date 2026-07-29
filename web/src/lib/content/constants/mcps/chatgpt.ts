import { icons } from '$data/icons';

import type { McpLandingSeed } from '$lib/content/constants/mcps/types';
export const chatgptMcpSeed = {
		slug: 'chatgpt',
		label: 'ChatGPT',
		mcpClient: 'ChatGPT',
		icon: icons.ChatGPT.name,
		hubDescription: 'Custom connector / developer-mode MCP URL',
		heroDescription:
			'ChatGPT connects remote MCP servers as custom connectors — once OpenQuok is added, you schedule and manage social posts in plain English. Connect over MCP so ChatGPT drafts and schedules posts while you review and approve on the calendar or kanban.',
		metaDescription:
			'Connect OpenQuok MCP to ChatGPT — schedule social posts from a custom connector. Approve every publish on the calendar or kanban.',
		workflowPhrase: 'ChatGPT',
		setupSteps: [
			'Open ChatGPT on the web (Plus, Pro, Business, Enterprise, or Education) and enable Developer mode under Settings → Security and login when adding a custom MCP app.',
			'Generate a programmatic token under Developers → Access.',
			'In ChatGPT, open Settings → Connectors (or create a developer-mode MCP app) and paste the OpenQuok MCP URL with your token in the path.',
			'Start a new chat with the connector enabled and verify with: List my connected social media accounts.'
		]
	} satisfies McpLandingSeed;
