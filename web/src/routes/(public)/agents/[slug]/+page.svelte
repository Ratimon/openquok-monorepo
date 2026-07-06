<script lang="ts">
	import type { PageData } from './$types';
	import type { PublicAgentViewModel } from '$lib/area-public/PublicAgentByPage.presenter.svelte';
	import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/publicAgentConfig';
	import type { PublicMcpLandingPageViewModel } from '$lib/content/constants/publicMcpConfig';

	import type { PublicListingsPreviewVm } from '$lib/listings/utils/loadAgentListingsPreview.server';

	import { publicAgentByPagePresenter, isPublicAgentHostLandingPage, isPublicMcpLandingPage } from '$lib/area-public';

	import PublicMcpLandingPage from '$lib/ui/templates/landing-page/PublicMcpLandingPage.svelte';
	import PublicAgentLandingPage from '$lib/ui/templates/landing-page/PublicAgentLandingPage.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	const pagePresenter = publicAgentByPagePresenter;

	let schemaData = $derived(data.schemaData);

	let agentVm: PublicAgentViewModel | null = $derived(data.agentVm);
	let listingsPreviewVm: PublicListingsPreviewVm = $derived(data.listingsPreviewVm);
	let agentHostVm: PublicAgentHostLandingPageViewModel | null = $derived(agentVm && isPublicAgentHostLandingPage(agentVm) ? agentVm : null);
	let mcpVm: PublicMcpLandingPageViewModel | null = $derived(agentVm && isPublicMcpLandingPage(agentVm) ? agentVm : null);

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
