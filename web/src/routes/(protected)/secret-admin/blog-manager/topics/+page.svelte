<script lang="ts">
	import type { BlogTopicViewModel } from '$lib/blog/GetBlog.presenter.svelte';
	import { onMount } from 'svelte';

	import { adminBlogTopicsManagerPagePresenter } from '$lib/area-admin';
	import BlogTopicsTable from '$lib/ui/components/blog-manager/BlogTopicsTable.svelte';
	import BlogTopicUpsertModal from '$lib/ui/components/blog-manager/BlogTopicUpsertModal.svelte';

	const isLoading = $derived(adminBlogTopicsManagerPagePresenter.loading);
	const topicsVm = $derived(adminBlogTopicsManagerPagePresenter.allTopicsToManageVm);
	const hasTopics = $derived(topicsVm.length > 0);

	onMount(async () => {
		await adminBlogTopicsManagerPagePresenter.loadAllTopics();
	});

	function handleTopicCreated(vm: BlogTopicViewModel) {
		adminBlogTopicsManagerPagePresenter.addBlogTopic(vm);
	}

	function handleTopicUpdated(vm: BlogTopicViewModel) {
		adminBlogTopicsManagerPagePresenter.updateBlogTopic(vm);
	}

	function handleTopicDeleted(topic: BlogTopicViewModel) {
		adminBlogTopicsManagerPagePresenter.removeBlogTopic(topic.id);
	}
</script>

<div class="p-4 md:p-6">
	<div class="flex items-start justify-between gap-4 flex-wrap">
		<div class="min-w-0">
			<h1 class="text-xl font-semibold text-base-content">
				Topics</h1>
			<p class="text-sm text-base-content/70">
				Manage blog topic hierarchy. Super admin only.</p>
		</div>
	</div>

	{#if isLoading}
		<div class="mt-6">
			<span class="loading loading-spinner loading-md"></span>
		</div>
	{:else if !hasTopics}
		<div
			class="mt-6 flex min-h-96 flex-1 items-center justify-center rounded-lg border border-dashed border-base-300"
		>
			<div class="flex flex-col items-center gap-1 text-center">
				<h3 class="text-2xl font-bold tracking-tight text-base-content">
					You have no topics</h3>
				<p class="text-sm text-base-content/70">
					Create your first blog topic to get started.</p>

				<div class="mt-4">
					<BlogTopicUpsertModal
						topic={undefined}
						allTopics={topicsVm}
						buttonVariant="primary"
						onTopicCreated={handleTopicCreated}
						onTopicUpdated={handleTopicUpdated}
					/>
				</div>
			</div>
		</div>
	{:else}
		<BlogTopicsTable
			{topicsVm}
			onTopicCreated={handleTopicCreated}
			onTopicUpdated={handleTopicUpdated}
			onTopicDeleted={handleTopicDeleted}
		/>
	{/if}
</div>
