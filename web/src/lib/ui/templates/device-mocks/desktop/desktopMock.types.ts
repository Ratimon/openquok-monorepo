import type { McpVerifySafariMockContentId } from '$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig';
import type { McpWorkflowScheduleMockContentId } from '$lib/ui/templates/device-mocks/safari/mcpWorkflowScheduleMockConfig';

/** MCP client previews shown inside the desktop device frame. */
export type DesktopMockContentId =
	| McpVerifySafariMockContentId
	| McpWorkflowScheduleMockContentId;
