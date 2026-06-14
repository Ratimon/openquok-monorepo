<script lang="ts">
	import type { PageData } from './$types';

	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import PublicAgentsHubGrid from '$lib/ui/components/agents/PublicAgentsHubGrid.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let agentsVm = $derived(data.agentsVm ?? []);
	let schemaData = $derived(data.schemaData);
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-16">
	<PublicAgentsHubGrid agents={agentsVm} />
</SectionOuterContainer>
