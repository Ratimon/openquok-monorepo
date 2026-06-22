<script lang="ts">
	import type { SafariMockContentId } from '$lib/ui/templates/device-mocks/safari/safariMock.types';

	import HermesDocsOverviewMock from '$lib/ui/templates/device-mocks/safari/content/HermesDocsOverviewMock.svelte';
	import OpenclawDocsOverviewMock from '$lib/ui/templates/device-mocks/safari/content/OpenclawDocsOverviewMock.svelte';

	type Props = {
		content?: SafariMockContentId;
	};

	let { content }: Props = $props();
</script>

{#if content === 'openclaw-docs-overview'}
	<OpenclawDocsOverviewMock />
{:else if content === 'hermes-docs-overview'}
	<HermesDocsOverviewMock />
{/if}
