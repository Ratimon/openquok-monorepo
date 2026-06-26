<script lang="ts">
	import type { SafariMockContentId } from '$lib/ui/templates/device-mocks/safari/safariMock.types';
	import type { McpInstallSafariMockContentId } from '$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig';
	import type { McpVerifySafariMockContentId } from '$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig';

	import HermesDocsOverviewMock from '$lib/ui/templates/device-mocks/safari/content/HermesDocsOverviewMock.svelte';
	import McpClientInstallMock from '$lib/ui/templates/device-mocks/safari/content/McpClientInstallMock.svelte';
	import McpClientVerifyMock from '$lib/ui/templates/device-mocks/safari/content/McpClientVerifyMock.svelte';
	import OpenclawDocsOverviewMock from '$lib/ui/templates/device-mocks/safari/content/OpenclawDocsOverviewMock.svelte';

	type Props = {
		content?: SafariMockContentId;
	};

	let { content }: Props = $props();

	function isMcpVerifyContent(
		value: SafariMockContentId | undefined
	): value is McpVerifySafariMockContentId {
		return typeof value === 'string' && value.startsWith('mcp-verify-');
	}

	function isMcpInstallContent(
		value: SafariMockContentId | undefined
	): value is McpInstallSafariMockContentId {
		return typeof value === 'string' && value.startsWith('mcp-install-');
	}
</script>

{#if content === 'openclaw-docs-overview'}
	<OpenclawDocsOverviewMock />
{:else if content === 'hermes-docs-overview'}
	<HermesDocsOverviewMock />
{:else if isMcpInstallContent(content)}
	<McpClientInstallMock content={content} />
{:else if isMcpVerifyContent(content)}
	<McpClientVerifyMock content={content} />
{/if}
