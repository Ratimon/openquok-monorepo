import { describe, expect, it } from 'vitest';

import type { CalendarPostRowViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

import {
	buildCalendarEventsFromPosts,
	CALENDAR_LIST_LOOKAHEAD_DAYS,
	CALENDAR_LIST_LOOKBACK_DAYS,
	CALENDAR_LIST_SHIFT_DAYS,
	calendarEventIdForPost,
	labelForListWindow,
	rangeForListWindow,
	shiftListWindow
} from '$lib/posts/utils/scheduler/calendar';

function recurringRow(
	overrides: Partial<CalendarPostRowViewModel> & Pick<CalendarPostRowViewModel, 'publishDate'>
): CalendarPostRowViewModel {
	return {
		id: 'post-1',
		postGroup: 'group-1',
		state: 'QUEUE',
		organizationId: 'org-1',
		integrationId: 'int-1',
		content: 'Weekly post',
		intervalInDays: 7,
		...overrides
	};
}

describe('calendarEventIdForPost', () => {
	it('combines post id and publish date for virtual recurring copies', () => {
		expect(
			calendarEventIdForPost({
				id: 'post-1',
				publishDate: '2030-06-01T12:00:00.000Z'
			})
		).toBe('post-1@2030-06-01T12:00:00.000Z');
	});
});

describe('buildCalendarEventsFromPosts', () => {
	it('assigns distinct event ids when the same post id appears at multiple publish dates', () => {
		const posts = [
			recurringRow({
				publishDate: '2030-06-01T12:00:00.000Z',
				seriesAnchorPublishDate: '2030-06-01T12:00:00.000Z'
			}),
			recurringRow({
				publishDate: '2030-06-08T12:00:00.000Z',
				seriesAnchorPublishDate: '2030-06-01T12:00:00.000Z'
			})
		];

		const events = buildCalendarEventsFromPosts(posts, new Map());

		expect(events).toHaveLength(2);
		expect(events.map((ev) => ev.id)).toEqual([
			'post-1@2030-06-01T12:00:00.000Z',
			'post-1@2030-06-08T12:00:00.000Z'
		]);
	});
});

describe('rangeForListWindow', () => {
	it('looks back 90 UTC days and forward 180 UTC days from the base date', () => {
		expect(rangeForListWindow('2026-09-16')).toEqual({
			rangeStartDate: '2026-06-18',
			rangeEndDate: '2027-03-15'
		});
	});

	it('crosses year boundaries in UTC', () => {
		expect(rangeForListWindow('2026-01-15')).toEqual({
			rangeStartDate: '2025-10-17',
			rangeEndDate: '2026-07-14'
		});
	});

	it('spans lookback plus lookahead plus the base day inclusively', () => {
		const { rangeStartDate, rangeEndDate } = rangeForListWindow('2026-09-16');
		const startMs = Date.parse(`${rangeStartDate}T00:00:00Z`);
		const endMs = Date.parse(`${rangeEndDate}T00:00:00Z`);
		const inclusiveDays = (endMs - startMs) / (24 * 60 * 60 * 1000) + 1;
		expect(inclusiveDays).toBe(CALENDAR_LIST_LOOKBACK_DAYS + CALENDAR_LIST_LOOKAHEAD_DAYS + 1);
	});
});

describe('shiftListWindow', () => {
	it(`shifts both bounds by ${CALENDAR_LIST_SHIFT_DAYS} UTC days per delta step`, () => {
		const window = rangeForListWindow('2026-09-16');
		expect(shiftListWindow(window.rangeStartDate, window.rangeEndDate, 1)).toEqual({
			rangeStartDate: '2026-07-18',
			rangeEndDate: '2027-04-14'
		});
		expect(shiftListWindow(window.rangeStartDate, window.rangeEndDate, -1)).toEqual({
			rangeStartDate: '2026-05-19',
			rangeEndDate: '2027-02-13'
		});
	});
});

describe('labelForListWindow', () => {
	it('formats the inclusive UTC window as MM/DD/YYYY → MM/DD/YYYY', () => {
		const window = rangeForListWindow('2026-09-16');
		expect(labelForListWindow(window.rangeStartDate, window.rangeEndDate)).toBe(
			'06/18/2026 → 03/15/2027'
		);
	});

	it('returns an empty string when either bound is missing', () => {
		expect(labelForListWindow('', '2026-09-16')).toBe('');
		expect(labelForListWindow('2026-09-16', '')).toBe('');
	});
});
