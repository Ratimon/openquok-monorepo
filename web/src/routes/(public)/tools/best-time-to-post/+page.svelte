<script lang="ts">
	import type { PageData } from './$types';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import BestTimeToPostToolPage from '$lib/ui/templates/best-time-to-post/BestTimeToPostToolPage.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let metaTitle = $derived(data.metaTitle);
	let metaDescription = $derived(data.metaDescription);
	let schemaData = $derived(data.schemaData);
	let channelSlug = $derived(data.channelSlug);
	let channelLabel = $derived(data.channelLabel);
	let defaultPlatformSlug = $derived(data.defaultPlatformSlug);
	let bestTimeToPostChannelsVm = $derived(data.bestTimeToPostChannelsVm);
</script>

<JsonLdHead schemaData={schemaData} />

<BestTimeToPostToolPage
	{metaTitle}
	{metaDescription}
	{channelSlug}
	{channelLabel}
	{defaultPlatformSlug}
	channelLinksVm={bestTimeToPostChannelsVm}
/>
