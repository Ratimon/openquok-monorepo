<script lang="ts">
	import type { PageData } from './$types';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import HumanizeToolPage from '$lib/ui/templates/humanize/HumanizeToolPage.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let metaTitle = $derived(data.metaTitle);
	let metaDescription = $derived(data.metaDescription);
	let schemaData = $derived(data.schemaData);
	let channelSlug = $derived(data.channelSlug);
	let channelLabel = $derived(data.channelLabel);
	let focusedProviderIdentifier = $derived(data.focusedProviderIdentifier);
	let composerMode = $derived(data.composerMode);
	let humanizerChannelsVm = $derived(data.humanizerChannelsVm);
</script>

<JsonLdHead schemaData={schemaData} />

{#key channelSlug ?? 'generic'}
	<HumanizeToolPage
		{metaTitle}
		{metaDescription}
		{channelSlug}
		{channelLabel}
		{focusedProviderIdentifier}
		{composerMode}
		channelLinksVm={humanizerChannelsVm}
	/>
{/key}
