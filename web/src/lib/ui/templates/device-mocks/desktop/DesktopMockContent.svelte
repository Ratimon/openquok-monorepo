<script lang="ts">
	import type { DesktopMockContentId } from '$lib/ui/templates/device-mocks/desktop/desktopMock.types';
	import type { McpVerifySafariMockContentId } from '$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig';

	import McpClientVerifyMock from '$lib/ui/templates/device-mocks/safari/content/McpClientVerifyMock.svelte';

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
{/if}
