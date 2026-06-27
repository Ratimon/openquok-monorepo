import type { McpVerifySafariMockContentId } from '$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig';
import type { McpWorkflowScheduleMockContentId } from '$lib/ui/templates/device-mocks/safari/mcpWorkflowScheduleMockConfig';
import type { AgentDesktopParallelMockContentId } from '$lib/ui/templates/device-mocks/desktop/agentDesktopParallelMock.types';

/** MCP client previews and agent host chat shown inside the desktop device frame. */
export type DesktopMockContentId =
	| McpVerifySafariMockContentId
	| McpWorkflowScheduleMockContentId
	| AgentDesktopParallelMockContentId;
