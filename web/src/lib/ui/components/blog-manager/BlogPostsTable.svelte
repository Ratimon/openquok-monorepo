<script lang="ts">
	import { icons } from '$data/icon';
	import { deleteBlogPostVerificationPresenter } from '$lib/blog';
	import ActionVerificationModal from '$lib/ui/templates/ActionVerificationModal.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { CardContent, CardFooter } from '$lib/ui/card';
	import { createPagination } from '$lib/ui/helpers/createPagination.svelte';
	import { Pagination } from '$lib/ui/pagination';
	import FormattedISODate from '$lib/ui/components/FormattedISODate.svelte';
	import SupabaseImage from '$lib/ui/supabase/SupabaseImage.svelte';

	export type BlogPostTableItem = {
		id: string;
		title: string;
		description?: string | null;
		createdAt: string;
		isUserPublished: boolean;
		isAdminApproved: boolean;
		heroImageFilename?: string | null;
		/** Post body HTML; used after delete to clean up inline images in storage. */
		content?: string | null;
	};

	type Props = {
		posts: BlogPostTableItem[];
		getEditHref: (post: BlogPostTableItem) => string;
		onPostDeleted: (post: BlogPostTableItem) => void | Promise<void>;
	};

	let { posts, getEditHref, onPostDeleted }: Props = $props();

	let pagination = $derived(
		createPagination({
			initialItemsPerPage: 5,
			initialData: posts,
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
	let selectedToDelete = $state<BlogPostTableItem | null>(null);

	function openDeleteModal(post: BlogPostTableItem) {
		selectedToDelete = post;
		deleteModalOpen = true;
	}

	async function handleDeleteSuccess() {
		if (selectedToDelete) {
			await onPostDeleted(selectedToDelete);
		}
		deleteModalOpen = false;
		selectedToDelete = null;
	}

	function statusLabel(post: BlogPostTableItem): { label: string; className: string } {
		if (!post.isUserPublished) return { label: 'Draft', className: 'badge badge-info' };
		if (!post.isAdminApproved) return { label: 'Awaiting approval', className: 'badge badge-warning' };
		return { label: 'Published', className: 'badge badge-success' };
	}
</script>

<div class="mt-6 grid">
	<div class="flex w-full justify-end">
		<input
			type="text"
			class="border-input bg-transparent focus-visible:ring-ring h-9 w-60 rounded-md border border-base-300 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
			placeholder="Search by title..."
			bind:value={pagination.searchTerm}
		/>
	</div>

	<CardContent>
		<div class="grid">
			<div class="mt-6 table w-full table-auto">
				<div class="table-header-group">
					<div class="table-row text-sm">
						<div class="hidden h-10 w-24 border-b-2 border-base-300 px-2 text-left align-middle font-medium sm:table-cell">
							
						</div>
						<div class="table-cell h-10 border-b-2 border-base-300 px-2 text-left align-middle font-medium">
							Title
						</div>
						<div class="hidden h-10 border-b-2 border-base-300 px-2 text-left align-middle font-medium sm:table-cell">
							Description
						</div>
						<div class="hidden h-10 border-b-2 border-base-300 px-2 text-left align-middle font-medium sm:table-cell">
							Status
						</div>
						<div class="hidden h-10 border-b-2 border-base-300 px-2 text-left align-middle font-medium sm:table-cell">
							Created
						</div>
						<div
							class="table-cell h-10 min-w-[11rem] whitespace-nowrap border-b-2 border-base-300 px-2 text-left align-middle font-medium"
						>
							Actions
						</div>
					</div>
				</div>

				<div class="table-row-group">
					{#if currentData.length === 0}
						<div class="table-row">
							<div class="table-cell p-6 text-center text-base-content/60" style="grid-column: 1 / -1;">
								No posts found.
							</div>
						</div>
					{:else}
						{#each currentData as post (post.id)}
							<div class="table-row h-auto">
								<div class="hidden w-24 border-b-2 border-base-300 p-2 sm:table-cell">
									{#if post.heroImageFilename}
										<SupabaseImage
											dbImageUrl={post.heroImageFilename}
											database="blog_images"
											width={900}
											height={600}
											class="relative inline h-12 w-24 overflow-hidden rounded-lg bg-base-200"
										/>
									{:else}
										<div class="h-12 w-24 rounded-lg bg-base-200"></div>
									{/if}
								</div>

								<div class="table-cell content-center border-b-2 border-base-300 p-2 align-middle font-medium">
									{post.title}
								</div>

								<div class="hidden content-center overflow-hidden border-b-2 border-base-300 p-2 text-xs text-base-content/70 sm:table-cell">
									{#if post.description}
										{post.description.slice(0, 80)}{post.description.length > 80 ? '…' : ''}
									{:else}
										<span class="text-base-content/50">—</span>
									{/if}
								</div>

								<div class="hidden content-center border-b-2 border-base-300 p-2 sm:table-cell">
									<span class={statusLabel(post).className}>{statusLabel(post).label}</span>
								</div>

								<div class="hidden content-center whitespace-nowrap border-b-2 border-base-300 p-2 text-sm text-base-content/70 sm:table-cell">
									<FormattedISODate date={post.createdAt} />
								</div>

								<div
									class="table-cell content-center whitespace-nowrap border-b-2 border-base-300 p-2 align-middle"
								>
									<div class="flex flex-row flex-nowrap items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											href={getEditHref(post)}
										>
											Edit
										</Button>

										<Button
											variant="outline"
											size="sm"
											type="button"
											onclick={() => openDeleteModal(post)}
										>
											Delete
										</Button>
									</div>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</CardContent>

	<CardFooter>
		<Pagination
			itemsPerPage={itemsPerPage}
			totalItems={totalFilteredItems}
			currentPage={currentPage}
			totalPages={totalPages}
			setItemsPerPage={setItemsPerPage}
			setCurrentPage={setCurrentPage}
			{paginateFrontFF}
			{paginateBackFF}
			nameOfItems="posts"
			pageSizeOptions={[5, 10, 25, 50]}
		/>
	</CardFooter>
</div>

{#if selectedToDelete}
	<ActionVerificationModal
		data={{ postId: selectedToDelete.id, postTitle: selectedToDelete.title }}
		bind:open={deleteModalOpen}
		executionFunction={deleteBlogPostVerificationPresenter.execute}
		status={deleteBlogPostVerificationPresenter.status}
		showToastMessage={deleteBlogPostVerificationPresenter.showToastMessage}
		toastMessage={deleteBlogPostVerificationPresenter.toastMessage}
		buttonIconName={icons.Trash.name}
		buttonText=""
		modalTitle="Delete blog post"
		modalDescription={`Are you sure you want to delete "${selectedToDelete.title}"? This cannot be undone.`}
		modalVerficationWithAnswer={true}
		modalVerificationAnswer="YES"
		onSuccess={handleDeleteSuccess}
	/>
{/if}
