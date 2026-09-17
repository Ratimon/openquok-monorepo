import { describe, expect, it } from 'vitest';

import {
	formatCalendarDateLabel,
	formatCalendarDateRangeLabel
} from '$lib/utils/postingSchedulePreferences';

describe('formatCalendarDateLabel', () => {
	it('formats YYYY-MM-DD as MMM D, YYYY in local calendar', () => {
		expect(formatCalendarDateLabel('2026-01-10')).toBe('Jan 10, 2026');
		expect(formatCalendarDateLabel('2026-09-16')).toBe('Sep 16, 2026');
	});

	it('returns empty string for blank input', () => {
		expect(formatCalendarDateLabel('')).toBe('');
		expect(formatCalendarDateLabel('   ')).toBe('');
	});

	it('returns the input when parsing fails', () => {
		expect(formatCalendarDateLabel('not-a-date')).toBe('not-a-date');
	});
});

describe('formatCalendarDateRangeLabel', () => {
	it('joins bounds with an en dash', () => {
		expect(formatCalendarDateRangeLabel('2026-01-10', '2026-01-16')).toBe(
			'Jan 10, 2026 – Jan 16, 2026'
		);
	});

	it('returns a single date label when start and end match', () => {
		expect(formatCalendarDateRangeLabel('2026-01-10', '2026-01-10')).toBe('Jan 10, 2026');
	});

	it('returns empty string when either bound is missing', () => {
		expect(formatCalendarDateRangeLabel('', '2026-01-16')).toBe('');
		expect(formatCalendarDateRangeLabel('2026-01-10', '')).toBe('');
	});
});
