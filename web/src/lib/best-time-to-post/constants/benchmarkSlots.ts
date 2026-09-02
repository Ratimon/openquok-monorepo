import type {
	BenchmarkSlotTemplate,
	ContentTypeId,
	PostingCadenceId
} from '$lib/best-time-to-post/best-time-to-post.types';

/**
 * Static benchmark posting windows for the Best Time to Post calculator.
 *
 * Hours are **audience-local** clock times (IANA zone from the form), not UTC.
 * They are starting points for controlled A/B tests — not account-specific peaks.
 *
 * Values are aligned with recurring themes in public timing research (aggregate
 * studies and platform guides, roughly 2025–2026): weekday morning commute,
 * lunch, and evening leisure; Tue–Thu strongest for short-form and B2B; weaker
 * weekend slots for professional networks. Revisit this file when refreshing benchmarks;
 * keep `BENCHMARK_SLOTS_LAST_REVIEWED` in sync for the public FAQ on `/tools/best-time-to-post`.
 *
 * Cadence wiring (see `getBenchmarkSlotTemplates`):
 * - `3_per_week` → Tue / Wed / Thu only, **first** time in each day's `times` array.
 * - `daily` → all seven days, one slot per day (first time).
 * - `2_per_day` / `3_per_day` → first two or three times per selected day.
 */

/** Calendar date (YYYY-MM-DD) when platform windows were last reviewed against public timing research. */
export const BENCHMARK_SLOTS_LAST_REVIEWED = '2026-09-01';

/** Preferred local clock windows for a weekday (first entry = primary benchmark). */
type DayWindow = {
	/** ISO weekday: 1 = Monday … 7 = Sunday */
	weekday: number;
	times: readonly { hour: number; minute: number }[];
};

/**
 * Reference platforms with dedicated tables. Slugs match `publicChannelConfig` /
 * composer `identifier` where they align (tiktok, instagram-business → instagram, etc.).
 */
