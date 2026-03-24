<script lang="ts">
	import type { AdminBlogActivityVm } from '$lib/blog/blog.types';

	import { onMount } from 'svelte';

	import { adminBlogActivitiesManagerPagePresenter } from '$lib/area-admin';
	import { getRootPathPublicBlogPost } from '$lib/area-public/constants/getRootPathPublicBlog';
	import { url } from '$lib/utils/path';

	import BlogActivitiesTable from '$lib/ui/components/blog-manager/BlogActivitiesTable.svelte';

	const isLoading = $derived(adminBlogActivitiesManagerPagePresenter.loading);
	const activities = $derived(adminBlogActivitiesManagerPagePresenter.activitiesToManageVm);
	const hasActivities = $derived(activities.length > 0);

	onMount(async () => {
		await adminBlogActivitiesManagerPagePresenter.loadActivities();
	});

	function getPostHref(activity: AdminBlogActivityVm) {
		return url(getRootPathPublicBlogPost(activity.blogPost?.slug ?? activity.postId));
	}
</script>

<div class="p-4 md:p-6">
	<div class="flex items-start justify-between gap-4 flex-wrap">
		<div class="min-w-0">
			<h1 class="text-xl font-semibold text-base-content">
				Activities</h1>
			<p class="text-sm text-base-content/70">
				View blog engagement: views, likes, shares, and comments. Editor or admin.</p>
		</div>
	</div>

	{#if isLoading}
		<div class="mt-6">
			<span class="loading loading-spinner loading-md"></span>
		</div>
	{:else if !hasActivities}
		<div
			class="mt-6 flex min-h-96 flex-1 items-center justify-center rounded-lg border border-dashed border-base-300"
		>
			<div class="flex flex-col items-center gap-1 text-center">
				<h3 class="text-2xl font-bold tracking-tight text-base-content">
					No activities yet</h3>
				<p class="text-sm text-base-content/70">
					When readers interact with posts, events will appear here.</p>
			</div>
		</div>
	{:else}
		<BlogActivitiesTable {activities} {getPostHref} />
	{/if}
</div>
