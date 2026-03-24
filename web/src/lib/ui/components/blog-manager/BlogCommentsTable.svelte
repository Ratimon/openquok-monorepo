<script lang="ts">
	import type { AdminBlogCommentVm } from '$lib/blog/blog.types';

	import { deleteBlogCommentVerificationPresenter } from '$lib/blog';
	import { icons } from '$data/icon';
	import ActionVerificationModal from '$lib/ui/templates/ActionVerificationModal.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { CardContent, CardFooter } from '$lib/ui/card';
	import { createPagination } from '$lib/ui/helpers/createPagination.svelte';
	import { formatPassedTime } from '$lib/ui/helpers/common';
	import { Pagination } from '$lib/ui/pagination';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		comments: AdminBlogCommentVm[];
		getPostHref: (comment: AdminBlogCommentVm) => string;
		onApprove: (commentId: string) => Promise<void>;
		onDeleteSuccess: (commentId: string) => void;
	};

	let { comments, getPostHref, onApprove, onDeleteSuccess }: Props = $props();

	let pagination = $derived(
		createPagination({
			initialItemsPerPage: 25,
			initialData: comments,
			searchField: 'content'
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
	let selectedToDelete = $state<AdminBlogCommentVm | null>(null);
	let busyApproveId = $state<string | null>(null);

	function openDeleteModal(comment: AdminBlogCommentVm) {
		selectedToDelete = comment;
		deleteModalOpen = true;
	}

	async function handleDeleteModalSuccess() {
		if (selectedToDelete) {
			onDeleteSuccess(selectedToDelete.id);
		}
		deleteModalOpen = false;
		selectedToDelete = null;
	}

	async function handleApprove(commentId: string) {
		busyApproveId = commentId;
		try {
			await onApprove(commentId);
		} finally {
			busyApproveId = null;
		}
	}
</script>

<div class="mt-6 grid">
	<div class="flex w-full justify-end">
		<input
			type="text"
			class="border-input bg-transparent focus-visible:ring-ring h-9 w-60 rounded-md border border-base-300 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
			placeholder="Search by content…"
			bind:value={pagination.searchTerm}
		/>
	</div>

	<CardContent>
		<div class="grid">
			<div class="mt-6 table w-full table-auto">
				<div class="table-header-group">
					<div class="table-row text-sm">
						<div class="table-cell h-10 border-b-2 border-base-300 px-2 text-left align-middle font-medium">
							Content
						</div>
						<div class="table-cell h-10 whitespace-nowrap border-b-2 border-base-300 px-2 text-left align-middle font-medium">
							Author
						</div>
						<div class="table-cell h-10 border-b-2 border-base-300 px-2 text-left align-middle font-medium">
							Blog post
						</div>
						<div class="table-cell h-10 whitespace-nowrap border-b-2 border-base-300 px-2 text-left align-middle font-medium">
							Date
						</div>
						<div class="table-cell h-10 border-b-2 border-base-300 px-2 text-left align-middle font-medium">
							Status
						</div>
						<div class="table-cell h-10 w-24 border-b-2 border-base-300 px-2 text-left align-middle font-medium">
							Actions
						</div>
					</div>
				</div>

				<div class="table-row-group">
					{#if currentData.length === 0}
						<div class="table-row">
							<div class="table-cell p-6 text-center text-base-content/60" style="grid-column: 1 / -1;">
								No comments found.
							</div>
						</div>
					{:else}
						{#each currentData as comment (comment.id)}
							<div class="table-row h-auto">
								<div class="table-cell content-center border-b-2 border-base-300 p-2 pr-4 align-middle">
									{comment.content}
								</div>
								<div class="table-cell content-center whitespace-nowrap border-b-2 border-base-300 p-2 align-middle text-base-content/70">
									{comment.author?.fullName ?? 'Anonymous'}
								</div>
								<div class="table-cell content-center border-b-2 border-base-300 p-2 align-middle">
									{#if comment.blogPost}
										<a
											href={getPostHref(comment)}
											class="text-base-content/70 hover:underline"
										>
											{comment.blogPost.title}
										</a>
									{:else}
										<span class="text-base-content/50">Deleted post</span>
									{/if}
								</div>
								<div class="table-cell content-center whitespace-nowrap border-b-2 border-base-300 p-2 align-middle text-base-content/70">
									{formatPassedTime(comment.createdAt)}
								</div>
								<div class="table-cell content-center border-b-2 border-base-300 p-2 align-middle">
									<span
										class={comment.isApproved
											? 'text-success'
											: 'text-warning'}
									>
										{comment.isApproved ? 'Approved' : 'Pending'}
									</span>
								</div>
								<div class="table-cell content-center border-b-2 border-base-300 p-2">
									<div class="flex gap-2">
										{#if !comment.isApproved}
											<Button
												variant="outline"
												size="sm"
												type="button"
												disabled={busyApproveId !== null}
												onclick={() => handleApprove(comment.id)}
											>
												<AbstractIcon name={icons.Check.name} class="size-4" width="16" height="16" />
											</Button>
										{/if}

										<Button
											variant="outline"
											size="sm"
											type="button"
											onclick={() => openDeleteModal(comment)}
										>
											<AbstractIcon name={icons.Trash.name} class="size-4" width="16" height="16" />
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
			nameOfItems="comments"
			pageSizeOptions={[5, 10, 25, 50]}
		/>
	</CardFooter>
</div>

{#if selectedToDelete}
	<ActionVerificationModal
		data={{ commentId: selectedToDelete.id }}
		bind:open={deleteModalOpen}
		executionFunction={deleteBlogCommentVerificationPresenter.execute}
		status={deleteBlogCommentVerificationPresenter.status}
		showToastMessage={deleteBlogCommentVerificationPresenter.showToastMessage}
		toastMessage={deleteBlogCommentVerificationPresenter.toastMessage}
		buttonIconName={icons.Trash.name}
		buttonText=""
		modalTitle="Delete comment"
		modalDescription="This permanently removes the comment. Type YES to confirm."
		modalVerficationWithAnswer={true}
		modalVerificationAnswer="YES"
		onSuccess={handleDeleteModalSuccess}
	/>
{/if}
