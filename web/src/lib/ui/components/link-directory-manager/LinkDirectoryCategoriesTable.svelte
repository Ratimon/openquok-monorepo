<script lang="ts">
	import type { LinkDirectoryCategoryDto } from '$lib/link-directory/link-directory.types';
	import { linkDirectoryRepository } from '$lib/link-directory/index';

	import { icons } from '$data/icons';
	import ActionVerificationModal from '$lib/ui/modals/ActionVerificationModal.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { CardContent } from '$lib/ui/card';
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

	import LinkDirectoryCategoryUpsertModal from '$lib/ui/components/link-directory-manager/LinkDirectoryCategoryUpsertModal.svelte';

	type Props = {
		categoriesVm: LinkDirectoryCategoryDto[];
		onCategoryCreated: (vm: LinkDirectoryCategoryDto) => void | Promise<void>;
		onCategoryUpdated: (vm: LinkDirectoryCategoryDto) => void | Promise<void>;
		onCategoryDeleted: (category: LinkDirectoryCategoryDto) => void | Promise<void>;
	};

	let { categoriesVm, onCategoryCreated, onCategoryUpdated, onCategoryDeleted }: Props = $props();

	let pagination = $derived(
		createPagination({ initialItemsPerPage: 10, initialData: categoriesVm, searchField: 'name' })
	);

	let { currentData, currentPage, totalPages, totalFilteredItems, itemsPerPage, paginateFrontFF, paginateBackFF, setItemsPerPage, setCurrentPage } =
		$derived(pagination);

	let deleteModalOpen = $state(false);
	let selectedToDelete = $state<LinkDirectoryCategoryDto | null>(null);

	function openDeleteModal(category: LinkDirectoryCategoryDto) {
		selectedToDelete = category;
		deleteModalOpen = true;
	}

</script>

<div class="mt-6 w-full">
	<div class="flex w-full justify-between flex-wrap gap-4 items-center">
		<LinkDirectoryCategoryUpsertModal
			buttonVariant="outline"
			onCategoryCreated={onCategoryCreated}
			onCategoryUpdated={onCategoryUpdated}
		/>
		<input
			type="text"
			class="border-input bg-transparent focus-visible:ring-ring h-9 w-60 rounded-md border border-base-300 px-3 py-1 text-sm"
			placeholder="Search by name..."
			bind:value={pagination.searchTerm}
		/>
	</div>

	<CardContent class="w-full px-0">
		<Table containerClass="mt-6 w-full border border-base-300 rounded-xl bg-base-100">
			<TableHeader>
				<TableRow class="text-sm">
					<TableHead>Name</TableHead>
					<TableHead>Slug</TableHead>
					<TableHead>Sort</TableHead>
					<TableHead class="w-40">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each currentData as category (category.id)}
					<TableRow>
						<TableCell class="font-medium">{category.name}</TableCell>
						<TableCell class="font-mono text-xs">{category.slug}</TableCell>
						<TableCell>{category.sortOrder}</TableCell>
						<TableCell>
							<div class="flex gap-2">
								<LinkDirectoryCategoryUpsertModal
									{category}
									buttonVariant="ghost"
									onCategoryUpdated={onCategoryUpdated}
								/>
								<Button variant="ghost" size="sm" onclick={() => openDeleteModal(category)}>Delete</Button>
							</div>
						</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</CardContent>

	<Pagination
		{currentPage}
		{totalPages}
		totalItems={totalFilteredItems}
		{itemsPerPage}
		{paginateFrontFF}
		{paginateBackFF}
		{setItemsPerPage}
		{setCurrentPage}
		nameOfItems="categories"
	/>
</div>

{#if selectedToDelete}
	<ActionVerificationModal
		data={{ categoryId: selectedToDelete.id }}
		bind:open={deleteModalOpen}
		executionFunction={async () => {
			const result = await linkDirectoryRepository.deleteCategory(selectedToDelete!.id);
			if (result.ok) {
				await onCategoryDeleted(selectedToDelete!);
				selectedToDelete = null;
				return { success: true, message: 'Category deleted.' };
			}
			return { success: false, message: result.error ?? 'Failed to delete category.' };
		}}
		buttonIconName={icons.Trash.name}
		buttonText=""
		modalTitle="Delete category"
		modalDescription={`Remove “${selectedToDelete.name}” from the link directory.`}
		modalVerficationWithAnswer={true}
		modalVerificationAnswer="YES"
	/>
{/if}
