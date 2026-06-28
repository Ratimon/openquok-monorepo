<script lang="ts">
	import type { AdminListingCommentVm } from '$lib/listings/listing.types';

	import { onMount } from 'svelte';
	import { toast } from '$lib/ui/sonner';

	import { adminListingCommentsManagerPagePresenter } from '$lib/area-admin';
	import { getRootPathPublicExtension } from '$lib/area-public/constants/getRootPathPublicExtensions';
	import { url } from '$lib/utils/path';

	import ListingCommentsTable from '$lib/ui/components/listing-manager/ListingCommentsTable.svelte';

	let showToastMessage = $derived(adminListingCommentsManagerPagePresenter.showToastMessage);
	let toastMessage = $derived(adminListingCommentsManagerPagePresenter.toastMessage);

	const isLoading = $derived(adminListingCommentsManagerPagePresenter.loading);
	const comments = $derived(adminListingCommentsManagerPagePresenter.commentsToManageVm);
	const hasComments = $derived(comments.length > 0);

	onMount(async () => {
		await adminListingCommentsManagerPagePresenter.loadComments();
	});

	$effect(() => {
		if (showToastMessage) {
			const msg = toastMessage;
			if (msg && (msg.includes('Error') || msg.includes('Failed'))) {
				toast.error(msg);
			} else {
				toast.success(msg || 'Updated');
			}
			adminListingCommentsManagerPagePresenter.showToastMessage = false;
		}
	});

	function getListingHref(comment: AdminListingCommentVm) {
		return url(`/${getRootPathPublicExtension(comment.listing?.slug ?? comment.listingId)}`);
	}

	async function handleApprove(commentId: string) {
		await adminListingCommentsManagerPagePresenter.handleApproveComment(commentId);
	}

	function handleDeleteSuccess(commentId: string) {
		adminListingCommentsManagerPagePresenter.removeComment(commentId);
	}
</script>

<div class="p-4 md:p-6">
	<div class="flex items-start justify-between gap-4 flex-wrap">
		<div class="min-w-0">
			<h1 class="text-xl font-semibold text-base-content">Comments</h1>
			<p class="text-sm text-base-content/70">Moderate listing comments. Platform admin only.</p>
		</div>
	</div>

	{#if isLoading}
		<div class="mt-6">
			<span class="loading loading-spinner loading-md"></span>
		</div>
	{:else if !hasComments}
		<div
			class="mt-6 flex min-h-96 flex-1 items-center justify-center rounded-lg border border-dashed border-base-300"
		>
			<div class="flex flex-col items-center gap-1 text-center">
				<h3 class="text-2xl font-bold tracking-tight text-base-content">No comments yet</h3>
				<p class="text-sm text-base-content/70">When readers comment on listings, they will appear here.</p>
			</div>
		</div>
	{:else}
		<ListingCommentsTable
			{comments}
			getListingHref={getListingHref}
			onApprove={handleApprove}
			onDeleteSuccess={handleDeleteSuccess}
		/>
	{/if}
</div>
