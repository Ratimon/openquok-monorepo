export type BuildBacklinksSiteSidebarMetricRow = { label: string; value: string };

export function buildBuildBacklinksSiteDetailSidebarMetrics(
	site: {
		views: number;
		bookmarkCount: number;
		averageRating: number;
		ratingsCount: number;
	},
	displayLikes: number
): BuildBacklinksSiteSidebarMetricRow[] {
	return [
		{ label: 'Views', value: site.views.toLocaleString() },
		{ label: 'Likes', value: displayLikes.toLocaleString() },
		{ label: 'Bookmarks', value: site.bookmarkCount.toLocaleString() },
		{
			label: 'Rating',
			value: `${site.averageRating.toFixed(1)} (${site.ratingsCount.toLocaleString()})`
		}
	];
}