const PLATFORM_WINDOWS: Record<string, readonly DayWindow[]> = {
	// Short-form video: morning scroll, lunch, evening prime (7–9 PM local common in US surveys).
	tiktok: [
		{ weekday: 1, times: [{ hour: 7, minute: 0 }, { hour: 12, minute: 0 }, { hour: 19, minute: 0 }] },
		{ weekday: 2, times: [{ hour: 20, minute: 0 }, { hour: 7, minute: 0 }, { hour: 12, minute: 0 }] },
		{ weekday: 3, times: [{ hour: 12, minute: 0 }, { hour: 20, minute: 0 }, { hour: 7, minute: 0 }] },
		{ weekday: 4, times: [{ hour: 20, minute: 0 }, { hour: 19, minute: 0 }, { hour: 12, minute: 0 }] },
		{ weekday: 5, times: [{ hour: 17, minute: 0 }, { hour: 12, minute: 0 }, { hour: 20, minute: 0 }] },
		{ weekday: 6, times: [{ hour: 10, minute: 0 }, { hour: 17, minute: 0 }, { hour: 20, minute: 0 }] },
		{ weekday: 7, times: [{ hour: 10, minute: 0 }, { hour: 12, minute: 0 }, { hour: 20, minute: 0 }] }
	],
	'tiktok-business': [
		{ weekday: 1, times: [{ hour: 7, minute: 0 }, { hour: 12, minute: 0 }, { hour: 19, minute: 0 }] },
		{ weekday: 2, times: [{ hour: 20, minute: 0 }, { hour: 7, minute: 0 }, { hour: 12, minute: 0 }] },
		{ weekday: 3, times: [{ hour: 12, minute: 0 }, { hour: 20, minute: 0 }, { hour: 7, minute: 0 }] },
		{ weekday: 4, times: [{ hour: 20, minute: 0 }, { hour: 19, minute: 0 }, { hour: 12, minute: 0 }] },
		{ weekday: 5, times: [{ hour: 17, minute: 0 }, { hour: 12, minute: 0 }, { hour: 20, minute: 0 }] },
		{ weekday: 6, times: [{ hour: 10, minute: 0 }, { hour: 17, minute: 0 }, { hour: 20, minute: 0 }] },
		{ weekday: 7, times: [{ hour: 10, minute: 0 }, { hour: 12, minute: 0 }, { hour: 20, minute: 0 }] }
	],
	// Reels / feed: late morning, lunch, evening (6–9 PM band).
	instagram: [
		{ weekday: 1, times: [{ hour: 11, minute: 0 }, { hour: 14, minute: 0 }, { hour: 19, minute: 0 }] },
		{ weekday: 2, times: [{ hour: 10, minute: 0 }, { hour: 12, minute: 0 }, { hour: 19, minute: 0 }] },
		{ weekday: 3, times: [{ hour: 12, minute: 0 }, { hour: 11, minute: 0 }, { hour: 19, minute: 0 }] },
		{ weekday: 4, times: [{ hour: 9, minute: 0 }, { hour: 12, minute: 0 }, { hour: 18, minute: 0 }] },
		{ weekday: 5, times: [{ hour: 11, minute: 0 }, { hour: 14, minute: 0 }, { hour: 17, minute: 0 }] },
		{ weekday: 6, times: [{ hour: 10, minute: 0 }, { hour: 13, minute: 0 }, { hour: 17, minute: 0 }] },
		{ weekday: 7, times: [{ hour: 10, minute: 0 }, { hour: 12, minute: 0 }, { hour: 18, minute: 0 }] }
	],
	'instagram-business': [
		{ weekday: 1, times: [{ hour: 11, minute: 0 }, { hour: 14, minute: 0 }, { hour: 19, minute: 0 }] },
		{ weekday: 2, times: [{ hour: 10, minute: 0 }, { hour: 12, minute: 0 }, { hour: 19, minute: 0 }] },
		{ weekday: 3, times: [{ hour: 12, minute: 0 }, { hour: 11, minute: 0 }, { hour: 19, minute: 0 }] },
		{ weekday: 4, times: [{ hour: 9, minute: 0 }, { hour: 12, minute: 0 }, { hour: 18, minute: 0 }] },
		{ weekday: 5, times: [{ hour: 11, minute: 0 }, { hour: 14, minute: 0 }, { hour: 17, minute: 0 }] },
		{ weekday: 6, times: [{ hour: 10, minute: 0 }, { hour: 13, minute: 0 }, { hour: 17, minute: 0 }] },
		{ weekday: 7, times: [{ hour: 10, minute: 0 }, { hour: 12, minute: 0 }, { hour: 18, minute: 0 }] }
	],
	// B2B: pre-work and mid-morning; midweek strongest; lighter weekend morning for testing only.
	linkedin: [
		{ weekday: 1, times: [{ hour: 8, minute: 0 }, { hour: 11, minute: 0 }, { hour: 13, minute: 0 }] },
		{ weekday: 2, times: [{ hour: 10, minute: 0 }, { hour: 8, minute: 0 }, { hour: 12, minute: 0 }] },
		{ weekday: 3, times: [{ hour: 10, minute: 0 }, { hour: 11, minute: 0 }, { hour: 15, minute: 0 }] },
		{ weekday: 4, times: [{ hour: 10, minute: 0 }, { hour: 12, minute: 0 }, { hour: 14, minute: 0 }] },
		{ weekday: 5, times: [{ hour: 9, minute: 0 }, { hour: 11, minute: 0 }, { hour: 13, minute: 0 }] },
		{ weekday: 6, times: [{ hour: 9, minute: 0 }, { hour: 10, minute: 0 }, { hour: 12, minute: 0 }] },
		{ weekday: 7, times: [{ hour: 9, minute: 0 }, { hour: 10, minute: 0 }, { hour: 11, minute: 0 }] }
	],
	// News / conversation: morning check-in, lunch, late afternoon (platform studies split AM vs PM).
	x: [
		{ weekday: 1, times: [{ hour: 9, minute: 0 }, { hour: 12, minute: 0 }, { hour: 17, minute: 0 }] },
		{ weekday: 2, times: [{ hour: 9, minute: 0 }, { hour: 10, minute: 0 }, { hour: 15, minute: 0 }] },
		{ weekday: 3, times: [{ hour: 10, minute: 0 }, { hour: 12, minute: 0 }, { hour: 17, minute: 0 }] },
		{ weekday: 4, times: [{ hour: 9, minute: 0 }, { hour: 13, minute: 0 }, { hour: 17, minute: 0 }] },
		{ weekday: 5, times: [{ hour: 9, minute: 0 }, { hour: 11, minute: 0 }, { hour: 13, minute: 0 }] },
		{ weekday: 6, times: [{ hour: 9, minute: 0 }, { hour: 11, minute: 0 }, { hour: 18, minute: 0 }] },
		{ weekday: 7, times: [{ hour: 11, minute: 0 }, { hour: 13, minute: 0 }, { hour: 18, minute: 0 }] }
	],
	threads: [
		{ weekday: 1, times: [{ hour: 9, minute: 0 }, { hour: 12, minute: 0 }, { hour: 19, minute: 0 }] },
		{ weekday: 2, times: [{ hour: 10, minute: 0 }, { hour: 12, minute: 0 }, { hour: 19, minute: 0 }] },
		{ weekday: 3, times: [{ hour: 11, minute: 0 }, { hour: 13, minute: 0 }, { hour: 19, minute: 0 }] },
		{ weekday: 4, times: [{ hour: 10, minute: 0 }, { hour: 12, minute: 0 }, { hour: 18, minute: 0 }] },
		{ weekday: 5, times: [{ hour: 11, minute: 0 }, { hour: 14, minute: 0 }, { hour: 17, minute: 0 }] },
		{ weekday: 6, times: [{ hour: 10, minute: 0 }, { hour: 13, minute: 0 }, { hour: 18, minute: 0 }] },
		{ weekday: 7, times: [{ hour: 10, minute: 0 }, { hour: 12, minute: 0 }, { hour: 19, minute: 0 }] }
	],
	facebook: [
		{ weekday: 1, times: [{ hour: 9, minute: 0 }, { hour: 13, minute: 0 }, { hour: 19, minute: 0 }] },
		{ weekday: 2, times: [{ hour: 10, minute: 0 }, { hour: 13, minute: 0 }, { hour: 19, minute: 0 }] },
		{ weekday: 3, times: [{ hour: 11, minute: 0 }, { hour: 13, minute: 0 }, { hour: 15, minute: 0 }] },
		{ weekday: 4, times: [{ hour: 10, minute: 0 }, { hour: 14, minute: 0 }, { hour: 19, minute: 0 }] },
		{ weekday: 5, times: [{ hour: 9, minute: 0 }, { hour: 12, minute: 0 }, { hour: 17, minute: 0 }] },
		{ weekday: 6, times: [{ hour: 10, minute: 0 }, { hour: 12, minute: 0 }, { hour: 18, minute: 0 }] },
		{ weekday: 7, times: [{ hour: 10, minute: 0 }, { hour: 13, minute: 0 }, { hour: 19, minute: 0 }] }
	],
	// Technical writing audience: weekday mornings, lunch, early evening (local clock).
	devto: [
		{ weekday: 1, times: [{ hour: 9, minute: 0 }, { hour: 12, minute: 0 }, { hour: 17, minute: 0 }] },
		{ weekday: 2, times: [{ hour: 9, minute: 0 }, { hour: 12, minute: 0 }, { hour: 17, minute: 0 }] },
		{ weekday: 3, times: [{ hour: 10, minute: 0 }, { hour: 12, minute: 30 }, { hour: 17, minute: 0 }] },
		{ weekday: 4, times: [{ hour: 9, minute: 0 }, { hour: 12, minute: 0 }, { hour: 16, minute: 30 }] },
		{ weekday: 5, times: [{ hour: 9, minute: 0 }, { hour: 12, minute: 0 }, { hour: 16, minute: 0 }] },
		{ weekday: 6, times: [{ hour: 10, minute: 0 }, { hour: 12, minute: 0 }, { hour: 16, minute: 0 }] },
		{ weekday: 7, times: [{ hour: 10, minute: 0 }, { hour: 12, minute: 0 }, { hour: 17, minute: 0 }] }
	]
};

