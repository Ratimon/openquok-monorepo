<script lang="ts">
	import type { PageData } from './$types';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import PayloadWizardToolPage from '$lib/ui/templates/payload-wizard/PayloadWizardToolPage.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let heroTitle = $derived(data.heroTitle);
	let metaDescription = $derived(data.metaDescription);
	let schemaData = $derived(data.schemaData);
	let channelSlug = $derived(data.channelSlug);
	let channelLabel = $derived(data.channelLabel);
	let focusedProviderIdentifier = $derived(data.focusedProviderIdentifier);
	let composerMode = $derived(data.composerMode);
	let formatExamples = $derived(data.formatExamples);
	let isLoggedIn = $derived(data.isLoggedIn);
	let payloadWizardChannelsVm = $derived(data.payloadWizardChannelsVm);
</script>

<JsonLdHead schemaData={schemaData} />

{#key channelSlug ?? 'generic'}
	<PayloadWizardToolPage
		{heroTitle}
		{metaDescription}
		{channelSlug}
		{channelLabel}
		{focusedProviderIdentifier}
		{composerMode}
		{formatExamples}
		{isLoggedIn}
		channelLinksVm={payloadWizardChannelsVm}
	/>
{/key}
