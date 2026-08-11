import dayjs, { type ConfigType } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/** Configured `dayjs` for posting UI (UTC + IANA timezone plugins). Prefer this over importing `dayjs` directly. */
export function newDayjs(config?: ConfigType) {
	return dayjs(config);
}

/** Persists IANA zone for posting schedules (Time table slots, etc.). */
export const TIMEZONE_STORAGE_KEY = 'timezone' as const;

/** `US` = 12-hour (AM/PM) preference; `GLOBAL` = 24-hour. */
export const DATE_METRIC_STORAGE_KEY = 'isUS' as const;

function intlTimeZoneIds(): string[] {
	try {
		const fn = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf;
		if (typeof fn === 'function') return fn('timeZone');
	} catch {
		/* ignore */
	}
	return [];
}

/** Sorted IANA ids for UI pickers; falls back to a single guessed zone when `Intl` is unavailable. */
export function formatTimeZoneUtcOffsetLabel(timeZone: string, at?: ConfigType): string {
	const trimmed = timeZone.trim();
	if (!trimmed) return 'UTC';
	try {
		const d = newDayjs(at).tz(trimmed);
		if (!d.isValid()) throw new Error('invalid zone');
		const offsetMin = d.utcOffset();
		const sign = offsetMin >= 0 ? '+' : '-';
		const abs = Math.abs(offsetMin);
		const hours = Math.floor(abs / 60);
		const mins = abs % 60;
		const offset =
			mins === 0
				? `UTC${sign}${hours}`
				: `UTC${sign}${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
		const friendly = trimmed.replace(/_/g, ' ');
		return `${offset} — ${friendly}`;
	} catch {
		return trimmed.replace(/_/g, ' ');
	}
}

function timeZoneUtcOffsetMinutes(timeZone: string, at?: ConfigType): number {
	try {
		return newDayjs(at).tz(timeZone).utcOffset();
	} catch {
		return 0;
	}
}

export function getTimeZoneSelectOptions(at?: ConfigType): { value: string; label: string }[] {
	const ids = intlTimeZoneIds();
	const list = ids.length > 0 ? ids : [dayjs.tz.guess() || 'UTC'];
	const unique = [...new Set(list)];
	return unique
		.map((value) => ({
			value,
			label: formatTimeZoneUtcOffsetLabel(value, at),
			offset: timeZoneUtcOffsetMinutes(value, at)
		}))
		.sort((a, b) => a.offset - b.offset || a.value.localeCompare(b.value, 'en'))
		.map(({ value, label }) => ({ value, label }));
}

/** Ensures `current` appears in the list (e.g. legacy or manually typed IANA ids). */
export function getTimeZoneSelectOptionsIncluding(
	current: string,
	at?: ConfigType
): { value: string; label: string }[] {
	const trimmed = current.trim();
	const base = getTimeZoneSelectOptions(at);
	if (!trimmed || base.some((o) => o.value === trimmed)) return base;
	return [
		{ value: trimmed, label: formatTimeZoneUtcOffsetLabel(trimmed, at) },
		...base
	].sort(
		(a, b) =>
			timeZoneUtcOffsetMinutes(a.value, at) - timeZoneUtcOffsetMinutes(b.value, at) ||
			a.label.localeCompare(b.label, 'en')
	);
}

/** Same key as {@link TIMEZONE_STORAGE_KEY}; used by posting time UI. */
export function getPostingScheduleTimezone(): string {
	if (typeof window === 'undefined') return 'UTC';
	try {
		return window.localStorage.getItem(TIMEZONE_STORAGE_KEY) || dayjs.tz.guess() || 'UTC';
	} catch {
		return dayjs.tz.guess() || 'UTC';
	}
}

export function setPostingScheduleTimezone(tz: string): void {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(TIMEZONE_STORAGE_KEY, tz);
		dayjs.tz.setDefault(tz);
	} catch {
		/* ignore quota / private mode */
	}
}

/** `true` after the user has chosen a zone in Date metrics (stored under {@link TIMEZONE_STORAGE_KEY}). */
export function hasUserSetPostingScheduleTimezone(): boolean {
	if (typeof window === 'undefined') return false;
	try {
		return window.localStorage.getItem(TIMEZONE_STORAGE_KEY) != null;
	} catch {
		return false;
	}
}

/** Apply `localStorage` zone to `dayjs.tz.setDefault` (e.g. after load). */
export function applyPostingScheduleTimezoneDefaultFromStorage(): void {
	if (typeof window === 'undefined') return;
	try {
		dayjs.tz.setDefault(getPostingScheduleTimezone());
	} catch {
		/* invalid zone string */
	}
}

/** `true` = prefer 12-hour clock labels where relevant; initial guess from `en-US` locale. */
export function getDateMetricUsStyle(): boolean {
	if (typeof window === 'undefined') return false;
	try {
		const v = window.localStorage.getItem(DATE_METRIC_STORAGE_KEY);
		if (v === 'US') return true;
		if (v === 'GLOBAL') return false;
		const lang = navigator.language || navigator.languages?.[0] || '';
		return lang.startsWith('en-US');
	} catch {
		return false;
	}
}

export function setDateMetricUsStyle(usStyle: boolean): void {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(DATE_METRIC_STORAGE_KEY, usStyle ? 'US' : 'GLOBAL');
	} catch {
		/* ignore */
	}
}

/** `datetime-local` value (`YYYY-MM-DDTHH:mm`) from an ISO timestamp, in the browser local zone. */
export function isoToDatetimeLocalValue(iso: string): string {
	const d = newDayjs(iso);
	if (!d.isValid()) return '';
	return d.format('YYYY-MM-DDTHH:mm');
}

/**
 * `datetime-local` value (`YYYY-MM-DDTHH:mm`) from a UTC ISO-ish timestamp.
 *
 * This matters when the backend returns timestamps without an explicit `Z` / offset.
 */
export function utcIsoToDatetimeLocalValue(iso: string): string {
	const d = dayjs.utc(iso).local();
	if (!d.isValid()) return '';
	return d.format('YYYY-MM-DDTHH:mm');
}

/** ISO string from a `datetime-local` value; falls back to “now” if parsing fails. */
export function datetimeLocalToIso(value: string): string {
	const d = newDayjs(value);
	return d.isValid() ? d.toDate().toISOString() : newDayjs().toDate().toISOString();
}
