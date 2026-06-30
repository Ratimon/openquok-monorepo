<script lang="ts">
	import type { PageData } from './$types';

	import AgentBuilderPage from '$lib/ui/templates/stack-builder/AgentBuilderPage.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let metaTitle = $derived(data.metaTitle);
	let metaDescription = $derived(data.metaDescription);
	let selectedExtensionSlugs = $derived(data.selectedExtensionSlugs);
	let extensionsCatalog = $derived(data.extensionsCatalog);
	let selectedExtensions = $derived(data.selectedExtensions);
	let initialWorkflowSteps = $derived(data.initialWorkflowSteps);
	let initialReferenceAssets = $derived(data.initialReferenceAssets);
	let stackTitle = $derived(data.stackTitle);
	let stackSlug = $derived(data.stackSlug);
</script>

<JsonLdHead
	schemaData={{
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: metaTitle,
		description: metaDescription,
		applicationCategory: 'DeveloperApplication',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
	}}
/>

<AgentBuilderPage
	{metaTitle}
	{metaDescription}
	{selectedExtensionSlugs}
	{extensionsCatalog}
	{selectedExtensions}
	{initialWorkflowSteps}
	{initialReferenceAssets}
	{stackTitle}
	{stackSlug}
/>
