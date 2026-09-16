import { describe, expect, it } from 'vitest';

import {
	formatRepeatScheduleLabel,
	hasRepeatSchedule,
	parseRepeatIntervalDays,
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

	it('falls back to generic label when only repeatInterval is set', () => {
		expect(repeatScheduleLabel(null, 'week')).toBe('Repeating post');
	});
});
