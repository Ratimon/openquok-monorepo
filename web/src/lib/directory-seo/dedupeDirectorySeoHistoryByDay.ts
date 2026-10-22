import type { DirectorySeoHistoryPointDto } from '$lib/directory-seo/directory-seo.types';

/** Calendar day (UTC) from an ISO timestamp. */
function historyDayKey(capturedAt: string): string {
	const trimmed = capturedAt.trim();
	if (trimmed.length >= 10) return trimmed.slice(0, 10);
	return trimmed;
}

/**
 * One sample per calendar day for charting (latest capture wins when multiple rows share a day).
 */
export function dedupeDirectorySeoHistoryByDay(
	points: readonly DirectorySeoHistoryPointDto[]
): DirectorySeoHistoryPointDto[] {
	const sorted = [...points].sort(
		(a, b) => Date.parse(a.capturedAt) - Date.parse(b.capturedAt)
	);
	const byDay = new Map<string, DirectorySeoHistoryPointDto>();
	for (const point of sorted) {
		byDay.set(historyDayKey(point.capturedAt), point);
	}
	return [...byDay.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([, point]) => point);
}
