<script lang="ts">
	import type { BlogPostTableItem } from '$lib/ui/components/blog-manager/BlogPostsTable.svelte';

	// core
	import { onMount } from 'svelte';
	import toast from 'svelte-hot-french-toast';

	// adminBlogPostsManagerPagePresenters
	import { adminBlogPostsManagerPagePresenter } from '$lib/area-admin';

	// routing
	import {
		getRootPathSecretAdminBlogManagerNewPost,
		getRootPathSecretAdminBlogManagerPostEditor
	} from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { url } from '$lib/utils/path';

	import Button from '$lib/ui/buttons/Button.svelte';
	import BlogHeroImageManualRemovalModal from '$lib/ui/components/blog-manager/BlogHeroImageManualRemovalModal.svelte';
	import BlogPostsTable from '$lib/ui/components/blog-manager/BlogPostsTable.svelte';

	const newPostHref = url(getRootPathSecretAdminBlogManagerNewPost());

	const isLoading = $derived(adminBlogPostsManagerPagePresenter.loading);
	const posts = $derived(adminBlogPostsManagerPagePresenter.allPostsToManageVm);
	const hasPosts = $derived(posts.length > 0);

	onMount(async () => {
		await adminBlogPostsManagerPagePresenter.loadAllPosts();
	});

	const getEditHref = (post: BlogPostTableItem) =>
		url(getRootPathSecretAdminBlogManagerPostEditor(post.id));

	const tablePosts: BlogPostTableItem[] = $derived(
		posts.map((p) => ({
			id: p.id,
			title: p.title,
			description: p.description,
			createdAt: p.createdAt,
			isUserPublished: p.isUserPublished,
			isAdminApproved: p.isAdminApproved,
			heroImageFilename: p.heroImageFilename,
			content: p.content
		}))
	);

	let manualStorageRemovalModalOpen = $state(false);
	let manualStorageRemovalFailedPaths = $state<string[]>([]);

	async function handlePostDeleted(post: BlogPostTableItem) {
		const resultVm = await adminBlogPostsManagerPagePresenter.removeBlogPostAndCleanupStorage(post);
		if (resultVm.kind === 'ok' && resultVm.deletedCount > 0) {
			toast.success(
				resultVm.deletedCount === 1
					? 'Removed 1 image file from storage.'
					: `Removed ${resultVm.deletedCount} image files from storage.`
			);
		} else if (resultVm.kind === 'failed') {
			if (resultVm.deletedCount > 0) {
				toast.success(
					resultVm.deletedCount === 1
						? 'Removed 1 image file from storage.'
						: `Removed ${resultVm.deletedCount} image files from storage.`
				);
			}
			toast.error('Some image file(s) could not be removed from storage.');
			manualStorageRemovalFailedPaths = resultVm.failedPaths;
			manualStorageRemovalModalOpen = true;
		}
	}
</script>

<div class="p-4 md:p-6">
	<div class="flex items-start justify-between gap-4 flex-wrap">
		<div class="min-w-0">
			<h1 class="text-xl font-semibold text-base-content">
				Posts</h1>
			<p class="text-sm text-base-content/70">
				Manage blog posts. Super admin only.</p>
		</div>

		<div class="flex items-center gap-2">
			<Button variant="primary" size="sm" href={newPostHref}>New post</Button>
		</div>
	</div>

	{#if isLoading}
		<div class="mt-6">
			<span class="loading loading-spinner loading-md"></span>
		</div>
	{:else if !hasPosts}
		<div
			class="mt-6 flex min-h-96 flex-1 items-center justify-center rounded-lg border border-dashed border-base-300"
		>
			<div class="flex flex-col items-center gap-1 text-center">
				<h3 class="text-2xl font-bold tracking-tight text-base-content">
					You have no posts</h3>
				<p class="text-sm text-base-content/70">
					Create your first blog post to get started.</p>
				<Button variant="primary" size="sm" href={newPostHref} class="mt-4">Add post</Button>
			</div>
		</div>
	{:else}
		<BlogPostsTable posts={tablePosts} {getEditHref} onPostDeleted={handlePostDeleted} />
	{/if}
</div>

<BlogHeroImageManualRemovalModal
	bind:open={manualStorageRemovalModalOpen}
	bind:failedPaths={manualStorageRemovalFailedPaths}
/>
