import type { CalendarPostRowViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

function addUtcDays(iso: string, days: number): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	d.setUTCDate(d.getUTCDate() + days);
	return d.toISOString();
}

function publishMs(iso: string): number {
	const ms = Date.parse(iso);
	return Number.isFinite(ms) ? ms : Number.NaN;
}

function occurrenceKey(id: string, publishDate: string): string {
	return `${id}@${publishDate}`;
}

function isExpandableRecurringAnchor(row: CalendarPostRowViewModel): boolean {
	const interval = row.intervalInDays;
	if (interval == null || interval <= 0) return false;
	const state = String(row.state ?? '').trim().toUpperCase();
	return state === 'DRAFT' || state === 'QUEUE';
}

/** Series anchor before a reschedule (virtual copies carry `seriesAnchorPublishDate`). */
export function resolveRecurringAnchorPublishDate(
	rows: readonly CalendarPostRowViewModel[]
): string | null {
	for (const row of rows) {
		const anchor = String(row.seriesAnchorPublishDate ?? '').trim();
		if (anchor) return anchor;
	}

	const publishDates = rows
		.map((row) => String(row.publishDate ?? '').trim())
		.filter((iso) => iso.length > 0 && Number.isFinite(publishMs(iso)));
	if (publishDates.length === 0) return null;

	return publishDates.reduce((earliest, iso) =>
		publishMs(iso) < publishMs(earliest) ? iso : earliest
	);
}

/** One anchor row per post id (multi-channel groups) at the new anchor slot. */
export function collapseRecurringGroupToAnchorRows(
	rows: readonly CalendarPostRowViewModel[],
	newAnchorIso: string
): CalendarPostRowViewModel[] {
	const byId = new Map<string, CalendarPostRowViewModel>();
	for (const row of rows) {
		const id = String(row.id ?? '').trim();
		if (!id || byId.has(id)) continue;
		byId.set(id, {
			...row,
			publishDate: newAnchorIso,
			seriesAnchorPublishDate: null
		});
	}
	return [...byId.values()];
}

/** Mirrors backend `expandRecurringPostsForCalendarRange` for calendar row VMs. */
export function expandRecurringCalendarRowsForRange(
	rows: readonly CalendarPostRowViewModel[],
	startIso: string,
	endIso: string
): CalendarPostRowViewModel[] {
	const startMs = publishMs(startIso);
	const endMs = publishMs(endIso);
	const seen = new Set<string>();
	const result: CalendarPostRowViewModel[] = [];

	for (const row of rows) {
		if (!isExpandableRecurringAnchor(row)) {
			const key = occurrenceKey(row.id, row.publishDate);
			if (seen.has(key)) continue;
			seen.add(key);
			result.push(row);
			continue;
		}

		const anchorDate = row.publishDate;
		const interval = row.intervalInDays!;
		let cursor = anchorDate;
		let cursorMs = publishMs(cursor);

		if (Number.isNaN(cursorMs)) {
			const key = occurrenceKey(row.id, row.publishDate);
			if (!seen.has(key)) {
				seen.add(key);
				result.push(row);
			}
			continue;
		}

		while (cursorMs < startMs) {
			cursor = addUtcDays(cursor, interval);
			cursorMs = publishMs(cursor);
			if (Number.isNaN(cursorMs)) break;
		}

		while (cursorMs <= endMs) {
			const key = occurrenceKey(row.id, cursor);
			if (!seen.has(key)) {
				seen.add(key);
				const isVirtual = cursor !== anchorDate;
				result.push({
					...row,
					publishDate: cursor,
					...(isVirtual ? { seriesAnchorPublishDate: anchorDate } : { seriesAnchorPublishDate: null })
				});
			}
			cursor = addUtcDays(cursor, interval);
			cursorMs = publishMs(cursor);
			if (Number.isNaN(cursorMs)) break;
		}
	}

	result.sort((a, b) => a.publishDate.localeCompare(b.publishDate));
	return result;
}

/**
 * Optimistic recurring reschedule: move the anchor to `newAnchorIso`, then re-expand
 * virtual copies for the visible calendar range (matches server list expansion).
 */
export function buildOptimisticRecurringCalendarRows(
	prevRows: readonly CalendarPostRowViewModel[],
	newAnchorIso: string,
	rangeStartDate: string,
	rangeEndDate: string
): CalendarPostRowViewModel[] {
	if (!prevRows.length || !newAnchorIso.trim() || !rangeStartDate || !rangeEndDate) {
		return [];
	}

	const startIso = new Date(`${rangeStartDate}T00:00:00.000Z`).toISOString();
	const endIso = new Date(`${rangeEndDate}T23:59:59.999Z`).toISOString();
	const anchorRows = collapseRecurringGroupToAnchorRows(prevRows, newAnchorIso);
	return expandRecurringCalendarRowsForRange(anchorRows, startIso, endIso);
}
