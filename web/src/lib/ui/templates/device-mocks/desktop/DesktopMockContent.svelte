<script lang="ts">
	import type { DesktopMockContentId } from '$lib/ui/templates/device-mocks/desktop/desktopMock.types';
	import type { McpVerifySafariMockContentId } from '$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig';
	import type { McpWorkflowScheduleMockContentId } from '$lib/ui/templates/device-mocks/safari/mcpWorkflowScheduleMockConfig';
	import { isMcpWorkflowScheduleContent } from '$lib/ui/templates/device-mocks/safari/mcpWorkflowScheduleMockConfig';
	import type { McpWorkflowAnalyticsMockContentId } from '$lib/ui/templates/device-mocks/safari/mcpWorkflowAnalyticsMockConfig';
	import { isMcpWorkflowAnalyticsContent } from '$lib/ui/templates/device-mocks/safari/mcpWorkflowAnalyticsMockConfig';
	import type { TelegramMockAgentBranding } from '$lib/ui/templates/device-mocks/iphone-15-pro/telegramMockBranding';
	import { DEFAULT_TELEGRAM_MOCK_AGENT_BRANDING } from '$lib/ui/templates/device-mocks/iphone-15-pro/telegramMockBranding';

	import McpClientVerifyMock from '$lib/ui/templates/device-mocks/safari/content/McpClientVerifyMock.svelte';
	import McpWorkflowScheduleMock from '$lib/ui/templates/device-mocks/safari/content/McpWorkflowScheduleMock.svelte';
	import McpWorkflowAnalyticsMock from '$lib/ui/templates/device-mocks/safari/content/McpWorkflowAnalyticsMock.svelte';
	import AgentDesktopChatAnalyticsMock from '$lib/ui/templates/device-mocks/desktop/content/AgentDesktopChatAnalyticsMock.svelte';
	import AgentDesktopChatScheduleMock from '$lib/ui/templates/device-mocks/desktop/content/AgentDesktopChatScheduleMock.svelte';

	type Props = {
		content?: DesktopMockContentId;
		telegramAgentBranding?: TelegramMockAgentBranding;
	};

	let {
		content,
		telegramAgentBranding = DEFAULT_TELEGRAM_MOCK_AGENT_BRANDING
	}: Props = $props();

	let agentIcon = $derived(telegramAgentBranding.agentIcon);
	let agentLabel = $derived(telegramAgentBranding.agentLabel);

	function isMcpVerifyContent(
		value: DesktopMockContentId | undefined
	): value is McpVerifySafariMockContentId {
		return typeof value === 'string' && value.startsWith('mcp-verify-');
	}
</script>

{#if content === 'agent-parallel-schedule'}
	<AgentDesktopChatScheduleMock {agentIcon} {agentLabel} />
{:else if content === 'agent-parallel-analytics'}
	<AgentDesktopChatAnalyticsMock {agentIcon} {agentLabel} />
{:else if content && isMcpVerifyContent(content)}
	<McpClientVerifyMock {content} />
{:else if content && isMcpWorkflowAnalyticsContent(content)}
	<McpWorkflowAnalyticsMock content={content as McpWorkflowAnalyticsMockContentId} />
{:else if content && isMcpWorkflowScheduleContent(content)}
	<McpWorkflowScheduleMock content={content as McpWorkflowScheduleMockContentId} />
{/if}
