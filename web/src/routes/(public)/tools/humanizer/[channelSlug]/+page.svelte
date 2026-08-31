<script lang="ts">
	import type { PageData } from './$types';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import HumanizeToolPage from '$lib/ui/templates/humanize/HumanizeToolPage.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let heroTitle = $derived(data.heroTitle);
	let metaDescription = $derived(data.metaDescription);
	let schemaData = $derived(data.schemaData);
	let channelSlug = $derived(data.channelSlug);
	let channelLabel = $derived(data.channelLabel);
	let focusedProviderIdentifier = $derived(data.focusedProviderIdentifier);
	let composerMode = $derived(data.composerMode);
	let isLoggedIn = $derived(data.isLoggedIn);
	let humanizerChannelsVm = $derived(data.humanizerChannelsVm);
</script>

<JsonLdHead schemaData={schemaData} />

{#key channelSlug ?? 'generic'}
	<HumanizeToolPage
		{heroTitle}
		{metaDescription}
		{channelSlug}
		{channelLabel}
		{focusedProviderIdentifier}
		{composerMode}
		{isLoggedIn}
		channelLinksVm={humanizerChannelsVm}
	/>
{/key}
