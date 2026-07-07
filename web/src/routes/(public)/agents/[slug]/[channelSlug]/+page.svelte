<script lang="ts">
	import type { PageData } from './$types';

	import {
		publicAgentByPagePresenter,
		isPublicAgentHostLandingPage,
		isPublicMcpLandingPage
	} from '$lib/area-public';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import PublicAgentLandingPage from '$lib/ui/templates/landing-page/PublicAgentLandingPage.svelte';
	import PublicMcpLandingPage from '$lib/ui/templates/landing-page/PublicMcpLandingPage.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	const pagePresenter = publicAgentByPagePresenter;

	let schemaData = $derived(data.schemaData);
	let landingVm = $derived(data.landingVm);
	let listingsPreviewVm = $derived(data.listingsPreviewVm);

	let agentHostVm = $derived(
		landingVm && isPublicAgentHostLandingPage(landingVm) ? landingVm : null
	);
	let mcpVm = $derived(landingVm && isPublicMcpLandingPage(landingVm) ? landingVm : null);

	const secondaryCtaText = pagePresenter.secondaryCtaText;
	const secondaryCtaHref = pagePresenter.secondaryCtaHref;
</script>

<JsonLdHead schemaData={schemaData} />

{#if mcpVm}
	<PublicMcpLandingPage
		mcpVm={mcpVm}
		{listingsPreviewVm}
		secondaryCtaText={secondaryCtaText}
		secondaryCtaHref={secondaryCtaHref}
	/>
{:else if agentHostVm}
	<PublicAgentLandingPage
		agentVm={agentHostVm}
		{listingsPreviewVm}
		secondaryCtaText={secondaryCtaText}
		secondaryCtaHref={secondaryCtaHref}
	/>
{/if}
