import type { DirectorySeoHistoryPointDto } from '$lib/directory-seo/directory-seo.types';
import { dedupeDirectorySeoHistoryByDay } from '$lib/directory-seo/dedupeDirectorySeoHistoryByDay';

export type DirectorySeoLineChartSeriesInput = {
	key: string;
	points: readonly DirectorySeoHistoryPointDto[];
};

/** Calendar day (UTC) from an ISO timestamp — matches dedupe helper. */
export function historyChartDayKey(capturedAt: string): string {
	const trimmed = capturedAt.trim();
	if (trimmed.length >= 10) return trimmed.slice(0, 10);
	return trimmed;
}

export function historyChartDayToDate(dayKey: string): Date {
	const [year, month, day] = dayKey.split('-').map((part) => Number(part));
	return new Date(year, month - 1, day);
}

/**
 * Wide-format rows for layerchart: one row per calendar day, one numeric column per series key.
 */
export function buildDirectorySeoLineChartRows(
	series: readonly DirectorySeoLineChartSeriesInput[]
): Record<string, Date | number>[] {
	if (series.length === 0) return [];

	const valueBySeriesAndDay = new Map<string, Map<string, number>>();
	const allDays = new Set<string>();

	for (const line of series) {
		const byDay = new Map<string, number>();
		for (const point of dedupeDirectorySeoHistoryByDay(line.points)) {
			if (point.domainRating == null || !Number.isFinite(point.domainRating)) continue;
			const day = historyChartDayKey(point.capturedAt);
			byDay.set(day, Math.round(point.domainRating));
			allDays.add(day);
		}
		valueBySeriesAndDay.set(line.key, byDay);
	}

	const sortedDays = [...allDays].sort();
	return sortedDays.map((day) => {
		const row: Record<string, Date | number> = {
			date: historyChartDayToDate(day)
		};
		for (const line of series) {
			const value = valueBySeriesAndDay.get(line.key)?.get(day);
			if (value !== undefined) {
				row[line.key] = value;
			}
		}
		return row;
	});
}
