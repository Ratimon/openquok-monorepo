<script lang="ts">
	import type { PageData } from './$types';

	import ExtensionsHubPage from '$lib/ui/templates/extensions/ExtensionsHubPage.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let metaTitle = $derived(data.metaTitle);
	let metaDescription = $derived(data.metaDescription);
	let extensions = $derived(data.extensions);
	let categories = $derived(data.categories);
	let stats = $derived(data.stats);
	let filters = $derived(data.filters);
	let schemaData = $derived(data.schemaData);
</script>

<JsonLdHead schemaData={schemaData} />

<ExtensionsHubPage
	metaTitle={metaTitle}
	metaDescription={metaDescription}
	extensions={extensions}
	categories={categories}
	stats={stats}
	filters={filters}
/>
