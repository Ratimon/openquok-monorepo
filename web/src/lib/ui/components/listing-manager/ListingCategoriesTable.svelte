<script lang="ts">
	import type { ListingCategoryViewModel } from '$lib/listings/GetListing.presenter.svelte';
	import { deleteListingCategoryVerificationPresenter } from '$lib/listings';
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
	import ListingCategoryUpsertModal from '$lib/ui/components/listing-manager/ListingCategoryUpsertModal.svelte';
	import { createSortedCategoryChoices } from '$lib/listings/utils/listingCategories';

	type Props = {
		categoriesVm: ListingCategoryViewModel[];
		onCategoryCreated: (vm: ListingCategoryViewModel) => void | Promise<void>;
		onCategoryUpdated: (vm: ListingCategoryViewModel) => void | Promise<void>;
		onCategoryDeleted: (category: ListingCategoryViewModel) => void | Promise<void>;
	};

	let { categoriesVm, onCategoryCreated, onCategoryUpdated, onCategoryDeleted }: Props = $props();

	let pagination = $derived(
		createPagination({
			initialItemsPerPage: 5,
			initialData: categoriesVm,
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

	let categoryChoices = $derived(createSortedCategoryChoices(categoriesVm));

	let deleteModalOpen = $state(false);
	let selectedToDelete = $state<ListingCategoryViewModel | null>(null);

	function getParentLabel(category: ListingCategoryViewModel): string {
		if (!category.parentId) return '---';
		return categoryChoices.find((c) => c.value === category.parentId)?.label ?? '---';
	}

	function openDeleteModal(category: ListingCategoryViewModel) {
		selectedToDelete = category;
		deleteModalOpen = true;
	}

	async function handleDeleteSuccess() {
		if (selectedToDelete) {
			await onCategoryDeleted(selectedToDelete);
		}
		deleteModalOpen = false;
		selectedToDelete = null;
	}
</script>

<div class="mt-6 w-full">
	<div class="flex w-full justify-between flex-wrap gap-4 items-center">
		<ListingCategoryUpsertModal
			category={undefined}
			allCategories={categoriesVm}
			buttonVariant="outline"
			onCategoryCreated={onCategoryCreated}
			onCategoryUpdated={onCategoryUpdated}
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
					<TableHead>Parent</TableHead>
					<TableHead class="w-28">Edit/Delete</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#if currentData.length === 0}
					<TableRow>
						<TableCell colspan={4} class="py-6 text-center text-base-content/60">
							No categories found.
						</TableCell>
					</TableRow>
				{:else}
					{#each currentData as category (category.id)}
						<TableRow class="h-auto">
							<TableCell class="font-medium">{category.name}</TableCell>
							<TableCell class="text-base-content/70">
								{category.description ? String(category.description) : '—'}
							</TableCell>
							<TableCell class="text-base-content/70">{getParentLabel(category)}</TableCell>
							<TableCell>
								<div class="flex gap-2">
									<ListingCategoryUpsertModal
										{category}
										allCategories={categoriesVm}
										buttonVariant="outline"
										{onCategoryCreated}
										{onCategoryUpdated}
									/>
									<Button
										variant="outline"
										size="sm"
										type="button"
										onclick={() => openDeleteModal(category)}
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
			nameOfItems="categories"
			pageSizeOptions={[5, 10, 25, 50]}
		/>
	</CardFooter>
</div>

{#if selectedToDelete}
	<ActionVerificationModal
		data={{ categoryId: selectedToDelete.id, categoryName: selectedToDelete.name }}
		bind:open={deleteModalOpen}
		executionFunction={deleteListingCategoryVerificationPresenter.execute}
		status={deleteListingCategoryVerificationPresenter.status}
		showToastMessage={deleteListingCategoryVerificationPresenter.showToastMessage}
		toastMessage={deleteListingCategoryVerificationPresenter.toastMessage}
		buttonIconName={icons.Trash.name}
		buttonText=""
		modalTitle="Delete listing category"
		modalDescription={`Are you sure you want to delete "${selectedToDelete.name}"? This cannot be undone.`}
		modalVerficationWithAnswer={true}
		modalVerificationAnswer="YES"
		onSuccess={handleDeleteSuccess}
	/>
{/if}
