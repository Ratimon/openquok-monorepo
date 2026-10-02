<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	import { adminLinkDirectorySiteEditorPagePresenter } from '$lib/area-admin';
	import EditorLinkDirectorySite from '$lib/ui/components/link-directory-manager/EditorLinkDirectorySite.svelte';

	type Props = { data: { siteId: string } };
	let { data }: Props = $props();

	let siteId = $derived(data.siteId);

	const isLoading = $derived(adminLinkDirectorySiteEditorPagePresenter.loading);
	const site = $derived(adminLinkDirectorySiteEditorPagePresenter.siteVm);
	const categories = $derived(adminLinkDirectorySiteEditorPagePresenter.categoriesVm);
	const tags = $derived(adminLinkDirectorySiteEditorPagePresenter.tagsVm);
	const opportunityTypes = $derived(adminLinkDirectorySiteEditorPagePresenter.opportunityTypesVm);
	const userId = $derived(page.data.currentUser?.id ?? '');

	onMount(async () => {
		await adminLinkDirectorySiteEditorPagePresenter.loadEditor(siteId);
	});

	async function reloadSite() {
		await adminLinkDirectorySiteEditorPagePresenter.loadEditor(siteId);
	}
</script>

<div class="p-4 md:p-6 max-w-4xl">
	{#if isLoading && !site}
		<div class="mt-6"><span class="loading loading-spinner loading-md"></span></div>
	{:else if !site}
		<p class="text-sm text-base-content/70">Site not found.</p>
	{:else}
		<h1 class="text-xl font-semibold text-base-content">Edit site</h1>
		<p class="text-sm text-base-content/70 mt-1">{site.title}</p>
		<div class="mt-6">
			<EditorLinkDirectorySite
				{site}
				{categories}
				{tags}
				{opportunityTypes}
				{userId}
				onSiteSaved={(saved) => adminLinkDirectorySiteEditorPagePresenter.setSiteVm(saved)}
				onOpportunityChange={reloadSite}
			/>
		</div>
	{/if}
</div>
