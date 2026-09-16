import { describe, expect, it } from 'vitest';

import {
	formatRepeatScheduleHighlightLabel,
	formatRepeatScheduleLabel,
	hasRepeatSchedule,
	parseRepeatIntervalDays,
	repeatScheduleHighlightLabel,
	repeatScheduleLabel
} from './repeatScheduleLabel';

describe('repeatScheduleLabel', () => {
	it('parses interval days', () => {
		expect(parseRepeatIntervalDays(7)).toBe(7);
		expect(parseRepeatIntervalDays(null)).toBe(0);
	});

	it('detects repeat from interval or composer key', () => {
		expect(hasRepeatSchedule(7, null)).toBe(true);
		expect(hasRepeatSchedule(null, 'week')).toBe(true);
		expect(hasRepeatSchedule(null, null)).toBe(false);
	});

	it('formats weekly and daily labels', () => {
		expect(formatRepeatScheduleLabel(7)).toBe('Repeat every 1 w');
		expect(formatRepeatScheduleLabel(14)).toBe('Repeat every 2 ws');
	});

	it('returns null when not repeating', () => {
		expect(repeatScheduleLabel(null, null)).toBeNull();
	});

	it('resolves tooltip label from repeatInterval when interval days are missing', () => {
		expect(repeatScheduleLabel(null, 'week')).toBe('Repeat every 1 w');
	});

	it('formats highlight labels for inline display', () => {
		expect(formatRepeatScheduleHighlightLabel(1)).toBe('Every day');
		expect(formatRepeatScheduleHighlightLabel(7)).toBe('Every week');
		expect(repeatScheduleHighlightLabel(7, null)).toBe('Every week');
		expect(repeatScheduleHighlightLabel(null, 'day')).toBe('Every day');
	});
});
