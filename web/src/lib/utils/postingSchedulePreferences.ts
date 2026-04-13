import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

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
export function getTimeZoneSelectOptions(): { value: string; label: string }[] {
	const ids = intlTimeZoneIds();
	const list = ids.length > 0 ? ids : [dayjs.tz.guess() || 'UTC'];
	const unique = [...new Set(list)].sort((a, b) => a.localeCompare(b, 'en'));
	return unique.map((value) => ({ value, label: value.replace(/_/g, ' ') }));
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
