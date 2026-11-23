export type BuildBacklinksHubStatsSource = {
	siteCount: number;
	opportunityCount: number;
	freeOrFreemiumOpportunityCount: number;
	quickWinOpportunityCount: number;
	categoryCount: number;
};

export type BuildBacklinksHubStatsViewModel = {
	sites: number;
	opportunities: number;
	freeOrFreemium: number;
	quickWins: number;
	categories: number;
};

export function toBuildBacklinksHubStatsViewModel(
	source: Omit<BuildBacklinksHubStatsSource, 'categoryCount'> & { categoryCount: number }
): BuildBacklinksHubStatsViewModel {
	return {
		sites: source.siteCount,
		opportunities: source.opportunityCount,
		freeOrFreemium: source.freeOrFreemiumOpportunityCount,
		quickWins: source.quickWinOpportunityCount,
		categories: source.categoryCount
	};
}

function formatCount(value: number): string {
	return value.toLocaleString('en-US');
}

/** SEO hero paragraph for the main build-backlinks hub (counts from published catalog). */
export function formatBuildBacklinksHubHeroDescription(stats: BuildBacklinksHubStatsViewModel): string {
	const sites = formatCount(stats.sites);
	const opportunities = formatCount(stats.opportunities);
	const freeOrFreemium = formatCount(stats.freeOrFreemium);
	const quickWins = formatCount(stats.quickWins);

	return `A maintained backlink directory of ${sites} platforms and ${opportunities} link-building opportunities across launch directories, profiles, guest posts, and communities. ${freeOrFreemium} paths are free or freemium; ${quickWins} are quick wins — free, low effort, and worth doing first. Filter by category, compare dofollow and cost on each card, and bookmark sites to jump back while you work.`;
}
