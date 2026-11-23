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
	const views = Number(site.views) || 0;
	const likes = Number(displayLikes) || 0;
	const bookmarks = Number(site.bookmarkCount) || 0;
	const rating = Number(site.averageRating) || 0;
	const ratingsCount = Number(site.ratingsCount) || 0;

	return [
		{ label: 'Views', value: views.toLocaleString() },
		{ label: 'Likes', value: likes.toLocaleString() },
		{ label: 'Bookmarks', value: bookmarks.toLocaleString() },
		{
			label: 'Rating',
			value: `${rating.toFixed(1)} (${ratingsCount.toLocaleString()})`
		}
	];
}
