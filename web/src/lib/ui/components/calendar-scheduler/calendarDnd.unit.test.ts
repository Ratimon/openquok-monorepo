import { describe, expect, it } from 'vitest';

import {
	scheduledIsoFromMonthGridDay,
	zonedDateTimeFromGridSlot
} from '$lib/ui/components/calendar-scheduler/calendarDnd';

describe('calendarDnd timezone helpers', () => {
	it('builds zoned grid slots in the configured IANA zone', () => {
		const dt = zonedDateTimeFromGridSlot('2026-09-15', 9, 20, 'Asia/Bangkok');
		expect(dt.hour).toBe(9);
		expect(dt.minute).toBe(20);
		expect(dt.timeZoneId).toBe('Asia/Bangkok');
		expect(dt.toInstant().toString()).toBe('2026-09-15T02:20:00Z');
	});

	it('preserves wall-clock time when moving across month-grid days', () => {
		const iso = scheduledIsoFromMonthGridDay(
			'2026-09-20',
			'2026-09-15T02:20:00.000Z',
			'Asia/Bangkok'
		);
		expect(iso).toBe('2026-09-20T02:20:00Z');
	});
});
