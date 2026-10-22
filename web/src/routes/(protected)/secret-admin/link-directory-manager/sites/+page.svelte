<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '$lib/ui/sonner';

	import { adminLinkDirectorySitesManagerPagePresenter } from '$lib/area-admin';
	import { getRootPathSecretAdminLinkDirectoryManagerNewSite } from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { url } from '$lib/utils/path';

	import Button from '$lib/ui/buttons/Button.svelte';
	import LinkDirectorySitesTable from '$lib/ui/components/link-directory-manager/LinkDirectorySitesTable.svelte';

	const newSiteHref = url(getRootPathSecretAdminLinkDirectoryManagerNewSite());

	const isLoading = $derived(adminLinkDirectorySitesManagerPagePresenter.loading);
	const isRefreshingDr = $derived(adminLinkDirectorySitesManagerPagePresenter.refreshingCatalogDr);
	const sitesVm = $derived(adminLinkDirectorySitesManagerPagePresenter.allSitesToManageVm);
	const showToastMessage = $derived(adminLinkDirectorySitesManagerPagePresenter.showToastMessage);
	const toastMessage = $derived(adminLinkDirectorySitesManagerPagePresenter.toastMessage);

	onMount(async () => {
		await adminLinkDirectorySitesManagerPagePresenter.loadAllSites();
	});

	$effect(() => {
		if (showToastMessage) {
			const msg = toastMessage;
			if (msg && (msg.includes('Failed') || msg.includes('not configured'))) {
				toast.error(msg);
			} else if (msg) {
				toast.success(msg);
			}
			adminLinkDirectorySitesManagerPagePresenter.showToastMessage = false;
		}
	});
</script>

<div class="p-4 md:p-6">
	<div class="flex items-start justify-between gap-4 flex-wrap">
		<div>
			<h1 class="text-xl font-semibold text-base-content">Sites</h1>
			<p class="text-sm text-base-content/70">Platforms and domains in the build-backlinks directory.</p>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={isLoading || isRefreshingDr}
				onclick={() => void adminLinkDirectorySitesManagerPagePresenter.refreshCatalogDomainRatings()}
			>
				{#if isRefreshingDr}
					<span class="loading loading-spinner loading-xs"></span>
				{/if}
				Refresh catalog DR
			</Button>
			<Button variant="primary" size="sm" href={newSiteHref}>New site</Button>
		</div>
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
