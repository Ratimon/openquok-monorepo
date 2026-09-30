import { getPlatformBenchmarkDayWindows } from '$lib/best-time-to-post/constants/benchmarkSlots';
import type { ChannelToolBenchmarkTableRow } from '$lib/content/constants/channels/tools/shared/channelToolContentOverride.types';

const WEEKDAY_LABELS = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday'
] as const;

/** Audience-local clock label for SEO tables (12-hour, no timezone suffix). */
export function formatAudienceLocalBenchmarkTime(hour: number, minute: number): string {
	const period = hour >= 12 ? 'PM' : 'AM';
	const hour12 = hour % 12 === 0 ? 12 : hour % 12;
	const minutePadded = minute.toString().padStart(2, '0');
	return `${hour12}:${minutePadded} ${period}`;
}

/**
 * Build Mon–Sun benchmark table rows from `PLATFORM_WINDOWS` (primary + up to two secondary times).
 */
export function formatBenchmarkWindowsForSeo(
	platformSlug: string
): readonly ChannelToolBenchmarkTableRow[] {
	const windows = getPlatformBenchmarkDayWindows(platformSlug);
	const byWeekday = new Map(windows.map((day) => [day.weekday, day]));

	return WEEKDAY_LABELS.map((dayLabel, index) => {
		const weekday = index + 1;
		const day = byWeekday.get(weekday);
		if (!day?.times.length) {
			return { dayLabel, primaryTime: '—' };
		}

		const labels = day.times
			.slice(0, 3)
			.map((t) => formatAudienceLocalBenchmarkTime(t.hour, t.minute));
		const [primaryTime, ...secondary] = labels;

		return {
			dayLabel,
			primaryTime,
			...(secondary.length > 0 ? { secondaryTimes: secondary.join(', ') } : {})
		};
	});
}