/** Fallback for channels without a dedicated table: Tue–Thu weighted midweek afternoons. */
const DEFAULT_WINDOWS: readonly DayWindow[] = [
	{ weekday: 1, times: [{ hour: 11, minute: 0 }, { hour: 14, minute: 0 }, { hour: 17, minute: 0 }] },
	{ weekday: 2, times: [{ hour: 10, minute: 0 }, { hour: 13, minute: 0 }, { hour: 17, minute: 0 }] },
	{ weekday: 3, times: [{ hour: 11, minute: 0 }, { hour: 13, minute: 0 }, { hour: 18, minute: 0 }] },
	{ weekday: 4, times: [{ hour: 10, minute: 0 }, { hour: 14, minute: 0 }, { hour: 17, minute: 0 }] },
	{ weekday: 5, times: [{ hour: 10, minute: 0 }, { hour: 12, minute: 0 }, { hour: 16, minute: 0 }] },
	{ weekday: 6, times: [{ hour: 10, minute: 0 }, { hour: 13, minute: 0 }, { hour: 17, minute: 0 }] },
	{ weekday: 7, times: [{ hour: 10, minute: 0 }, { hour: 12, minute: 0 }, { hour: 18, minute: 0 }] }
];

/** Small local-minute offsets so content types probe nearby windows. */
const CONTENT_TYPE_MINUTE_OFFSET: Record<ContentTypeId, number> = {
	short_video: 0,
	image: 30,
	text: -45,
	carousel: 15
};

