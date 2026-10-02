<script lang="ts">
	import { onMount } from 'svelte';

	import { adminLinkDirectorySitesManagerPagePresenter } from '$lib/area-admin';
	import { getRootPathSecretAdminLinkDirectoryManagerNewSite } from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { url } from '$lib/utils/path';

	import Button from '$lib/ui/buttons/Button.svelte';
	import LinkDirectorySitesTable from '$lib/ui/components/link-directory-manager/LinkDirectorySitesTable.svelte';

	const newSiteHref = url(getRootPathSecretAdminLinkDirectoryManagerNewSite());

	const isLoading = $derived(adminLinkDirectorySitesManagerPagePresenter.loading);
	const sitesVm = $derived(adminLinkDirectorySitesManagerPagePresenter.allSitesToManageVm);

	onMount(async () => {
		await adminLinkDirectorySitesManagerPagePresenter.loadAllSites();
	});
</script>

<div class="p-4 md:p-6">
	<div class="flex items-start justify-between gap-4 flex-wrap">
		<div>
			<h1 class="text-xl font-semibold text-base-content">Sites</h1>
			<p class="text-sm text-base-content/70">Platforms and domains in the build-backlinks directory.</p>
		</div>
		<Button variant="primary" size="sm" href={newSiteHref}>New site</Button>
	</div>

	{#if isLoading}
		<div class="mt-6"><span class="loading loading-spinner loading-md"></span></div>
	{:else}
		<LinkDirectorySitesTable
			{sitesVm}
			onSiteDeleted={(id) => adminLinkDirectorySitesManagerPagePresenter.removeSite(id)}
		/>
	{/if}
</div>
