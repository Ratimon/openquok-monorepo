<script lang="ts">
	import type { AdminListingActivityVm } from '$lib/listings/listing.types';

	import { onMount } from 'svelte';

	import { adminListingActivitiesManagerPagePresenter } from '$lib/area-admin';
	import { getLegacyRootPathPublicBuildingBlock } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
	import { url } from '$lib/utils/path';

	import ListingActivitiesTable from '$lib/ui/components/listing-manager/ListingActivitiesTable.svelte';

	const isLoading = $derived(adminListingActivitiesManagerPagePresenter.loading);
	const activities = $derived(adminListingActivitiesManagerPagePresenter.activitiesToManageVm);
	const hasActivities = $derived(activities.length > 0);

	onMount(async () => {
		await adminListingActivitiesManagerPagePresenter.loadActivities();
	});

	function getListingHref(activity: AdminListingActivityVm) {
		return url(`/${getLegacyRootPathPublicBuildingBlock(activity.listing?.slug ?? activity.listingId)}`);
	}
</script>

<div class="p-4 md:p-6">
	<div class="flex items-start justify-between gap-4 flex-wrap">
		<div class="min-w-0">
			<h1 class="text-xl font-semibold text-base-content">Activities</h1>
			<p class="text-sm text-base-content/70">
				View listing engagement: views, likes, shares, and comments. Editor or admin.
			</p>
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
				<h3 class="text-2xl font-bold tracking-tight text-base-content">No activities yet</h3>
				<p class="text-sm text-base-content/70">When readers interact with listings, events will appear here.</p>
			</div>
		</div>
	{:else}
		<ListingActivitiesTable {activities} getListingHref={getListingHref} />
	{/if}
</div>
