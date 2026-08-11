import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';
import type {
	BestTimeCalendarDayBoundaries,
	BestTimeCalendarPreviewViewModel,
	TimingTestPlanSlotViewModel,
	TimingTestPlanViewModel
} from '$lib/best-time-to-post/best-time-to-post.types';
import type { CalendarPostRowViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';
import type { ChannelViewModel } from '$lib/posts/scheduler.types';
import {
	buildCalendarEventsFromPosts,
	endOfIsoWeek,
	startOfIsoWeek
} from '$lib/posts/utils/schedulerCalendar';
import { newDayjs } from '$lib/utils/postingSchedulePreferences';

const PREVIEW_INTEGRATION_ID = 'best-time-to-post-preview';
const PREVIEW_ORG_ID = 'best-time-to-post-org';

function localYyyyMmDdFromSlot(publishDateIso: string, timezone: string): string {
	return newDayjs(publishDateIso).tz(timezone).format('YYYY-MM-DD');
}

function scheduleXDayBoundaryHour(totalMinutes: number): string {
	const clamped = Math.max(0, Math.min(24 * 60, totalMinutes));
	const hour = Math.min(24, Math.floor(clamped / 60));
	return `${String(hour).padStart(2, '0')}:00`;
}

/** Schedule-X `dayBoundaries` only accepts `HH:00` (see validateConfig in @schedule-x/calendar). */
function dayBoundariesForSlots(
	slots: TimingTestPlanSlotViewModel[],
	displayTimezone: string
): BestTimeCalendarDayBoundaries {
	if (slots.length === 0) {
		return { start: '09:00', end: '21:00' };
	}

	let minMinutes = 24 * 60;
	let maxMinutes = 0;
	for (const slot of slots) {
		const d = newDayjs(slot.publishDateIso).tz(displayTimezone);
		const minutes = d.hour() * 60 + d.minute();
		minMinutes = Math.min(minMinutes, minutes);
		maxMinutes = Math.max(maxMinutes, minutes);
	}

	const startMinutes = Math.max(0, minMinutes - 60);
	const endMinutes = Math.min(24 * 60, maxMinutes + 90);

	let startHour = Math.floor(startMinutes / 60);
	let endHour = Math.ceil(endMinutes / 60);
	endHour = Math.min(24, endHour);
	if (endHour <= startHour) {
		endHour = Math.min(24, startHour + 1);
	}
	if (endHour <= startHour) {
		startHour = Math.max(0, endHour - 1);
	}

	return {
		start: scheduleXDayBoundaryHour(startHour * 60),
		end: scheduleXDayBoundaryHour(endHour * 60)
	};
}

function mockChannelForPlan(plan: TimingTestPlanViewModel): CreateSocialPostChannelViewModel {
	return {
		id: PREVIEW_INTEGRATION_ID,
		internalId: '',
		name: plan.platformLabel,
		identifier: plan.platformSlug,
		picture: null,
		type: 'social',
		disabled: false,
		inBetweenSteps: false,
		refreshNeeded: false,
		schedulable: true,
		unschedulableReason: null,
		group: null,
		postingTimes: []
	};
}

function postsFromPlan(plan: TimingTestPlanViewModel): CalendarPostRowViewModel[] {
	return plan.slots.map((slot) => ({
		id: `best-time-slot-${slot.index}`,
		postGroup: `best-time-group-${slot.index}`,
		/** Queued/scheduled state so CalendarView paints scheduled styling. */
		state: 'QUEUE',
		publishDate: slot.publishDateIso,
		organizationId: PREVIEW_ORG_ID,
		integrationId: PREVIEW_INTEGRATION_ID,
		content: slot.contentTypeLabel,
		providerIdentifier: plan.platformSlug,
		channelName: plan.platformLabel,
		channelPictureUrl: null,
		tagNames: ['timing-test']
	}));
}

/**
 * Build a read-only week calendar preview from a timing test plan.
 * Uses the same event bucketing as the workspace scheduler.
 */
export function buildBestTimeCalendarPreview(
	plan: TimingTestPlanViewModel,
	instanceId = 0
): BestTimeCalendarPreviewViewModel {
	const channel = mockChannelForPlan(plan);
	const channelById = new Map<string, ChannelViewModel>([[PREVIEW_INTEGRATION_ID, channel]]);
	const posts = postsFromPlan(plan);
	const events = buildCalendarEventsFromPosts(posts, channelById);

	const displayTimezone = plan.shownTimezone || plan.timezone;

	const localDates = plan.slots.map((s) =>
		localYyyyMmDdFromSlot(s.publishDateIso, displayTimezone)
	);
	const earliest =
		localDates.length > 0
			? localDates.reduce((a, b) => (a < b ? a : b))
			: newDayjs().tz(displayTimezone).format('YYYY-MM-DD');
	const latest =
		localDates.length > 0
			? localDates.reduce((a, b) => (a > b ? a : b))
			: earliest;

	const rangeStartDate = startOfIsoWeek(earliest);
	const rangeEndDate = endOfIsoWeek(latest);
	const dayBoundaries = dayBoundariesForSlots(plan.slots, displayTimezone);

	return {
		events,
		rangeStartDate,
		rangeEndDate,
		timezone: displayTimezone,
		dayBoundaries,
		instanceId
	};
}
