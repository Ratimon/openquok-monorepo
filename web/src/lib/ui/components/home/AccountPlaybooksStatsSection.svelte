<script lang="ts">
	import type { OwnedListingStatsProgrammerModel } from '$lib/listings/Listing.repository.svelte';

	import AccountStatsRadialGrid, {
		type AccountStatsRadialItem
	} from '$lib/ui/components/home/AccountStatsRadialGrid.svelte';
	import { numberFormatter } from '$lib/ui/helpers/common';

	type Props = {
		buildingBlockCount: number;
		publishedBuildingBlockCount: number;
		playbookCount: number;
		publishedPlaybookCount: number;
		hubStats: OwnedListingStatsProgrammerModel | null;
		publicPlaybooksHref: string;
		publicBuildingBlocksHref: string;
	};

	let {
		buildingBlockCount,
		publishedBuildingBlockCount,
		playbookCount,
		publishedPlaybookCount,
		hubStats,
		publicPlaybooksHref,
		publicBuildingBlocksHref
	}: Props = $props();

	function formatStatCount(value: number): string {
		return numberFormatter.format(value);
	}

	function libraryUsageLabel(total: number, published: number): string {
		if (total < 1) return 'None created yet';
		if (published < 1) return `${total} in your library`;
		if (published === total) return `${published} published on the hub`;
		return `${published} of ${total} published on the hub`;
	}

	const stats = $derived.by((): AccountStatsRadialItem[] => {
		const totalViews = hubStats?.totalViews ?? 0;
		const totalClicks = hubStats?.totalClicks ?? 0;

		return [
			{
				name: 'Building blocks',
				capacity: 0,
				centerLabel: formatStatCount(buildingBlockCount),
				usageLabel: libraryUsageLabel(buildingBlockCount, publishedBuildingBlockCount)
			},
			{
				name: 'Playbooks',
				capacity: 0,
				centerLabel: formatStatCount(playbookCount),
				usageLabel: libraryUsageLabel(playbookCount, publishedPlaybookCount)
			},
			{
				name: 'Views',
				capacity: 0,
				centerLabel: formatStatCount(totalViews),
				usageLabel: 'On your published hub listings'
			},
			{
				name: 'Clicks',
				capacity: 0,
				centerLabel: formatStatCount(totalClicks),
				usageLabel: 'On your published hub listings'
			}
		];
	});
</script>

<section>
	<h2 class="text-balance text-xl font-medium text-base-content">Catalog overview</h2>
	<p class="text-pretty mt-1 text-sm leading-6 text-base-content/65">
		Track what you have created and how your published
		<a href={publicPlaybooksHref} class="link link-primary font-medium">playbooks</a>
		and
		<a href={publicBuildingBlocksHref} class="link link-primary font-medium">building blocks</a>
		perform on the public hub.
	</p>

	<AccountStatsRadialGrid class="mt-6" items={stats} />
</section>
