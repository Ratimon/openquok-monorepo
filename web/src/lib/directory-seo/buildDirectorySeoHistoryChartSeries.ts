import type {
	DirectorySeoCompetitorDto,
	DirectorySeoDomainMetricDto,
	DirectorySeoHistoryPointDto,
	DirectorySeoWorkspaceHistoryDto
} from '$lib/directory-seo/directory-seo.types';
import { historyChartDayKey } from '$lib/directory-seo/buildDirectorySeoLineChartRows';
import { dedupeDirectorySeoHistoryByDay } from '$lib/directory-seo/dedupeDirectorySeoHistoryByDay';
import { directorySeoChartColorAt } from '$lib/directory-seo/directorySeoChartColors';
import { normalizeDirectorySeoDomainKey } from '$lib/directory-seo/normalizeDirectorySeoDomainKey';

export type DirectorySeoHistoryChartSeriesViewModel = {
	key: string;
	label: string;
	points: DirectorySeoHistoryPointDto[];
	color: string;
};

function competitorHistoryPoints(
	history: DirectorySeoWorkspaceHistoryDto,
	domain: string
): DirectorySeoHistoryPointDto[] {
	const key = normalizeDirectorySeoDomainKey(domain);
	return (
		history.competitors.find((row) => normalizeDirectorySeoDomainKey(row.domain) === key)?.points ??
		[]
	);
}

function productHistoryAnchorDays(history: DirectorySeoWorkspaceHistoryDto): string[] {
	return dedupeDirectorySeoHistoryByDay(history.product).map((point) =>
		historyChartDayKey(point.capturedAt)
	);
}

function competitorChartPoints(
	competitor: DirectorySeoCompetitorDto,
	history: DirectorySeoWorkspaceHistoryDto
): DirectorySeoHistoryPointDto[] {
	const fromHistory = competitorHistoryPoints(history, competitor.domain);
	if (fromHistory.length > 0) return fromHistory;

	const rating = competitor.domainRating;
	if (rating == null || !Number.isFinite(rating)) return [];

	const anchorDays = productHistoryAnchorDays(history);
	if (anchorDays.length > 0) {
		return anchorDays.map((day) => ({
			capturedAt: `${day}T12:00:00.000Z`,
			domainRating: rating
		}));
	}

	const capturedAt = competitor.checkedAt ?? new Date().toISOString();
	return [{ capturedAt, domainRating: rating }];
}

export function buildDirectorySeoHistoryChartSeries(params: {
	productDomain: DirectorySeoDomainMetricDto | null;
	history: DirectorySeoWorkspaceHistoryDto;
	competitors: readonly DirectorySeoCompetitorDto[];
	selectedCompetitorDomains: ReadonlySet<string>;
}): DirectorySeoHistoryChartSeriesViewModel[] {
	const { productDomain, history, competitors, selectedCompetitorDomains } = params;
	const lines: DirectorySeoHistoryChartSeriesViewModel[] = [];

	const productLabel = productDomain?.domain
		? `Your site (${productDomain.domain})`
		: 'Your site';
	lines.push({
		key: 'line-0',
		label: productLabel,
		points: history.product,
		color: directorySeoChartColorAt(0)
	});

	let lineIndex = 1;
	let colorIndex = 1;
	for (const competitor of competitors) {
		if (!selectedCompetitorDomains.has(competitor.domain)) continue;
		const label = competitor.label?.trim() || competitor.domain;
		lines.push({
			key: `line-${lineIndex}`,
			label,
			points: competitorChartPoints(competitor, history),
			color: directorySeoChartColorAt(colorIndex)
		});
		lineIndex += 1;
		colorIndex += 1;
	}

	return lines;
}
