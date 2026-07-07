<script lang="ts">
	import type { PageData } from './$types';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import PhotoEditorToolPage from '$lib/ui/templates/photo-editor/PhotoEditorToolPage.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let metaTitle = $derived(data.metaTitle);
	let metaDescription = $derived(data.metaDescription);
	let schemaData = $derived(data.schemaData);
	let channelSlug = $derived(data.channelSlug);
	let channelLabel = $derived(data.channelLabel);
	let focusedProviderIdentifier = $derived(data.focusedProviderIdentifier);
	let composerMode = $derived(data.composerMode);
	let isLoggedIn = $derived(data.isLoggedIn);
	let photoEditorChannelsVm = $derived(data.photoEditorChannelsVm);

</script>

<JsonLdHead schemaData={schemaData} />

<PhotoEditorToolPage
	{metaTitle}
	{metaDescription}
	{channelSlug}
	{channelLabel}
	{focusedProviderIdentifier}
	{composerMode}
	{isLoggedIn}
	channelLinksVm={photoEditorChannelsVm}
/>
