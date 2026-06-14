<script lang="ts">
	import { jsonLdScriptHtml } from '$lib/utils/jsonLdScriptHtml';

	type Props = {
		schemaData?: unknown;
	};

	let { schemaData }: Props = $props();
</script>

<svelte:head>
	{#if schemaData != null}
		{@html jsonLdScriptHtml(schemaData)}
	{/if}
</svelte:head>
