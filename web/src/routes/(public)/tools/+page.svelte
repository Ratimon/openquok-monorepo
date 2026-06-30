<script lang="ts">
	import type { PageData } from './$types';

	import ToolsIndexPage from '$lib/ui/templates/stack-builder/ToolsIndexPage.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let metaTitle = $derived(data.metaTitle);
	let metaDescription = $derived(data.metaDescription);
	let toolsVm = $derived(data.toolsVm);
</script>

<JsonLdHead
	schemaData={{
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: metaTitle,
		description: metaDescription
	}}
/>

<ToolsIndexPage {metaTitle} {metaDescription} tools={toolsVm} />
