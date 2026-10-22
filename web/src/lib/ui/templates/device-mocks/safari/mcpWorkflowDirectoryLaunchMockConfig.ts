import type { McpClient } from '$lib/developers/utils/getMcpClientConfig';
import { MCP_CLIENT_DOCS_SLUG } from '$lib/developers/utils/getMcpClientConfig';

import type { McpClientVerifyMockTheme } from '$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig';
import { getMcpVerifyMockThemeForClient } from '$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig';

export type McpWorkflowDirectoryLaunchMockContentId =
	| 'mcp-directory-launch-cursor'
	| 'mcp-directory-launch-claude-code'
	| 'mcp-directory-launch-claude-cowork'
	| 'mcp-directory-launch-chatgpt'
	| 'mcp-directory-launch-vscode-copilot'
	| 'mcp-directory-launch-devin-desktop'
	| 'mcp-directory-launch-amp'
	| 'mcp-directory-launch-codex'
	| 'mcp-directory-launch-antigravity-cli'
	| 'mcp-directory-launch-android-studio'
	| 'mcp-directory-launch-warp'
	| 'mcp-directory-launch-muse-code'
	| 'mcp-directory-launch-grok-build';

export const MCP_DIRECTORY_LAUNCH_USER_PROMPT =
	'Prepare my PeerPush launch — list product profiles, ensure the peerpush variant, and show listing readiness before I open the browser extension.';

export const MCP_DIRECTORY_LAUNCH_PROGRESS_STEPS = [
	'Reading openquok-core skills or openquok MCP tool definitions',
	'directoryProfilesList → main product profile',
	'directoryVariantsEnsure → peerpush variant tailored',
	'directoryListingSummary → extension handoff fields ready'
] as const;

export const MCP_DIRECTORY_LAUNCH_SUMMARY_LINES = [
	'Readiness: ready for peerpush.com submit',
	'directorySeoOverview → DR 42 · checkedAt 2h ago'
] as const;

const DIRECTORY_LAUNCH_CONTENT_ID_BY_CLIENT = Object.fromEntries(
	(Object.keys(MCP_CLIENT_DOCS_SLUG) as McpClient[]).map((client) => [
		client,
		`mcp-directory-launch-${MCP_CLIENT_DOCS_SLUG[client]}` as McpWorkflowDirectoryLaunchMockContentId
	])
) as Record<McpClient, McpWorkflowDirectoryLaunchMockContentId>;

const CLIENT_BY_DIRECTORY_LAUNCH_CONTENT_ID = Object.fromEntries(
	(
		Object.entries(DIRECTORY_LAUNCH_CONTENT_ID_BY_CLIENT) as [
			McpClient,
			McpWorkflowDirectoryLaunchMockContentId
		][]
	).map(([client, contentId]) => [contentId, client])
) as Record<McpWorkflowDirectoryLaunchMockContentId, McpClient>;

export function getMcpWorkflowDirectoryLaunchContentId(
	client: McpClient
): McpWorkflowDirectoryLaunchMockContentId {
	return DIRECTORY_LAUNCH_CONTENT_ID_BY_CLIENT[client];
}

export function getMcpWorkflowDirectoryLaunchMockTheme(
	content: McpWorkflowDirectoryLaunchMockContentId
): McpClientVerifyMockTheme {
	return getMcpVerifyMockThemeForClient(CLIENT_BY_DIRECTORY_LAUNCH_CONTENT_ID[content]);
}

export function isMcpWorkflowDirectoryLaunchContent(
	value: string
): value is McpWorkflowDirectoryLaunchMockContentId {
	return value.startsWith('mcp-directory-launch-');
}
