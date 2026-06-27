<script lang="ts">
	import type { DesktopMockContentId } from '$lib/ui/templates/device-mocks/desktop/desktopMock.types';
	import type { McpVerifySafariMockContentId } from '$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig';
	import type { McpWorkflowScheduleMockContentId } from '$lib/ui/templates/device-mocks/safari/mcpWorkflowScheduleMockConfig';
	import { isMcpWorkflowScheduleContent } from '$lib/ui/templates/device-mocks/safari/mcpWorkflowScheduleMockConfig';

	import McpClientVerifyMock from '$lib/ui/templates/device-mocks/safari/content/McpClientVerifyMock.svelte';
	import McpWorkflowScheduleMock from '$lib/ui/templates/device-mocks/safari/content/McpWorkflowScheduleMock.svelte';

	type Props = {
		content?: DesktopMockContentId;
	};

	let { content }: Props = $props();

	function isMcpVerifyContent(
		value: DesktopMockContentId | undefined
	): value is McpVerifySafariMockContentId {
		return typeof value === 'string' && value.startsWith('mcp-verify-');
	}
</script>

{#if content && isMcpVerifyContent(content)}
	<McpClientVerifyMock {content} />
{:else if content && isMcpWorkflowScheduleContent(content)}
	<McpWorkflowScheduleMock content={content as McpWorkflowScheduleMockContentId} />
{/if}
