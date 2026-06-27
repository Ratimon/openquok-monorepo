import type { McpClient } from '$lib/developers/utils/getMcpClientConfig';
import { MCP_CLIENT_DOCS_SLUG } from '$lib/developers/utils/getMcpClientConfig';

import type { McpClientVerifyMockTheme } from '$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig';
import { getMcpVerifyMockThemeForClient } from '$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig';

export type McpWorkflowScheduleMockContentId =
	| 'mcp-workflow-cursor'
	| 'mcp-workflow-claude-code'
	| 'mcp-workflow-claude-cowork'
	| 'mcp-workflow-vscode-copilot'
	| 'mcp-workflow-devin-desktop'
	| 'mcp-workflow-amp'
	| 'mcp-workflow-codex'
	| 'mcp-workflow-antigravity-cli'
	| 'mcp-workflow-warp';

export const MCP_WORKFLOW_USER_PROMPT =
	'Queue my launch announcement on Facebook, Instagram, and Threads — attach the hero image and set it for tomorrow at 9am.';

export const MCP_WORKFLOW_PROGRESS_STEPS = [
	'Reading openquok-core skills or openquok MCP tool definitions',
	'integrationList → 3 channels matched',
	'Uploading hero-image.png',
	'Creating scheduled drafts'
] as const;

export const MCP_WORKFLOW_SCHEDULED_POSTS = [
	'Facebook — My Brand Page · 9:00 AM',
	'Instagram — @mybrand · 9:00 AM',
	'Threads — @mybrand · 9:00 AM'
] as const;

const WORKFLOW_CONTENT_ID_BY_CLIENT = Object.fromEntries(
	(Object.keys(MCP_CLIENT_DOCS_SLUG) as McpClient[]).map((client) => [
		client,
		`mcp-workflow-${MCP_CLIENT_DOCS_SLUG[client]}` as McpWorkflowScheduleMockContentId
	])
) as Record<McpClient, McpWorkflowScheduleMockContentId>;

const CLIENT_BY_WORKFLOW_CONTENT_ID = Object.fromEntries(
	(Object.entries(WORKFLOW_CONTENT_ID_BY_CLIENT) as [McpClient, McpWorkflowScheduleMockContentId][]).map(
		([client, contentId]) => [contentId, client]
	)
) as Record<McpWorkflowScheduleMockContentId, McpClient>;

export function getMcpWorkflowScheduleContentId(
	client: McpClient
): McpWorkflowScheduleMockContentId {
	return WORKFLOW_CONTENT_ID_BY_CLIENT[client];
}

export function getMcpWorkflowScheduleMockTheme(
	content: McpWorkflowScheduleMockContentId
): McpClientVerifyMockTheme {
	return getMcpVerifyMockThemeForClient(CLIENT_BY_WORKFLOW_CONTENT_ID[content]);
}

export function isMcpWorkflowScheduleContent(
	value: string
): value is McpWorkflowScheduleMockContentId {
	return value.startsWith('mcp-workflow-');
}
