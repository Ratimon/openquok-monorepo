<script lang="ts">
	import { onMount } from 'svelte';

	import { adminLinkDirectorySubmissionsManagerPagePresenter } from '$lib/area-admin';
	import LinkDirectorySubmissionsTable from '$lib/ui/components/link-directory-manager/LinkDirectorySubmissionsTable.svelte';

	const isLoading = $derived(adminLinkDirectorySubmissionsManagerPagePresenter.loading);
	const submissionsVm = $derived(adminLinkDirectorySubmissionsManagerPagePresenter.submissionsVm);

	onMount(async () => {
		await adminLinkDirectorySubmissionsManagerPagePresenter.loadSubmissions();
	});
</script>

<div class="p-4 md:p-6">
	<h1 class="text-xl font-semibold text-base-content">Submissions</h1>
	<p class="text-sm text-base-content/70 mt-1">
		Public suggestions from the build-backlinks hub. Approve or reject — promotion to sites is manual in v1.
	</p>

	{#if isLoading}
		<div class="mt-6"><span class="loading loading-spinner loading-md"></span></div>
	{:else if submissionsVm.length === 0}
		<p class="mt-6 text-sm text-base-content/70">No submissions in the queue.</p>
	{:else}
		<LinkDirectorySubmissionsTable
			{submissionsVm}
			onReviewed={(id, status) =>
				adminLinkDirectorySubmissionsManagerPagePresenter.updateSubmissionStatus(id, status)}
		/>
	{/if}
</div>
