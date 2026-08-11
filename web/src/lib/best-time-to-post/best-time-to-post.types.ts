import type { IconName } from '$data/icons';

import type { SchedulerCalendarEvent } from '$lib/posts/scheduler.types';

/** How often to place benchmark test slots in the generated week. */
export type PostingCadenceId = '3_per_week' | 'daily' | '2_per_day' | '3_per_day';

/** Content shape used to pick slight time offsets within platform windows. */
export type ContentTypeId = 'short_video' | 'image' | 'text' | 'carousel';

/** One weekday + local clock time template (ISO weekday: 1 = Monday … 7 = Sunday). */
export type BenchmarkSlotTemplate = {
	weekday: number;
	hour: number;
	minute: number;
};

export type ContentTypeOptionViewModel = {
	id: ContentTypeId;
	label: string;
};

export type CadenceOptionViewModel = {
	id: PostingCadenceId;
	label: string;
};

export const DEFAULT_AUDIENCE_TIMEZONE = 'America/New_York';

export const DEFAULT_CONTENT_TYPE_ID: ContentTypeId = 'short_video';

export const DEFAULT_CADENCE_ID: PostingCadenceId = '3_per_week';

/** Default platform on the generic tool page (matches reference calculator focus). */
export const DEFAULT_PLATFORM_SLUG = 'tiktok';

export const CONTENT_TYPE_OPTIONS: readonly ContentTypeOptionViewModel[] = [
	{ id: 'short_video', label: 'Short video' },
	{ id: 'image', label: 'Image post' },
	{ id: 'text', label: 'Text post' },
	{ id: 'carousel', label: 'Carousel or gallery' }
] as const;

export const CADENCE_OPTIONS: readonly CadenceOptionViewModel[] = [
	{ id: '3_per_week', label: '3 posts per week' },
	{ id: 'daily', label: 'Daily' },
	{ id: '2_per_day', label: '2 posts per day' },
	{ id: '3_per_day', label: '3 posts per day' }
] as const;

export type BestTimeFormDefaults = {
	platformSlug: string;
	/** IANA zone for the target audience (benchmark slot clock times). */
	timezone: string;
	/** IANA zone for displaying slot times in output and week preview (often the user's local zone). */
	shownTimezone: string;
	contentTypeId: ContentTypeId;
	cadenceId: PostingCadenceId;
};

export const BEST_TIME_FORM_DEFAULTS: BestTimeFormDefaults = {
	platformSlug: DEFAULT_PLATFORM_SLUG,
	timezone: DEFAULT_AUDIENCE_TIMEZONE,
	shownTimezone: DEFAULT_AUDIENCE_TIMEZONE,
	contentTypeId: DEFAULT_CONTENT_TYPE_ID,
	cadenceId: DEFAULT_CADENCE_ID
};

export type TimingTestPlanSlotViewModel = {
	index: number;
	weekday: number;
	localHour: number;
	localMinute: number;
	/** Human-readable datetime in the audience timezone. */
	audienceDateTimeLabel: string;
	/** Same instant, formatted in the user's chosen shown timezone. */
	shownDateTimeLabel: string;
	/** UTC ISO publish instant for calendar + scheduling. */
	publishDateIso: string;
	contentTypeId: ContentTypeId;
	contentTypeLabel: string;
	platformSlug: string;
	platformLabel: string;
};

export type TimingTestPlanViewModel = {
	plainText: string;
	lines: string[];
	slots: TimingTestPlanSlotViewModel[];
	/** Audience IANA zone used to pick benchmark local clock times. */
	timezone: string;
	/** IANA zone used for primary slot labels and week preview grid. */
	shownTimezone: string;
	platformSlug: string;
	platformLabel: string;
	contentTypeId: ContentTypeId;
	contentTypeLabel: string;
	cadenceId: PostingCadenceId;
	cadenceLabel: string;
};

export type BestTimeChannelHubLinkViewModel = {
	slug: string;
	platformLabel: string;
	icon: IconName;
	href: string;
	description: string;
};

export type BestTimeToolPageViewModel = {
	metaTitle: string;
	metaDescription: string;
	/** Set on `/tools/best-time-to-post/{channelSlug}` programmatic SEO routes. */
	channelSlug: string | null;
	channelLabel: string | null;
	focusedProviderIdentifier: string | null;
	/** Initial platform select value (channel slug or generic default). */
	defaultPlatformSlug: string;
};

export type BestTimeCalendarDayBoundaries = {
	/** Schedule-X requires `HH:00` (full hours only). */
	start: string;
	end: string;
};

export type BestTimeCalendarPreviewViewModel = {
	events: SchedulerCalendarEvent[];
	rangeStartDate: string;
	rangeEndDate: string;
	/** Audience IANA zone — calendar grid must match for day boundaries and slot placement. */
	timezone: string;
	/** Narrowed visible hours for the embedded week preview (Schedule-X `dayBoundaries`). */
	dayBoundaries: BestTimeCalendarDayBoundaries;
	/** Bumped on each generate so the preview calendar remounts cleanly. */
	instanceId: number;
};

export function contentTypeLabel(id: ContentTypeId): string {
	return CONTENT_TYPE_OPTIONS.find((o) => o.id === id)?.label ?? id;
}

export function cadenceLabel(id: PostingCadenceId): string {
	return CADENCE_OPTIONS.find((o) => o.id === id)?.label ?? id;
}
