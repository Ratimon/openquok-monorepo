import type { McpClient } from '$lib/developers/utils/getMcpClientConfig';
import { MCP_CLIENT_DOCS_SLUG } from '$lib/developers/utils/getMcpClientConfig';

import type { McpClientVerifyMockTheme } from '$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig';
import { getMcpVerifyMockThemeForClient } from '$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig';

export type McpWorkflowAnalyticsMockContentId =
	| 'mcp-analytics-cursor'
	| 'mcp-analytics-claude-code'
	| 'mcp-analytics-claude-cowork'
	| 'mcp-analytics-vscode-copilot'
	| 'mcp-analytics-devin-desktop'
	| 'mcp-analytics-amp'
	| 'mcp-analytics-codex'
	| 'mcp-analytics-antigravity-cli'
	| 'mcp-analytics-warp';

export const MCP_ANALYTICS_USER_PROMPT =
	'What performed best on my channels over the last 7 days? Break down impressions and engagement.';

export const MCP_ANALYTICS_RESPONSE_LINES = [
	'Top post: 12.4k impressions, 842 reactions — carousel on product tips.',
	'Facebook Page leads with +24% impressions vs last week.'
] as const;

export const MCP_ANALYTICS_FOLLOW_UP_USER = 'Compare that post on TikTok vs Instagram Reels.';

export const MCP_ANALYTICS_FOLLOW_UP_RESPONSE =
	'TikTok: 48k views, 2.1k likes. IG Reel: 31k plays, 312 saves. TikTok wins reach; IG leads on saves.';

const ANALYTICS_CONTENT_ID_BY_CLIENT = Object.fromEntries(
	(Object.keys(MCP_CLIENT_DOCS_SLUG) as McpClient[]).map((client) => [
		client,
		`mcp-analytics-${MCP_CLIENT_DOCS_SLUG[client]}` as McpWorkflowAnalyticsMockContentId
	])
) as Record<McpClient, McpWorkflowAnalyticsMockContentId>;

const CLIENT_BY_ANALYTICS_CONTENT_ID = Object.fromEntries(
	(Object.entries(ANALYTICS_CONTENT_ID_BY_CLIENT) as [McpClient, McpWorkflowAnalyticsMockContentId][]).map(
		([client, contentId]) => [contentId, client]
	)
) as Record<McpWorkflowAnalyticsMockContentId, McpClient>;

export function getMcpWorkflowAnalyticsContentId(
	client: McpClient
): McpWorkflowAnalyticsMockContentId {
	return ANALYTICS_CONTENT_ID_BY_CLIENT[client];
}

export function getMcpWorkflowAnalyticsMockTheme(
	content: McpWorkflowAnalyticsMockContentId
): McpClientVerifyMockTheme {
	return getMcpVerifyMockThemeForClient(CLIENT_BY_ANALYTICS_CONTENT_ID[content]);
}

export function isMcpWorkflowAnalyticsContent(
	value: string
): value is McpWorkflowAnalyticsMockContentId {
	return value.startsWith('mcp-analytics-');
}
