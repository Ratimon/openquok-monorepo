/** Positive `posts.interval_in_days`, or 0 when not set / invalid. */
export function parseRepeatIntervalDays(intervalInDays?: number | null): number {
	const raw = intervalInDays ?? null;
	const n = typeof raw === 'number' ? raw : raw == null ? Number.NaN : Number(raw);
	return typeof n === 'number' && Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/** True when the row or group has an active repeat cadence. */
export function hasRepeatSchedule(
	intervalInDays?: number | null,
	repeatInterval?: string | null
): boolean {
	if (parseRepeatIntervalDays(intervalInDays) > 0) return true;
	const key = String(repeatInterval ?? '').trim();
	return key.length > 0 && key.toLowerCase() !== 'null';
}

/** Human label for a repeat cadence in days (calendar chip tooltip, kanban, post actions). */
export function formatRepeatScheduleLabel(intervalDays: number): string {
	const d = Math.floor(intervalDays);
	if (d <= 0) return '';
	if (d % 30 === 0) {
		const m = d / 30;
		return `Every ${m} m${m === 1 ? '' : 's'}`;
	}
	if (d % 7 === 0) {
		const w = d / 7;
		return `Repeat every ${w} w${w === 1 ? '' : 's'}`;
	}
	return `Repeat every ${d} d${d === 1 ? '' : 's'}`;
}

/** Tooltip / aria-label for a repeating post; null when not repeating. */
export function repeatScheduleLabel(
	intervalInDays?: number | null,
	repeatInterval?: string | null
): string | null {
	const days = parseRepeatIntervalDays(intervalInDays);
	if (days > 0) return formatRepeatScheduleLabel(days);
	if (hasRepeatSchedule(intervalInDays, repeatInterval)) return 'Repeating post';
	return null;
}
