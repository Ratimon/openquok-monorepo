<script lang="ts">
	import type { PageData } from './$types';

	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getRootPathSecretAdminBlogManager } from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { url } from '$lib/utils/path';

	import { toast } from '$lib/ui/sonner';
	import { adminBlogNewPostPagePresenter } from '$lib/area-admin';
	import { createSortedTopicChoices } from '$lib/blogs';
	import EditorBlog from '$lib/ui/templates/EditorBlog.svelte';

	// /secret-admin/blog-manager
	const rootPathSecretAdminBlogManager = getRootPathSecretAdminBlogManager();
	const secretAdminBlogManagerHref = url(rootPathSecretAdminBlogManager);

	type Props = { data: PageData };

	let { data }: Props = $props();
	let isSuperAdmin = $derived(data.isSuperAdmin ?? false);
	let userId = $derived(page.data.currentUser?.id ?? '');

	let initialized = $state(false);

	const topicChoices = $derived(createSortedTopicChoices(adminBlogNewPostPagePresenter.topicChoices));
	const formDefaults = $derived(adminBlogNewPostPagePresenter.getFormDefaults());
	const slugDisplay = $derived(adminBlogNewPostPagePresenter.blogPost?.slug ?? '');

	onMount(async () => {
		await adminBlogNewPostPagePresenter.init(undefined);
		initialized = true;
	});

	$effect(() => {
		if (adminBlogNewPostPagePresenter.showToastMessage) {
			const msg = adminBlogNewPostPagePresenter.toastMessage;
			if (msg && (msg.includes('error') || msg.includes('Error') || msg.includes('Failed'))) {
				toast.error(msg);
			} else {
				toast.success(msg || 'Saved.');
			}
			adminBlogNewPostPagePresenter.showToastMessage = false;
		}
	});

	$effect(() => {
		if (!adminBlogNewPostPagePresenter.showStorageInlineToast) return;
		const msg = adminBlogNewPostPagePresenter.storageInlineToastMessage;
		if (adminBlogNewPostPagePresenter.storageInlineToastIsError) {
			toast.error(msg);
		} else {
			toast.success(msg);
		}
		adminBlogNewPostPagePresenter.showStorageInlineToast = false;
	});

	$effect(() => {
		if (adminBlogNewPostPagePresenter.redirectToManager) {
			adminBlogNewPostPagePresenter.redirectToManager = false;
			goto(secretAdminBlogManagerHref, { replaceState: true });
		}
	});

	async function handleSave(formData: Parameters<typeof adminBlogNewPostPagePresenter.submit>[0]) {
		await adminBlogNewPostPagePresenter.submit(formData);
	}

	function handleDiscard() {
		goto(secretAdminBlogManagerHref, { replaceState: true });
	}
</script>

<!-- Mirrors template AdminBlogEditorPage (title + description) + BlogEditor; blog layout sidebar is SidebarSecondary in +layout.svelte -->
<div class="p-4 md:p-6">
	<div class="mb-6">
		<h1 class="text-xl font-semibold text-base-content">
			New blog post</h1>
		<p class="text-sm text-base-content/70">
			Create a new blog post. Fill out the form below and save when you are ready.
		</p>
	</div>

	{#if !initialized}
		<div class="flex items-center justify-center py-12">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else}
		{#key 'new'}
			<EditorBlog
				initialValues={formDefaults}
				topicChoices={topicChoices}
				userId={userId}
				isSuperAdmin={isSuperAdmin}
				isSubmitting={adminBlogNewPostPagePresenter.submitting}
				slugDisplay={slugDisplay}
				noPostFound={false}
				onSave={handleSave}
				onDiscard={handleDiscard}
			/>
		{/key}
	{/if}
</div>
