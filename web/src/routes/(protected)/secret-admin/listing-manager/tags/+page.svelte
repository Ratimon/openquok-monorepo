<script lang="ts">
	import type { ListingTagViewModel } from '$lib/listings/GetListing.presenter.svelte';
	import { onMount } from 'svelte';

	import { adminListingTagsManagerPagePresenter } from '$lib/area-admin';
	import ListingTagsTable from '$lib/ui/components/listing-manager/ListingTagsTable.svelte';
	import ListingTagUpsertModal from '$lib/ui/components/listing-manager/ListingTagUpsertModal.svelte';

	const isLoading = $derived(adminListingTagsManagerPagePresenter.loading);
	const tagsVm = $derived(adminListingTagsManagerPagePresenter.allTagsToManageVm);
	const hasTags = $derived(tagsVm.length > 0);

	onMount(async () => {
		await adminListingTagsManagerPagePresenter.loadAllTags();
	});

	function handleTagCreated(vm: ListingTagViewModel) {
		adminListingTagsManagerPagePresenter.addListingTag(vm);
	}

	function handleTagUpdated(vm: ListingTagViewModel) {
		adminListingTagsManagerPagePresenter.updateListingTag(vm);
	}

	function handleTagDeleted(tag: ListingTagViewModel) {
		adminListingTagsManagerPagePresenter.removeListingTag(tag.id);
	}
</script>

<div class="p-4 md:p-6">
	<div class="flex items-start justify-between gap-4 flex-wrap">
		<div class="min-w-0">
			<h1 class="text-xl font-semibold text-base-content">Tags</h1>
			<p class="text-sm text-base-content/70">Manage listing tags. Platform admin only.</p>
		</div>
	</div>

	{#if isLoading}
		<div class="mt-6">
			<span class="loading loading-spinner loading-md"></span>
		</div>
	{:else if !hasTags}
		<div
			class="mt-6 flex min-h-96 flex-1 items-center justify-center rounded-lg border border-dashed border-base-300"
		>
			<div class="flex flex-col items-center gap-1 text-center">
				<h3 class="text-2xl font-bold tracking-tight text-base-content">You have no tags</h3>
				<p class="text-sm text-base-content/70">Create your first listing tag to get started.</p>

				<div class="mt-4">
					<ListingTagUpsertModal
						tag={undefined}
						buttonVariant="primary"
						onTagCreated={handleTagCreated}
						onTagUpdated={handleTagUpdated}
					/>
				</div>
			</div>
		</div>
	{:else}
		<ListingTagsTable
			{tagsVm}
			onTagCreated={handleTagCreated}
			onTagUpdated={handleTagUpdated}
			onTagDeleted={handleTagDeleted}
		/>
	{/if}
</div>
