import type { DirectorySeoHistoryChartSeriesViewModel } from '$lib/directory-seo/buildDirectorySeoHistoryChartSeries';
import { directorySeoChartColorAt } from '$lib/directory-seo/directorySeoChartColors';

function isoDaysAgo(daysAgo: number): string {
	const date = new Date();
	date.setUTCDate(date.getUTCDate() - daysAgo);
	date.setUTCHours(12, 0, 0, 0);
	return date.toISOString();
}

/** Illustrative DR trend for marketing bentos (not live data). */
export const LANDING_DIRECTORY_ANALYTICS_MOCK_SERIES: DirectorySeoHistoryChartSeriesViewModel[] = [
	{
		key: 'product',
		label: 'yourproduct.com',
		color: directorySeoChartColorAt(0),
		points: [
			{ capturedAt: isoDaysAgo(28), domainRating: 2 },
			{ capturedAt: isoDaysAgo(24), domainRating: 4 },
			{ capturedAt: isoDaysAgo(20), domainRating: 6 },
			{ capturedAt: isoDaysAgo(14), domainRating: 9 },
			{ capturedAt: isoDaysAgo(7), domainRating: 12 },
			{ capturedAt: isoDaysAgo(0), domainRating: 14 }
		]
	}
];

export type LandingDirectoryAnalyticsMockCompetitor = {
	domain: string;
	label: string;
	domainRating: number;
	delta30Days: number;
};

export const LANDING_DIRECTORY_ANALYTICS_MOCK_COMPETITORS: LandingDirectoryAnalyticsMockCompetitor[] =
	[
		{ domain: 'rivalapp.io', label: 'Rival app', domainRating: 22, delta30Days: 3 },
		{ domain: 'launchpad.tools', label: 'Launchpad', domainRating: 18, delta30Days: 1 }
	];

export const LANDING_DIRECTORY_ANALYTICS_MOCK_PRODUCT = {
	domain: 'yourproduct.com',
	domainRating: 14,
	delta30Days: 12
};
