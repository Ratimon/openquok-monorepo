<script lang="ts">
	import type { AdminBlogCommentVm } from '$lib/blog/blog.types';

	import { onMount } from 'svelte';
	import { toast } from '$lib/ui/sonner';

	import { adminBlogCommentsManagerPagePresenter } from '$lib/area-admin';
	import { getRootPathPublicBlogPost } from '$lib/area-public/constants/getRootPathPublicBlog';
	import { url } from '$lib/utils/path';

	import BlogCommentsTable from '$lib/ui/components/blog-manager/BlogCommentsTable.svelte';

	let showToastMessage = $derived(adminBlogCommentsManagerPagePresenter.showToastMessage);
	let toastMessage = $derived(adminBlogCommentsManagerPagePresenter.toastMessage);

	const isLoading = $derived(adminBlogCommentsManagerPagePresenter.loading);
	const comments = $derived(adminBlogCommentsManagerPagePresenter.commentsToManageVm);
	const hasComments = $derived(comments.length > 0);

	onMount(async () => {
		await adminBlogCommentsManagerPagePresenter.loadComments();
	});

	$effect(() => {
		if (showToastMessage) {
			const msg = toastMessage;
			if (msg && (msg.includes('Error') || msg.includes('Failed'))) {
				toast.error(msg);
			} else {
				toast.success(msg || 'Updated');
			}
			adminBlogCommentsManagerPagePresenter.showToastMessage = false;
		}
	});

	function getPostHref(comment: AdminBlogCommentVm) {
		return url(getRootPathPublicBlogPost(comment.blogPost?.slug ?? comment.postId));
	}

	async function handleApprove(commentId: string) {
		await adminBlogCommentsManagerPagePresenter.handleApproveComment(commentId);
	}

	function handleDeleteSuccess(commentId: string) {
		adminBlogCommentsManagerPagePresenter.removeComment(commentId);
	}
</script>

<div class="p-4 md:p-6">
	<div class="flex items-start justify-between gap-4 flex-wrap">
		<div class="min-w-0">
			<h1 class="text-xl font-semibold text-base-content">
				Comments</h1>
			<p class="text-sm text-base-content/70">
				Moderate blog comments. Super admin only.</p>
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
				<h3 class="text-2xl font-bold tracking-tight text-base-content">
					No comments yet</h3>
				<p class="text-sm text-base-content/70">
					When readers comment on posts, they will appear here.</p>
			</div>
		</div>
	{:else}
		<BlogCommentsTable
			{comments}
			{getPostHref}
			onApprove={handleApprove}
			onDeleteSuccess={handleDeleteSuccess}
		/>
	{/if}
</div>
