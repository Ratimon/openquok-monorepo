<script lang="ts">
	import type { PageData } from './$types';

	import { getRootPathPublicSkillBuilderChannel } from '$lib/area-public/constants/getRootPathPublicTools';
	import { route } from '$lib/utils/path';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import SkillBuilderToolPage from '$lib/ui/templates/skill-builder/SkillBuilderToolPage.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let metaTitle = $derived(data.metaTitle);
	let metaDescription = $derived(data.metaDescription);
	let schemaData = $derived(data.schemaData);
	let selectedBuildingBlockSlugs = $derived(data.selectedBuildingBlockSlugs);
	let selectedBuildingBlocks = $derived(data.selectedBuildingBlocks);
	let initialWorkflowSteps = $derived(data.initialWorkflowSteps);
	let stackTitle = $derived(data.stackTitle);
	let stackSlug = $derived(data.stackSlug);
	let channelSlug = $derived(data.channelSlug);
	let channelLabel = $derived(data.channelLabel);
	let cliExamplesPath = $derived(data.cliExamplesPath);
	let isLoggedIn = $derived(data.isLoggedIn);

	const skillBuilderBasePath = $derived(
		channelSlug ? route(getRootPathPublicSkillBuilderChannel(channelSlug)) : route('tools/skill-builder')
	);
</script>

<JsonLdHead schemaData={schemaData} />

<SkillBuilderToolPage
	{metaTitle}
	{metaDescription}
	{selectedBuildingBlockSlugs}
	{selectedBuildingBlocks}
	{initialWorkflowSteps}
	{stackTitle}
	{stackSlug}
	{isLoggedIn}
	{skillBuilderBasePath}
	{channelSlug}
	{channelLabel}
	{cliExamplesPath}
/>
