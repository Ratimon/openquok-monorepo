<script lang="ts">
	import type { ListingTagGroupProgrammerModel } from '$lib/listings/Listing.repository.svelte';
	import { deleteListingTagGroupVerificationPresenter } from '$lib/listings';
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
	import ListingTagGroupUpsertModal from '$lib/ui/components/listing-manager/ListingTagGroupUpsertModal.svelte';

	type Props = {
		tagGroupsVm: ListingTagGroupProgrammerModel[];
		onTagGroupCreated: (vm: ListingTagGroupProgrammerModel) => void | Promise<void>;
		onTagGroupUpdated: (vm: ListingTagGroupProgrammerModel) => void | Promise<void>;
		onTagGroupDeleted: (group: ListingTagGroupProgrammerModel) => void | Promise<void>;
	};

	let { tagGroupsVm, onTagGroupCreated, onTagGroupUpdated, onTagGroupDeleted }: Props = $props();

	let pagination = $derived(
		createPagination({
			initialItemsPerPage: 5,
			initialData: tagGroupsVm,
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
	let selectedToDelete = $state<ListingTagGroupProgrammerModel | null>(null);

	function openDeleteModal(group: ListingTagGroupProgrammerModel) {
		selectedToDelete = group;
		deleteModalOpen = true;
	}

	async function handleDeleteSuccess() {
		if (selectedToDelete) {
			await onTagGroupDeleted(selectedToDelete);
		}
		deleteModalOpen = false;
		selectedToDelete = null;
	}
</script>

<div class="mt-6 w-full">
	<div class="flex w-full justify-between flex-wrap gap-4 items-center">
		<ListingTagGroupUpsertModal
			tagGroup={undefined}
			buttonVariant="outline"
			onTagGroupCreated={onTagGroupCreated}
			onTagGroupUpdated={onTagGroupUpdated}
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
					<TableHead class="w-28">Edit/Delete</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#if currentData.length === 0}
					<TableRow>
						<TableCell colspan={2} class="py-6 text-center text-base-content/60">
							No tag groups found.
						</TableCell>
					</TableRow>
				{:else}
					{#each currentData as group (group.id)}
						<TableRow class="h-auto">
							<TableCell class="font-medium">{group.name}</TableCell>
							<TableCell>
								<div class="flex gap-2">
									<ListingTagGroupUpsertModal
										tagGroup={group}
										buttonVariant="outline"
										{onTagGroupCreated}
										{onTagGroupUpdated}
									/>
									<Button
										variant="outline"
										size="sm"
										type="button"
										onclick={() => openDeleteModal(group)}
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
			nameOfItems="tag groups"
			pageSizeOptions={[5, 10, 25, 50]}
		/>
	</CardFooter>
</div>

{#if selectedToDelete}
	<ActionVerificationModal
		data={{ tagGroupId: selectedToDelete.id, tagGroupName: selectedToDelete.name }}
		bind:open={deleteModalOpen}
		executionFunction={deleteListingTagGroupVerificationPresenter.execute}
		status={deleteListingTagGroupVerificationPresenter.status}
		showToastMessage={deleteListingTagGroupVerificationPresenter.showToastMessage}
		toastMessage={deleteListingTagGroupVerificationPresenter.toastMessage}
		buttonIconName={icons.Trash.name}
		buttonText=""
		modalTitle="Delete tag group"
		modalDescription={`Are you sure you want to delete "${selectedToDelete.name}"? Tags in this group will be unlinked but not deleted.`}
		modalVerficationWithAnswer={true}
		modalVerificationAnswer="YES"
		onSuccess={handleDeleteSuccess}
	/>
{/if}
