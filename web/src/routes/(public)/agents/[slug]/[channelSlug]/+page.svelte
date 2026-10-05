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
	let opportunitiesPreviewVm = $derived(data.opportunitiesPreviewVm);
	let agentChannelLinksVm = $derived(data.agentChannelLinksVm);
	let channelSlug = $derived(data.channelSlug);
	let channelLabel = $derived(data.channelLabel);
	let isChannelComingSoon = $derived(data.isChannelComingSoon);
	// let agentSlug = $derived(data.agentSlug);

	let agentHostVm = $derived(
		landingVm && isPublicAgentHostLandingPage(landingVm) ? landingVm : null
	);
	let mcpVm = $derived(landingVm && isPublicMcpLandingPage(landingVm) ? landingVm : null);

	const heroCtaText = pagePresenter.heroCtaText;
	const featureCtaText = pagePresenter.featureCtaText;
	const secondaryCtaHref = pagePresenter.secondaryCtaHref;
</script>

<JsonLdHead schemaData={schemaData} />

{#if mcpVm}
	<PublicMcpLandingPage
		mcpVm={mcpVm}
		opportunitiesPreviewVm={opportunitiesPreviewVm}
		{heroCtaText}
		{featureCtaText}
		secondaryCtaHref={secondaryCtaHref}
		channelLinksVm={agentChannelLinksVm}
		activeChannelSlug={channelSlug}
		activeChannelLabel={channelLabel}
		{isChannelComingSoon}
		comingSoonPlatformLabel={channelLabel}
	/>
{:else if agentHostVm}
	<PublicAgentLandingPage
		agentVm={agentHostVm}
		opportunitiesPreviewVm={opportunitiesPreviewVm}
		{heroCtaText}
		{featureCtaText}
		secondaryCtaHref={secondaryCtaHref}
		channelLinksVm={agentChannelLinksVm}
		activeChannelSlug={channelSlug}
		activeChannelLabel={channelLabel}
		{isChannelComingSoon}
		comingSoonPlatformLabel={channelLabel}
	/>
{/if}
