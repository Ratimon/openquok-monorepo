<script lang="ts">
	import type { AdminLinkDirectorySiteCommentVm } from '$lib/link-directory/link-directory-admin.types';

	import { onMount } from 'svelte';
	import { toast } from '$lib/ui/sonner';

	import { adminLinkDirectorySiteCommentsManagerPagePresenter } from '$lib/area-admin';
	import { getRootPathPublicBuildBacklinksSite } from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
	import {
		getRootPathSecretAdminLinkDirectoryManagerSiteEditor
	} from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { route, url } from '$lib/utils/path';

	import LinkDirectorySiteCommentsTable from '$lib/ui/components/link-directory-manager/LinkDirectorySiteCommentsTable.svelte';

	let showToastMessage = $derived(adminLinkDirectorySiteCommentsManagerPagePresenter.showToastMessage);
	let toastMessage = $derived(adminLinkDirectorySiteCommentsManagerPagePresenter.toastMessage);

	const isLoading = $derived(adminLinkDirectorySiteCommentsManagerPagePresenter.loading);
	const comments = $derived(adminLinkDirectorySiteCommentsManagerPagePresenter.commentsToManageVm);
	const hasComments = $derived(comments.length > 0);

	onMount(async () => {
		await adminLinkDirectorySiteCommentsManagerPagePresenter.loadComments();
	});

	$effect(() => {
		if (showToastMessage) {
			const msg = toastMessage;
			if (msg && (msg.includes('Error') || msg.includes('Failed'))) {
				toast.error(msg);
			} else {
				toast.success(msg || 'Updated');
			}
			adminLinkDirectorySiteCommentsManagerPagePresenter.showToastMessage = false;
		}
	});

	function getPublicSiteHref(comment: AdminLinkDirectorySiteCommentVm) {
		const slug = comment.site?.slug ?? '';
		return url(route(getRootPathPublicBuildBacklinksSite(slug)));
	}

	function getAdminSiteEditorHref(comment: AdminLinkDirectorySiteCommentVm) {
		const siteId = comment.site?.id ?? comment.siteId;
		return url(getRootPathSecretAdminLinkDirectoryManagerSiteEditor(siteId));
	}

	async function handleApprove(commentId: string) {
		await adminLinkDirectorySiteCommentsManagerPagePresenter.handleApproveComment(commentId);
	}

	function handleDeleteSuccess(commentId: string) {
		adminLinkDirectorySiteCommentsManagerPagePresenter.removeComment(commentId);
	}
</script>

<div class="p-4 md:p-6">
	<div class="flex items-start justify-between gap-4 flex-wrap">
		<div class="min-w-0">
			<h1 class="text-xl font-semibold text-base-content">Comments</h1>
			<p class="text-sm text-base-content/70">
				Moderate comments on published build-backlinks site guides. Platform admin only.
			</p>
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
				<p class="text-sm text-base-content/70">
					When readers comment on site guides, they will appear here.
				</p>
			</div>
		</div>
	{:else}
		<LinkDirectorySiteCommentsTable
			{comments}
			getPublicSiteHref={getPublicSiteHref}
			getAdminSiteEditorHref={getAdminSiteEditorHref}
			onApprove={handleApprove}
			onDeleteSuccess={handleDeleteSuccess}
		/>
	{/if}
</div>
