<script lang="ts">
	import type { ListingTagViewModel } from '$lib/listings/GetListing.presenter.svelte';
	import { deleteListingTagVerificationPresenter } from '$lib/listings';
	import { icons } from '$data/icons';
	import ActionVerificationModal from '$lib/ui/modals/ActionVerificationModal.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { CardContent, CardFooter } from '$lib/ui/card';
	import { createPagination } from '$lib/ui/helpers/createPagination.svelte';
	import { Pagination } from '$lib/ui/pagination';
	import {
		Root as Table,
		Body as TableBody,
		Cell as TableCell,
		Head as TableHead,
		Header as TableHeader,
		Row as TableRow
	} from '$lib/ui/table';
	import ListingTagUpsertModal from '$lib/ui/components/listing-manager/ListingTagUpsertModal.svelte';

	type Props = {
		tagsVm: ListingTagViewModel[];
		onTagCreated: (vm: ListingTagViewModel) => void | Promise<void>;
		onTagUpdated: (vm: ListingTagViewModel) => void | Promise<void>;
		onTagDeleted: (tag: ListingTagViewModel) => void | Promise<void>;
	};

	let { tagsVm, onTagCreated, onTagUpdated, onTagDeleted }: Props = $props();

	let pagination = $derived(
		createPagination({
			initialItemsPerPage: 5,
			initialData: tagsVm,
			searchField: 'name'
		})
	);

	let {
		currentData,
		currentPage,
		totalPages,
		totalFilteredItems,
		itemsPerPage,
		paginateFrontFF,
		paginateBackFF,
		setItemsPerPage,
		setCurrentPage
	} = $derived(pagination);

	let deleteModalOpen = $state(false);
	let selectedToDelete = $state<ListingTagViewModel | null>(null);

	function openDeleteModal(tag: ListingTagViewModel) {
		selectedToDelete = tag;
		deleteModalOpen = true;
	}

	async function handleDeleteSuccess() {
		if (selectedToDelete) {
			await onTagDeleted(selectedToDelete);
		}
		deleteModalOpen = false;
		selectedToDelete = null;
	}
</script>

<div class="mt-6 w-full">
	<div class="flex w-full justify-between flex-wrap gap-4 items-center">
		<ListingTagUpsertModal
			tag={undefined}
			buttonVariant="outline"
			onTagCreated={onTagCreated}
			onTagUpdated={onTagUpdated}
		/>

		<input
			type="text"
			class="border-input bg-transparent focus-visible:ring-ring h-9 w-60 rounded-md border border-base-300 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
			placeholder="Search by name..."
			bind:value={pagination.searchTerm}
		/>
	</div>

	<CardContent class="w-full px-0">
		<Table containerClass="mt-6 w-full border border-base-300 rounded-xl bg-base-100">
			<TableHeader>
				<TableRow class="text-sm">
					<TableHead>Name</TableHead>
					<TableHead>Description</TableHead>
					<TableHead class="w-28">Edit/Delete</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#if currentData.length === 0}
					<TableRow>
						<TableCell colspan={3} class="py-6 text-center text-base-content/60">
							No tags found.
						</TableCell>
					</TableRow>
				{:else}
					{#each currentData as tag (tag.id)}
						<TableRow class="h-auto">
							<TableCell class="font-medium">{tag.name}</TableCell>
							<TableCell class="text-base-content/70">
								{tag.description ? String(tag.description) : '—'}
							</TableCell>
							<TableCell>
								<div class="flex gap-2">
									<ListingTagUpsertModal {tag} buttonVariant="outline" {onTagCreated} {onTagUpdated} />
									<Button
										variant="outline"
										size="sm"
										type="button"
										onclick={() => openDeleteModal(tag)}
									>
										Delete
									</Button>
								</div>
							</TableCell>
						</TableRow>
					{/each}
				{/if}
			</TableBody>
		</Table>
	</CardContent>

	<CardFooter class="w-full flex-col items-stretch px-0">
		<Pagination
			itemsPerPage={itemsPerPage}
			totalItems={totalFilteredItems}
			currentPage={currentPage}
			totalPages={totalPages}
			setItemsPerPage={setItemsPerPage}
			setCurrentPage={setCurrentPage}
			{paginateFrontFF}
			{paginateBackFF}
			nameOfItems="tags"
			pageSizeOptions={[5, 10, 25, 50]}
		/>
	</CardFooter>
</div>

{#if selectedToDelete}
	<ActionVerificationModal
		data={{ tagId: selectedToDelete.id, tagName: selectedToDelete.name }}
		bind:open={deleteModalOpen}
		executionFunction={deleteListingTagVerificationPresenter.execute}
		status={deleteListingTagVerificationPresenter.status}
		showToastMessage={deleteListingTagVerificationPresenter.showToastMessage}
		toastMessage={deleteListingTagVerificationPresenter.toastMessage}
		buttonIconName={icons.Trash.name}
		buttonText=""
		modalTitle="Delete listing tag"
		modalDescription={`Are you sure you want to delete "${selectedToDelete.name}"? This cannot be undone.`}
		modalVerficationWithAnswer={true}
		modalVerificationAnswer="YES"
		onSuccess={handleDeleteSuccess}
	/>
{/if}