function windowsForPlatform(platformSlug: string): readonly DayWindow[] {
	const key = platformSlug.trim().toLowerCase();
	return PLATFORM_WINDOWS[key] ?? DEFAULT_WINDOWS;
}

function applyContentTypeOffset(
	hour: number,
	minute: number,
	contentTypeId: ContentTypeId
): { hour: number; minute: number } {
	const total = hour * 60 + minute + CONTENT_TYPE_MINUTE_OFFSET[contentTypeId];
	const wrapped = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
	return { hour: Math.floor(wrapped / 60), minute: wrapped % 60 };
}

function pickWeekdaysForCadence(
	windows: readonly DayWindow[],
	cadenceId: PostingCadenceId
): readonly DayWindow[] {
	if (cadenceId === '3_per_week') {
		const tue = windows.find((w) => w.weekday === 2);
		const wed = windows.find((w) => w.weekday === 3);
		const thu = windows.find((w) => w.weekday === 4);
		return [tue, wed, thu].filter((w): w is DayWindow => w != null);
	}
	return windows;
}

function timesPerDayForCadence(cadenceId: PostingCadenceId): number {
	if (cadenceId === '2_per_day') return 2;
	if (cadenceId === '3_per_day') return 3;
	return 1;
}

/**
 * Resolve benchmark slot templates for a platform × content type × cadence.
 * Templates are weekday + local clock; callers map them onto calendar dates.
 */
export function getBenchmarkSlotTemplates(params: {
	platformSlug: string;
	contentTypeId: ContentTypeId;
	cadenceId: PostingCadenceId;
}): BenchmarkSlotTemplate[] {
	const windows = pickWeekdaysForCadence(
		windowsForPlatform(params.platformSlug),
		params.cadenceId
	);
	const timesPerDay = timesPerDayForCadence(params.cadenceId);
	const slots: BenchmarkSlotTemplate[] = [];

	for (const day of windows) {
		const times = day.times.slice(0, timesPerDay);
		for (const t of times) {
			const shifted = applyContentTypeOffset(t.hour, t.minute, params.contentTypeId);
			slots.push({
				weekday: day.weekday,
				hour: shifted.hour,
				minute: shifted.minute
			});
		}
	}

	return slots;
}
