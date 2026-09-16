import type { RepeatIntervalKey } from '$lib/posts/Post.repository.svelte';

const REPEAT_INTERVAL_KEY_DAYS: Record<RepeatIntervalKey, number> = {
	day: 1,
	two_days: 2,
	three_days: 3,
	four_days: 4,
	five_days: 5,
	six_days: 6,
	week: 7,
	two_weeks: 14,
	month: 30
};

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

function repeatIntervalDaysFromKey(repeatInterval?: string | null): number {
	const key = String(repeatInterval ?? '').trim() as RepeatIntervalKey;
	return REPEAT_INTERVAL_KEY_DAYS[key] ?? 0;
}

/** Compact inline label for cards and modals (e.g. "Every day", "Every 2 weeks"). */
export function formatRepeatScheduleHighlightLabel(intervalDays: number): string {
	const d = Math.floor(intervalDays);
	if (d <= 0) return '';
	if (d === 1) return 'Every day';
	if (d === 7) return 'Every week';
	if (d === 14) return 'Every 2 weeks';
	if (d === 30) return 'Every month';
	if (d % 7 === 0) {
		const w = d / 7;
		return w === 1 ? 'Every week' : `Every ${w} weeks`;
	}
	if (d % 30 === 0) {
		const m = d / 30;
		return m === 1 ? 'Every month' : `Every ${m} months`;
	}
	return `Every ${d} days`;
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
	const days = resolveRepeatIntervalDays(intervalInDays, repeatInterval);
	if (days > 0) return formatRepeatScheduleLabel(days);
	if (hasRepeatSchedule(intervalInDays, repeatInterval)) return 'Repeating post';
	return null;
}

/** Primary-highlight copy for kanban cards and post actions; null when not repeating. */
export function repeatScheduleHighlightLabel(
	intervalInDays?: number | null,
	repeatInterval?: string | null
): string | null {
	const days = resolveRepeatIntervalDays(intervalInDays, repeatInterval);
	if (days > 0) return formatRepeatScheduleHighlightLabel(days);
	if (hasRepeatSchedule(intervalInDays, repeatInterval)) return 'Repeating';
	return null;
}

function resolveRepeatIntervalDays(
	intervalInDays?: number | null,
	repeatInterval?: string | null
): number {
	const fromDays = parseRepeatIntervalDays(intervalInDays);
	if (fromDays > 0) return fromDays;
	return repeatIntervalDaysFromKey(repeatInterval);
}
