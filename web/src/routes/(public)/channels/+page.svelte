<script lang="ts">
	import type { PageData } from './$types';

	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import PublicChannelsHubGrid from '$lib/ui/templates/landing-page/PublicChannelsHubGrid.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let channelsVm = $derived(data.channelsVm ?? []);
	let schemaData = $derived(data.schemaData);
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-16">
	<PublicChannelsHubGrid channels={channelsVm} />
</SectionOuterContainer>
