import { describe, expect, it } from 'vitest';

import type { CalendarPostRowViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

import {
	buildCalendarEventsFromPosts,
	calendarEventIdForPost
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
