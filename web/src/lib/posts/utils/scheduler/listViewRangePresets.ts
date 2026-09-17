import { CalendarDate, type DateValue } from '@internationalized/date';

import {
	addUtcDays,
	endOfIsoWeek,
	endOfMonth,
	rangeForListExtendedWindow,
	startOfIsoWeek,
	startOfMonth,
	todayUtcYyyyMmDd
} from '$lib/posts/utils/scheduler/calendar';

/** Maximum inclusive span allowed for a custom list-view date range. */
export const LIST_VIEW_MAX_RANGE_DAYS = 730;

export type ListViewRangePresetId =
	| 'today'
	| 'this-week'
	| 'this-month'
	| 'last-7-days'
	| 'last-30-days'
	| 'last-90-days'
	| 'next-30-days'
	| 'next-90-days'
	| 'extended'
	| 'custom';

export type ListViewDateRange = {
	start: string;
	end: string;
};

export type ListViewRangePresetOption = {
	id: Exclude<ListViewRangePresetId, 'custom'>;
	label: string;
};

export const LIST_VIEW_RANGE_PRESET_OPTIONS: ListViewRangePresetOption[] = [
	{ id: 'today', label: 'Today' },
	{ id: 'this-week', label: 'This week' },
	{ id: 'this-month', label: 'This month' },
	{ id: 'last-7-days', label: 'Last 7 days' },
	{ id: 'last-30-days', label: 'Last 30 days' },
	{ id: 'last-90-days', label: 'Last 90 days' },
	{ id: 'next-30-days', label: 'Next 30 days' },
	{ id: 'next-90-days', label: 'Next 90 days' },
	{ id: 'extended', label: '90 back, 180 ahead' }
];

function parseYyyyMmDd(yyyyMmDd: string): { y: number; m: number; d: number } | null {
	const trimmed = yyyyMmDd.trim();
	if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
	const [y, m, d] = trimmed.split('-').map((part) => Number.parseInt(part, 10));
	if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
	return { y, m, d };
}

export function calendarDateFromYyyyMmDd(yyyyMmDd: string): CalendarDate | undefined {
	const parsed = parseYyyyMmDd(yyyyMmDd);
	if (!parsed) return undefined;
	return new CalendarDate(parsed.y, parsed.m, parsed.d);
}

export function yyyyMmDdFromCalendarDate(value: DateValue | undefined): string {
	if (!value) return '';
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${value.year}-${pad(value.month)}-${pad(value.day)}`;
}

export function dateRangeFromYyyyMmDd(start: string, end: string): { start: CalendarDate | undefined; end: CalendarDate | undefined } {
	return {
		start: calendarDateFromYyyyMmDd(start),
		end: calendarDateFromYyyyMmDd(end)
	};
}

export function yyyyMmDdFromDateRange(range: {
	start: DateValue | undefined;
	end: DateValue | undefined;
}): ListViewDateRange {
	return {
		start: yyyyMmDdFromCalendarDate(range.start),
		end: yyyyMmDdFromCalendarDate(range.end)
	};
}

function inclusiveDayCount(start: string, end: string): number {
	const startMs = Date.parse(`${start}T00:00:00Z`);
	const endMs = Date.parse(`${end}T00:00:00Z`);
	if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return 0;
	return Math.floor((endMs - startMs) / 86_400_000) + 1;
}

export function validateListViewDateRange(start: string, end: string): string | null {
	if (!start || !end) return 'Select a start and end date.';
	if (start > end) return 'Start date must be on or before end date.';
	const spanDays = inclusiveDayCount(start, end);
	if (spanDays > LIST_VIEW_MAX_RANGE_DAYS) {
		return `Date range cannot exceed ${LIST_VIEW_MAX_RANGE_DAYS} days.`;
	}
	return null;
}

export function getListViewRangeForPreset(
	presetId: Exclude<ListViewRangePresetId, 'custom'>,
	baseDate = todayUtcYyyyMmDd()
): ListViewDateRange {
	switch (presetId) {
		case 'today':
			return { start: baseDate, end: baseDate };
		case 'this-week':
			return { start: startOfIsoWeek(baseDate), end: endOfIsoWeek(baseDate) };
		case 'this-month':
			return { start: startOfMonth(baseDate), end: endOfMonth(baseDate) };
		case 'last-7-days':
			return { start: addUtcDays(baseDate, -6), end: baseDate };
		case 'last-30-days':
			return { start: addUtcDays(baseDate, -29), end: baseDate };
		case 'last-90-days':
			return { start: addUtcDays(baseDate, -89), end: baseDate };
		case 'next-30-days':
			return { start: baseDate, end: addUtcDays(baseDate, 29) };
		case 'next-90-days':
			return { start: baseDate, end: addUtcDays(baseDate, 89) };
		case 'extended': {
			const range = rangeForListExtendedWindow(baseDate);
			return { start: range.rangeStartDate, end: range.rangeEndDate };
		}
	}
}

export function detectListViewRangePreset(
	start: string,
	end: string,
	baseDate = todayUtcYyyyMmDd()
): ListViewRangePresetId {
	for (const option of LIST_VIEW_RANGE_PRESET_OPTIONS) {
		const presetRange = getListViewRangeForPreset(option.id, baseDate);
		if (presetRange.start === start && presetRange.end === end) return option.id;
	}
	return 'custom';
}
