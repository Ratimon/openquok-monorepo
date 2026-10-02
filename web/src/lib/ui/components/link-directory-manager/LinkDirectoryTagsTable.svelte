<script lang="ts">
	import type { LinkDirectoryTagDto } from '$lib/link-directory/link-directory.types';
	import type { LinkDirectoryTagGroupDto } from '$lib/link-directory/link-directory-admin.types';
	import { linkDirectoryRepository } from '$lib/link-directory/index';

	import { icons } from '$data/icons';
	import ActionVerificationModal from '$lib/ui/modals/ActionVerificationModal.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
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

	import LinkDirectoryTagUpsertModal from '$lib/ui/components/link-directory-manager/LinkDirectoryTagUpsertModal.svelte';

	type Props = {
		tagsVm: LinkDirectoryTagDto[];
		tagGroupsVm: LinkDirectoryTagGroupDto[];
		onTagCreated: (vm: LinkDirectoryTagDto) => void | Promise<void>;
		onTagUpdated: (vm: LinkDirectoryTagDto) => void | Promise<void>;
		onTagDeleted: (tag: LinkDirectoryTagDto) => void | Promise<void>;
	};

	let { tagsVm, tagGroupsVm, onTagCreated, onTagUpdated, onTagDeleted }: Props = $props();

	let pagination = $derived(
		createPagination({ initialItemsPerPage: 10, initialData: tagsVm, searchField: 'name' })
	);
	let { currentData, currentPage, totalPages, totalFilteredItems, itemsPerPage, paginateFrontFF, paginateBackFF, setItemsPerPage, setCurrentPage } =
		$derived(pagination);

	let deleteModalOpen = $state(false);
	let selectedToDelete = $state<LinkDirectoryTagDto | null>(null);

</script>

<div class="mt-6 w-full">
	<div class="flex w-full justify-between flex-wrap gap-4 items-center">
		<LinkDirectoryTagUpsertModal tagGroups={tagGroupsVm} buttonVariant="outline" onTagCreated={onTagCreated} />
		<input
			type="text"
			class="border-input h-9 w-60 rounded-md border border-base-300 px-3 text-sm"
			placeholder="Search tags..."
			bind:value={pagination.searchTerm}
		/>
	</div>
	<Table containerClass="mt-6 w-full border border-base-300 rounded-xl bg-base-100">
		<TableHeader>
			<TableRow>
				<TableHead>Name</TableHead>
				<TableHead>Slug</TableHead>
				<TableHead>Groups</TableHead>
				<TableHead class="w-40">Actions</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{#each currentData as tag (tag.id)}
				<TableRow>
					<TableCell class="font-medium">{tag.name}</TableCell>
					<TableCell class="font-mono text-xs">{tag.slug}</TableCell>
					<TableCell class="text-xs">{tag.groups.map((g) => g.name).join(', ') || '—'}</TableCell>
					<TableCell>
						<div class="flex gap-2">
							<LinkDirectoryTagUpsertModal
								{tag}
								tagGroups={tagGroupsVm}
								buttonVariant="ghost"
								onTagUpdated={onTagUpdated}
							/>
							<Button
								variant="ghost"
								size="sm"
								onclick={() => {
									selectedToDelete = tag;
									deleteModalOpen = true;
								}}>Delete</Button
							>
						</div>
					</TableCell>
				</TableRow>
			{/each}
		</TableBody>
	</Table>
	<Pagination
		{currentPage}
		{totalPages}
		totalItems={totalFilteredItems}
		{itemsPerPage}
		{paginateFrontFF}
		{paginateBackFF}
		{setItemsPerPage}
		{setCurrentPage}
		nameOfItems="tags"
	/>
</div>

{#if selectedToDelete}
	<ActionVerificationModal
		data={{ tagId: selectedToDelete.id }}
		bind:open={deleteModalOpen}
		executionFunction={async () => {
			const result = await linkDirectoryRepository.deleteTag(selectedToDelete!.id);
			if (result.ok) {
				await onTagDeleted(selectedToDelete!);
				selectedToDelete = null;
				return { success: true, message: 'Tag deleted.' };
			}
			return { success: false, message: result.error ?? 'Failed to delete tag.' };
		}}
		buttonIconName={icons.Trash.name}
		buttonText=""
		modalTitle="Delete tag"
		modalDescription={`Remove “${selectedToDelete.name}”.`}
		modalVerficationWithAnswer={true}
		modalVerificationAnswer="YES"
	/>
{/if}
