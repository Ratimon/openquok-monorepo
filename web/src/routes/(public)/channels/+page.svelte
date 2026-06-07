<script lang="ts">
	import type { PageData } from './$types';

	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import PublicChannelsHubGrid from '$lib/ui/components/channels/PublicChannelsHubGrid.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let channelsVm = $derived(data.channelsVm ?? []);
	let schemaData = $derived(data.schemaData);
</script>

<svelte:head>
	{#if schemaData}
		<script type="application/ld+json">{JSON.stringify(schemaData)}</script>
	{/if}
</svelte:head>

<SectionOuterContainer class="py-10 md:py-16">
	<PublicChannelsHubGrid channels={channelsVm} />
</SectionOuterContainer>
