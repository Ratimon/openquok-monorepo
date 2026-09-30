import { describe, expect, it } from 'vitest';

import {
	BENCHMARK_SLOTS_LAST_REVIEWED,
	getPlatformBenchmarkDayWindows
} from '$lib/best-time-to-post/constants/benchmarkSlots';
import {
	formatAudienceLocalBenchmarkTime,
	formatBenchmarkWindowsForSeo
} from '$lib/best-time-to-post/utils/formatBenchmarkWindowsForSeo';

describe('formatAudienceLocalBenchmarkTime', () => {
	it('formats noon and evening without timezone', () => {
		expect(formatAudienceLocalBenchmarkTime(9, 0)).toBe('9:00 AM');
		expect(formatAudienceLocalBenchmarkTime(12, 0)).toBe('12:00 PM');
		expect(formatAudienceLocalBenchmarkTime(18, 0)).toBe('6:00 PM');
	});
});

describe('formatBenchmarkWindowsForSeo', () => {
	it('matches bluesky PLATFORM_WINDOWS for all weekdays', () => {
		const rows = formatBenchmarkWindowsForSeo('bluesky');
		const windows = getPlatformBenchmarkDayWindows('bluesky');

		expect(rows).toHaveLength(7);
		expect(windows).toHaveLength(7);

		for (let weekday = 1; weekday <= 7; weekday += 1) {
			const day = windows.find((w) => w.weekday === weekday);
			const row = rows[weekday - 1];
			expect(row.dayLabel).toBe(
				['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][
					weekday - 1
				]
			);
			expect(row.primaryTime).toBe(
				formatAudienceLocalBenchmarkTime(day!.times[0].hour, day!.times[0].minute)
			);
			const secondary = day!.times.slice(1, 3).map((t) => formatAudienceLocalBenchmarkTime(t.hour, t.minute));
			if (secondary.length > 0) {
				expect(row.secondaryTimes).toBe(secondary.join(', '));
			}
		}
	});

	it('uses 9:00 AM as Wednesday primary after bluesky refresh', () => {
		const wednesday = formatBenchmarkWindowsForSeo('bluesky').find(
			(row) => row.dayLabel === 'Wednesday'
		);

		expect(wednesday?.primaryTime).toBe('9:00 AM');
		expect(wednesday?.secondaryTimes).toBe('12:00 PM, 6:00 PM');
	});

	it('puts Saturday evening first for bluesky weekend primary', () => {
		const saturday = formatBenchmarkWindowsForSeo('bluesky').find(
			(row) => row.dayLabel === 'Saturday'
		);

		expect(saturday?.primaryTime).toBe('5:00 PM');
		expect(saturday?.secondaryTimes).toBe('9:00 AM, 12:00 PM');
	});
});

describe('BENCHMARK_SLOTS_LAST_REVIEWED', () => {
	it('reflects the latest bluesky benchmark review date', () => {
		expect(BENCHMARK_SLOTS_LAST_REVIEWED).toBe('2026-09-30');
	});
});
