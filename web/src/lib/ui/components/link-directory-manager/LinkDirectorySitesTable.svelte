<script lang="ts">
	import type { LinkDirectorySiteDto } from '$lib/link-directory/link-directory.types';
	import { linkDirectoryRepository } from '$lib/link-directory/index';
	import { getRootPathSecretAdminLinkDirectoryManagerSiteEditor } from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { url } from '$lib/utils/path';

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

	type Props = {
		sitesVm: LinkDirectorySiteDto[];
		onSiteDeleted: (siteId: string) => void | Promise<void>;
	};

	let { sitesVm, onSiteDeleted }: Props = $props();

	let pagination = $derived(
		createPagination({ initialItemsPerPage: 10, initialData: sitesVm, searchField: 'title' })
	);
	let { currentData, currentPage, totalPages, totalFilteredItems, itemsPerPage, paginateFrontFF, paginateBackFF, setItemsPerPage, setCurrentPage } =
		$derived(pagination);

	let deleteModalOpen = $state(false);
	let selectedToDelete = $state<LinkDirectorySiteDto | null>(null);

</script>

<div class="mt-6 w-full">
	<input
		type="text"
		class="border-input h-9 w-60 rounded-md border border-base-300 px-3 text-sm"
		placeholder="Search sites..."
		bind:value={pagination.searchTerm}
	/>
	<Table containerClass="mt-4 w-full border border-base-300 rounded-xl bg-base-100">
		<TableHeader>
			<TableRow>
				<TableHead>Title</TableHead>
				<TableHead>DR</TableHead>
				<TableHead>Published</TableHead>
				<TableHead>Opportunities</TableHead>
				<TableHead class="w-44">Actions</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{#each currentData as site (site.id)}
				<TableRow>
					<TableCell>
						<div class="font-medium">{site.title}</div>
						<div class="text-xs text-base-content/60 font-mono">{site.slug}</div>
					</TableCell>
					<TableCell>{site.domainRating ?? '—'}</TableCell>
					<TableCell>
						{#if site.isAdminPublished}
							<span class="badge badge-success badge-sm">Yes</span>
						{:else}
							<span class="badge badge-ghost badge-sm">Draft</span>
						{/if}
					</TableCell>
					<TableCell>{site.opportunities?.length ?? 0}</TableCell>
					<TableCell>
						<div class="flex gap-2">
							<Button
								variant="ghost"
								size="sm"
								href={url(getRootPathSecretAdminLinkDirectoryManagerSiteEditor(site.id))}>Edit</Button
							>
							<Button
								variant="ghost"
								size="sm"
								onclick={() => {
									selectedToDelete = site;
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
		nameOfItems="sites"
	/>
</div>

{#if selectedToDelete}
	<ActionVerificationModal
		data={{ siteId: selectedToDelete.id }}
		bind:open={deleteModalOpen}
		executionFunction={async () => {
			const result = await linkDirectoryRepository.deleteSite(selectedToDelete!.id);
			if (result.ok) {
				await onSiteDeleted(selectedToDelete!.id);
				selectedToDelete = null;
				return { success: true, message: 'Site deleted.' };
			}
			return { success: false, message: result.error ?? 'Failed to delete site.' };
		}}
		buttonIconName={icons.Trash.name}
		buttonText=""
		modalTitle="Delete site"
		modalDescription={`Remove “${selectedToDelete.title}” and its opportunities.`}
		modalVerficationWithAnswer={true}
		modalVerificationAnswer="YES"
	/>
{/if}
