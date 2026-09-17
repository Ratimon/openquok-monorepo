import { describe, expect, it } from 'vitest';

import {
	CALENDAR_LIST_LOOKAHEAD_DAYS,
	CALENDAR_LIST_LOOKBACK_DAYS,
	rangeForListExtendedWindow
} from '$lib/posts/utils/scheduler/calendar';
import {
	calendarDateFromYyyyMmDd,
	detectListViewRangePreset,
	getListViewRangeForPreset,
	LIST_VIEW_MAX_RANGE_DAYS,
	validateListViewDateRange,
	yyyyMmDdFromCalendarDate
} from '$lib/posts/utils/scheduler/listViewRangePresets';

const BASE = '2026-09-17';

describe('getListViewRangeForPreset', () => {
	it('returns single-day ranges for today', () => {
		expect(getListViewRangeForPreset('today', BASE)).toEqual({ start: BASE, end: BASE });
	});

	it('returns the extended list window', () => {
		const expected = rangeForListExtendedWindow(BASE);
		expect(getListViewRangeForPreset('extended', BASE)).toEqual({
			start: expected.rangeStartDate,
			end: expected.rangeEndDate
		});
	});

	it('returns inclusive last-7-days ending on the base date', () => {
		expect(getListViewRangeForPreset('last-7-days', BASE)).toEqual({
			start: '2026-09-11',
			end: BASE
		});
	});

	it('returns inclusive last-30-days ending on the base date', () => {
		expect(getListViewRangeForPreset('last-30-days', BASE)).toEqual({
			start: '2026-08-19',
			end: BASE
		});
	});

	it('returns inclusive last-90-days ending on the base date', () => {
		expect(getListViewRangeForPreset('last-90-days', BASE)).toEqual({
			start: '2026-06-20',
			end: BASE
		});
	});

	it('returns inclusive next-30-days starting on the base date', () => {
		expect(getListViewRangeForPreset('next-30-days', BASE)).toEqual({
			start: BASE,
			end: '2026-10-16'
		});
	});

	it('returns inclusive next-90-days starting on the base date', () => {
		expect(getListViewRangeForPreset('next-90-days', BASE)).toEqual({
			start: BASE,
			end: '2026-12-15'
		});
	});

	it('returns the ISO week containing the base date', () => {
		expect(getListViewRangeForPreset('this-week', BASE)).toEqual({
			start: '2026-09-14',
			end: '2026-09-20'
		});
	});

	it('returns the calendar month containing the base date', () => {
		expect(getListViewRangeForPreset('this-month', BASE)).toEqual({
			start: '2026-09-01',
			end: '2026-09-30'
		});
	});
});

describe('detectListViewRangePreset', () => {
	it('detects known presets', () => {
		const presetRange = getListViewRangeForPreset('last-30-days', BASE);
		expect(detectListViewRangePreset(presetRange.start, presetRange.end, BASE)).toBe('last-30-days');
	});

	it('detects every built-in preset id', () => {
		for (const presetId of [
			'today',
			'this-week',
			'this-month',
			'last-7-days',
			'last-30-days',
			'last-90-days',
			'next-30-days',
			'next-90-days',
			'extended'
		] as const) {
			const range = getListViewRangeForPreset(presetId, BASE);
			expect(detectListViewRangePreset(range.start, range.end, BASE)).toBe(presetId);
		}
	});

	it('returns custom for unmatched ranges', () => {
		expect(detectListViewRangePreset('2026-01-01', '2026-01-05', BASE)).toBe('custom');
	});
});

describe('validateListViewDateRange', () => {
	it('accepts ordered ranges within the max span', () => {
		expect(validateListViewDateRange('2026-01-01', '2026-01-10')).toBeNull();
	});

	it('rejects missing bounds', () => {
		expect(validateListViewDateRange('', '2026-01-10')).toBe('Select a start and end date.');
		expect(validateListViewDateRange('2026-01-01', '')).toBe('Select a start and end date.');
	});

	it('rejects reversed ranges', () => {
		expect(validateListViewDateRange('2026-01-10', '2026-01-01')).toBe(
			'Start date must be on or before end date.'
		);
	});

	it('rejects spans above the max day count', () => {
		const start = '2024-01-01';
		const end = '2025-12-31';
		expect(validateListViewDateRange(start, end)).toBe(
			`Date range cannot exceed ${LIST_VIEW_MAX_RANGE_DAYS} days.`
		);
	});
});

describe('calendar date converters', () => {
	it('round-trips yyyy-mm-dd bounds', () => {
		const cal = calendarDateFromYyyyMmDd(BASE);
		expect(cal).toBeDefined();
		expect(yyyyMmDdFromCalendarDate(cal)).toBe(BASE);
	});
});

describe('extended preset span', () => {
	it('matches the configured list lookback and lookahead', () => {
		const range = getListViewRangeForPreset('extended', BASE);
		const startMs = Date.parse(`${range.start}T00:00:00Z`);
		const endMs = Date.parse(`${range.end}T00:00:00Z`);
		const baseMs = Date.parse(`${BASE}T00:00:00Z`);
		const lookbackDays = Math.round((baseMs - startMs) / 86_400_000);
		const lookaheadDays = Math.round((endMs - baseMs) / 86_400_000);
		expect(lookbackDays).toBe(CALENDAR_LIST_LOOKBACK_DAYS);
		expect(lookaheadDays).toBe(CALENDAR_LIST_LOOKAHEAD_DAYS);
	});
});
