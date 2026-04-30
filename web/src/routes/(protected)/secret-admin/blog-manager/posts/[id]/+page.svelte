<script lang="ts">
	import type { PageData } from './$types';

	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getRootPathSecretAdminBlogManager } from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { url } from '$lib/utils/path';

	import { toast } from '$lib/ui/sonner';
	import { adminBlogEditorPagePresenter } from '$lib/area-admin';
	import { createSortedTopicChoices } from '$lib/blogs';
	import EditorBlog from '$lib/ui/templates/EditorBlog.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();
	let isSuperAdmin = $derived(data.isSuperAdmin ?? false);
	let userId = $derived(page.data.currentUser?.id ?? '');

	let initialized = $state(false);
	let postFound = $state(true);

	const topicChoices = $derived(createSortedTopicChoices(adminBlogEditorPagePresenter.topicChoices));
	const formDefaults = $derived(adminBlogEditorPagePresenter.getFormDefaults());
	const slugDisplay = $derived(adminBlogEditorPagePresenter.blogPost?.slug ?? '');

	onMount(async () => {
		const id = data.postId;
		if (!id) {
			postFound = false;
			initialized = true;
			return;
		}
		const { postFound: found } = await adminBlogEditorPagePresenter.init(id);
		postFound = found !== false;
		initialized = true;
	});

	$effect(() => {
		if (adminBlogEditorPagePresenter.showToastMessage) {
			const msg = adminBlogEditorPagePresenter.toastMessage;
			if (msg && (msg.includes('error') || msg.includes('Error') || msg.includes('Failed'))) {
				toast.error(msg);
			} else {
				toast.success(msg || 'Saved.');
			}
			adminBlogEditorPagePresenter.showToastMessage = false;
		}
	});

	$effect(() => {
		if (!adminBlogEditorPagePresenter.showStorageInlineToast) return;
		const msg = adminBlogEditorPagePresenter.storageInlineToastMessage;
		if (adminBlogEditorPagePresenter.storageInlineToastIsError) {
			toast.error(msg);
		} else {
			toast.success(msg);
		}
		adminBlogEditorPagePresenter.showStorageInlineToast = false;
	});

	$effect(() => {
		if (adminBlogEditorPagePresenter.redirectToManager) {
			adminBlogEditorPagePresenter.redirectToManager = false;
			goto(url(getRootPathSecretAdminBlogManager()), { replaceState: true });
		}
	});

	async function handleSave(formData: Parameters<typeof adminBlogEditorPagePresenter.submit>[0]) {
		await adminBlogEditorPagePresenter.submit(formData);
	}

	function handleDiscard() {
		goto(url(getRootPathSecretAdminBlogManager()), { replaceState: true });
	}
</script>

<div class="p-4 md:p-6">
	<div class="mb-6">
		<h1 class="text-xl font-semibold text-base-content">
			Edit blog post</h1>
		<p class="text-sm text-base-content/70">
			Update the post below.</p>
	</div>

	{#if !initialized}
		<div class="flex items-center justify-center py-12">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else}
		{#key formDefaults.id ?? data.postId ?? 'loading'}
			<EditorBlog
				initialValues={formDefaults}
				topicChoices={topicChoices}
				userId={userId}
				isSuperAdmin={isSuperAdmin}
				isSubmitting={adminBlogEditorPagePresenter.submitting}
				slugDisplay={slugDisplay}
				noPostFound={!postFound}
				onSave={handleSave}
				onDiscard={handleDiscard}
			/>
		{/key}
	{/if}
</div>
