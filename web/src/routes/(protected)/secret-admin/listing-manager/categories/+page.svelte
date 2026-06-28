<script lang="ts">
	import type { ListingCategoryViewModel } from '$lib/listings/GetListing.presenter.svelte';
	import { onMount } from 'svelte';

	import { adminListingCategoriesManagerPagePresenter } from '$lib/area-admin';
	import ListingCategoriesTable from '$lib/ui/components/listing-manager/ListingCategoriesTable.svelte';
	import ListingCategoryUpsertModal from '$lib/ui/components/listing-manager/ListingCategoryUpsertModal.svelte';

	const isLoading = $derived(adminListingCategoriesManagerPagePresenter.loading);
	const categoriesVm = $derived(adminListingCategoriesManagerPagePresenter.allCategoriesToManageVm);
	const hasCategories = $derived(categoriesVm.length > 0);

	onMount(async () => {
		await adminListingCategoriesManagerPagePresenter.loadAllCategories();
	});

	function handleCategoryCreated(vm: ListingCategoryViewModel) {
		adminListingCategoriesManagerPagePresenter.addListingCategory(vm);
	}

	function handleCategoryUpdated(vm: ListingCategoryViewModel) {
		adminListingCategoriesManagerPagePresenter.updateListingCategory(vm);
	}

	function handleCategoryDeleted(category: ListingCategoryViewModel) {
		adminListingCategoriesManagerPagePresenter.removeListingCategory(category.id);
	}
</script>

<div class="p-4 md:p-6">
	<div class="flex items-start justify-between gap-4 flex-wrap">
		<div class="min-w-0">
			<h1 class="text-xl font-semibold text-base-content">Categories</h1>
			<p class="text-sm text-base-content/70">Manage listing category hierarchy. Platform admin only.</p>
		</div>
	</div>

	{#if isLoading}
		<div class="mt-6">
			<span class="loading loading-spinner loading-md"></span>
		</div>
	{:else if !hasCategories}
		<div
			class="mt-6 flex min-h-96 flex-1 items-center justify-center rounded-lg border border-dashed border-base-300"
		>
			<div class="flex flex-col items-center gap-1 text-center">
				<h3 class="text-2xl font-bold tracking-tight text-base-content">You have no categories</h3>
				<p class="text-sm text-base-content/70">Create your first listing category to get started.</p>

				<div class="mt-4">
					<ListingCategoryUpsertModal
						category={undefined}
						allCategories={categoriesVm}
						buttonVariant="primary"
						onCategoryCreated={handleCategoryCreated}
						onCategoryUpdated={handleCategoryUpdated}
					/>
				</div>
			</div>
		</div>
	{:else}
		<ListingCategoriesTable
			{categoriesVm}
			onCategoryCreated={handleCategoryCreated}
			onCategoryUpdated={handleCategoryUpdated}
			onCategoryDeleted={handleCategoryDeleted}
		/>
	{/if}
</div>
