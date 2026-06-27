<script lang="ts">
	import type { PageData } from './$types';

	import { publicAgentByPagePresenter, isPublicAgentHostLandingPage, isPublicMcpLandingPage } from '$lib/area-public';

	import PublicMcpLandingPage from '$lib/ui/templates/landing-page/PublicMcpLandingPage.svelte';
	import PublicAgentLandingPage from '$lib/ui/templates/landing-page/PublicAgentLandingPage.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	const pagePresenter = publicAgentByPagePresenter;

	let agentVm = $derived(data.agentVm);
	let schemaData = $derived(data.schemaData);
	let agentHostVm = $derived(agentVm && isPublicAgentHostLandingPage(agentVm) ? agentVm : null);
	let mcpVm = $derived(agentVm && isPublicMcpLandingPage(agentVm) ? agentVm : null);

	const secondaryCtaText = pagePresenter.secondaryCtaText;
	const secondaryCtaHref = pagePresenter.secondaryCtaHref;
</script>

<JsonLdHead schemaData={schemaData} />

{#if mcpVm}
	<PublicMcpLandingPage
		mcp={mcpVm}
		secondaryCtaText={secondaryCtaText}
		secondaryCtaHref={secondaryCtaHref}
	/>
{:else if agentHostVm}
	<PublicAgentLandingPage
		agent={agentHostVm}
		secondaryCtaText={secondaryCtaText}
		secondaryCtaHref={secondaryCtaHref}
	/>
{/if}
