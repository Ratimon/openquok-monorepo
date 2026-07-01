<script lang="ts">
	import { icons } from '$data/icons';
	import { deleteListingVerificationPresenter } from '$lib/listings';
	import type { ActionVerificationModalPresenter } from '$lib/core/ActionVerificationModal.presenter.svelte';
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
	import FormattedISODate from '$lib/ui/components/FormattedISODate.svelte';

	export type ListingTableItem = {
		id: string;
		title: string;
		description?: string | null;
		excerpt?: string | null;
		createdAt: string;
		isUserPublished: boolean;
		isAdminPublished: boolean;
		logoImageUrl?: string | null;
	};

	type Props = {
		listings: ListingTableItem[];
		getEditHref: (listing: ListingTableItem) => string;
		onListingDeleted: (listing: ListingTableItem) => void | Promise<void>;
		itemLabel?: string;
		deleteVerificationPresenter?: ActionVerificationModalPresenter;
	};

	let {
		listings,
		getEditHref,
		onListingDeleted,
		itemLabel = 'extensions',
		deleteVerificationPresenter = deleteListingVerificationPresenter
	}: Props = $props();

	let pagination = $derived(
		createPagination({
			initialItemsPerPage: 5,
			initialData: listings,
			searchField: 'title'
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
	let selectedToDelete = $state<ListingTableItem | null>(null);

	function openDeleteModal(listing: ListingTableItem) {
		selectedToDelete = listing;
		deleteModalOpen = true;
	}

	async function handleDeleteSuccess() {
		if (selectedToDelete) {
			await onListingDeleted(selectedToDelete);
		}
		deleteModalOpen = false;
		selectedToDelete = null;
	}

	function statusLabel(listing: ListingTableItem): { label: string; className: string } {
		if (!listing.isUserPublished) return { label: 'Draft', className: 'badge badge-info' };
		if (!listing.isAdminPublished) return { label: 'Awaiting approval', className: 'badge badge-warning' };
		return { label: 'Published', className: 'badge badge-success' };
	}

	function summaryText(listing: ListingTableItem): string {
		const text = listing.excerpt || listing.description || '';
		if (!text) return '—';
		return text.length > 80 ? `${text.slice(0, 80)}…` : text;
	}
</script>

<div class="mt-6 w-full">
	<div class="flex w-full justify-end">
		<input
			type="text"
			class="border-input bg-transparent focus-visible:ring-ring h-9 w-60 rounded-md border border-base-300 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
			placeholder="Search by title..."
			bind:value={pagination.searchTerm}
		/>
	</div>

	<CardContent class="w-full px-0">
		<Table containerClass="mt-6 w-full border border-base-300 rounded-xl bg-base-100">
			<TableHeader>
				<TableRow class="text-sm">
					<TableHead>Title</TableHead>
					<TableHead class="hidden sm:table-cell">Summary</TableHead>
					<TableHead class="hidden sm:table-cell">Status</TableHead>
					<TableHead class="hidden sm:table-cell">Created</TableHead>
					<TableHead class="min-w-[11rem]">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#if currentData.length === 0}
					<TableRow>
						<TableCell colspan={5} class="py-6 text-center text-base-content/60">
							No {itemLabel} found.
						</TableCell>
					</TableRow>
				{:else}
					{#each currentData as listing (listing.id)}
						<TableRow class="h-auto">
							<TableCell class="font-medium">
								{listing.title}
							</TableCell>
							<TableCell class="hidden overflow-hidden text-xs text-base-content/70 sm:table-cell">
								{summaryText(listing)}
							</TableCell>
							<TableCell class="hidden sm:table-cell">
								<span class={statusLabel(listing).className}>{statusLabel(listing).label}</span>
							</TableCell>
							<TableCell class="hidden text-sm text-base-content/70 sm:table-cell">
								<FormattedISODate date={listing.createdAt} />
							</TableCell>
							<TableCell>
								<div class="flex flex-row flex-nowrap items-center gap-2">
									<Button variant="outline" size="sm" href={getEditHref(listing)}>Edit</Button>
									<Button
										variant="outline"
										size="sm"
										type="button"
										onclick={() => openDeleteModal(listing)}
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
			nameOfItems={itemLabel}
			pageSizeOptions={[5, 10, 25, 50]}
		/>
	</CardFooter>
</div>

{#if selectedToDelete}
	<ActionVerificationModal
		data={{ listingId: selectedToDelete.id, listingTitle: selectedToDelete.title }}
		bind:open={deleteModalOpen}
		executionFunction={deleteVerificationPresenter.execute}
		status={deleteVerificationPresenter.status}
		showToastMessage={deleteVerificationPresenter.showToastMessage}
		toastMessage={deleteVerificationPresenter.toastMessage}
		buttonIconName={icons.Trash.name}
		buttonText=""
		modalTitle="Delete listing"
		modalDescription={`Are you sure you want to delete "${selectedToDelete.title}"? This cannot be undone.`}
		modalVerficationWithAnswer={true}
		modalVerificationAnswer="YES"
		onSuccess={handleDeleteSuccess}
	/>
{/if}
