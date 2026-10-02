<script lang="ts">
	import { onMount } from 'svelte';

	import { adminLinkDirectoryCategoriesManagerPagePresenter } from '$lib/area-admin';
	import LinkDirectoryCategoriesTable from '$lib/ui/components/link-directory-manager/LinkDirectoryCategoriesTable.svelte';
	import LinkDirectoryCategoryUpsertModal from '$lib/ui/components/link-directory-manager/LinkDirectoryCategoryUpsertModal.svelte';

	const isLoading = $derived(adminLinkDirectoryCategoriesManagerPagePresenter.loading);
	const categoriesVm = $derived(adminLinkDirectoryCategoriesManagerPagePresenter.allCategoriesToManageVm);
	const hasCategories = $derived(categoriesVm.length > 0);

	onMount(async () => {
		await adminLinkDirectoryCategoriesManagerPagePresenter.loadAllCategories();
	});
</script>

<div class="p-4 md:p-6">
	<div class="flex items-start justify-between gap-4 flex-wrap">
		<div class="min-w-0">
			<h1 class="text-xl font-semibold text-base-content">Categories</h1>
			<p class="text-sm text-base-content/70">Navigation groups for the build-backlinks hub.</p>
		</div>
	</div>

	{#if isLoading}
		<div class="mt-6"><span class="loading loading-spinner loading-md"></span></div>
	{:else if !hasCategories}
		<div
			class="mt-6 flex min-h-64 flex-1 items-center justify-center rounded-lg border border-dashed border-base-300"
		>
			<div class="flex flex-col items-center gap-2 text-center">
				<h3 class="text-lg font-semibold">No categories yet</h3>
				<LinkDirectoryCategoryUpsertModal
					onCategoryCreated={(vm) => adminLinkDirectoryCategoriesManagerPagePresenter.addCategory(vm)}
				/>
			</div>
		</div>
	{:else}
		<LinkDirectoryCategoriesTable
			{categoriesVm}
			onCategoryCreated={(vm) => adminLinkDirectoryCategoriesManagerPagePresenter.addCategory(vm)}
			onCategoryUpdated={(vm) => adminLinkDirectoryCategoriesManagerPagePresenter.updateCategory(vm)}
			onCategoryDeleted={(c) => adminLinkDirectoryCategoriesManagerPagePresenter.removeCategory(c.id)}
		/>
	{/if}
</div>
