<script lang="ts">
	import type { PageData } from './$types';

	import PublicChannelLandingPage from '$lib/ui/templates/landing-page/PublicChannelLandingPage.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let channelVm = $derived(data.channelVm);
	let schemaData = $derived(data.schemaData);
</script>

<svelte:head>
	{#if schemaData}
		<script type="application/ld+json">{JSON.stringify(schemaData)}</script>
	{/if}
</svelte:head>

{#if channelVm}
	<PublicChannelLandingPage channel={channelVm} />
{/if}
