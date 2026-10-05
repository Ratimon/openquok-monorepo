export type CreatorListingSidebarMetricRow = { label: string; value: string };

export function buildExtensionSidebarMetrics(
	extensionVm: {
		views: number;
		bookmarkCount: number;
		averageRating: number;
		ratingsCount: number;
	},
	displayLikes: number
): CreatorListingSidebarMetricRow[] {
	return [
		{ label: 'Views', value: extensionVm.views.toLocaleString() },
		{ label: 'Likes', value: displayLikes.toLocaleString() },
		{ label: 'Bookmarks', value: extensionVm.bookmarkCount.toLocaleString() },
		{
			label: 'Rating',
			value: `${extensionVm.averageRating.toFixed(1)} (${extensionVm.ratingsCount.toLocaleString()})`
		}
	];
}

export function buildPlaybookSidebarMetrics(
	playbookVm: {
		views: number;
		averageRating: number;
		ratingsCount: number;
		stackMembers: Array<{ member: unknown | null }>;
	},
	displayLikes: number
): CreatorListingSidebarMetricRow[] {
	const rows: CreatorListingSidebarMetricRow[] = [
		{ label: 'Views', value: playbookVm.views.toLocaleString() },
		{ label: 'Likes', value: displayLikes.toLocaleString() },
		{
			label: 'Rating',
			value: `${playbookVm.averageRating.toFixed(1)} (${playbookVm.ratingsCount.toLocaleString()})`
		}
	];

	const buildingBlockCount = playbookVm.stackMembers.filter((member) => member.member != null).length;
	if (buildingBlockCount > 0) {
		rows.push({
			label: 'Building blocks',
			value: buildingBlockCount.toLocaleString()
		});
	}

	return rows;
}
