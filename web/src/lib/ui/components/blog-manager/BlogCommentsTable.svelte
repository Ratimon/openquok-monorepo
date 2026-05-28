<script lang="ts">
	import type { AdminBlogCommentVm } from '$lib/blogs/blog.types';

	import { deleteBlogCommentVerificationPresenter } from '$lib/blogs';
	import { icons } from '$data/icons';
	import ActionVerificationModal from '$lib/ui/modals/ActionVerificationModal.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { CardContent, CardFooter } from '$lib/ui/card';
	import { createPagination } from '$lib/ui/helpers/createPagination.svelte';
	import { formatPassedTime } from '$lib/ui/helpers/common';
	import { Pagination } from '$lib/ui/pagination';
	import {
		Root as Table,
		Body as TableBody,
		Cell as TableCell,
		Head as TableHead,
		Header as TableHeader,
		Row as TableRow
	} from '$lib/ui/table';
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

<div class="mt-6 w-full">
	<div class="flex w-full justify-end">
		<input
			type="text"
			class="border-input bg-transparent focus-visible:ring-ring h-9 w-60 rounded-md border border-base-300 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
			placeholder="Search by content…"
			bind:value={pagination.searchTerm}
		/>
	</div>

	<CardContent class="w-full px-0">
		<Table containerClass="mt-6 w-full border border-base-300 rounded-xl bg-base-100">
			<TableHeader>
				<TableRow class="text-sm">
					<TableHead class="whitespace-normal">Content</TableHead>
					<TableHead>Author</TableHead>
					<TableHead class="whitespace-normal">Blog post</TableHead>
					<TableHead>Date</TableHead>
					<TableHead>Status</TableHead>
					<TableHead class="w-24">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#if currentData.length === 0}
					<TableRow>
						<TableCell colspan={6} class="py-6 text-center text-base-content/60">
							No comments found.
						</TableCell>
					</TableRow>
				{:else}
					{#each currentData as comment (comment.id)}
						<TableRow class="h-auto">
							<TableCell class="pr-4">
								{comment.content}
							</TableCell>
							<TableCell class="text-base-content/70">
								{comment.author?.fullName ?? 'Anonymous'}
							</TableCell>
							<TableCell>
								{#if comment.blogPost}
									<a href={getPostHref(comment)} class="text-base-content/70 hover:underline">
										{comment.blogPost.title}
									</a>
								{:else}
									<span class="text-base-content/50">Deleted post</span>
								{/if}
							</TableCell>
							<TableCell class="text-base-content/70">
								{formatPassedTime(comment.createdAt)}
							</TableCell>
							<TableCell>
								<span class={comment.isApproved ? 'text-success' : 'text-warning'}>
									{comment.isApproved ? 'Approved' : 'Pending'}
								</span>
							</TableCell>
							<TableCell>
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
