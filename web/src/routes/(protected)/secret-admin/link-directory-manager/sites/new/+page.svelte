<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	import { adminLinkDirectorySiteEditorPagePresenter } from '$lib/area-admin';
	import EditorLinkDirectorySite from '$lib/ui/components/link-directory-manager/EditorLinkDirectorySite.svelte';

	const isLoading = $derived(adminLinkDirectorySiteEditorPagePresenter.loading);
	const categories = $derived(adminLinkDirectorySiteEditorPagePresenter.categoriesVm);
	const tags = $derived(adminLinkDirectorySiteEditorPagePresenter.tagsVm);
	const opportunityTypes = $derived(adminLinkDirectorySiteEditorPagePresenter.opportunityTypesVm);
	const userId = $derived(page.data.currentUser?.id ?? '');

	onMount(async () => {
		await adminLinkDirectorySiteEditorPagePresenter.loadNewEditor();
	});
</script>

<div class="p-4 md:p-6 max-w-4xl">
	<h1 class="text-xl font-semibold text-base-content">New site</h1>
	<p class="text-sm text-base-content/70 mt-1">Create a platform entry, then add link opportunities on the editor page.</p>

	{#if isLoading}
		<div class="mt-6"><span class="loading loading-spinner loading-md"></span></div>
	{:else}
		<div class="mt-6">
			<EditorLinkDirectorySite
				site={null}
				{categories}
				{tags}
				{opportunityTypes}
				{userId}
				onSiteSaved={(site) => adminLinkDirectorySiteEditorPagePresenter.setSiteVm(site)}
			/>
		</div>
	{/if}
</div>
