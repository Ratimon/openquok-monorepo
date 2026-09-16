import { describe, expect, it } from 'vitest';

import type { CalendarPostRowViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

import {
	buildOptimisticRecurringCalendarRows,
	collapseRecurringGroupToAnchorRows,
	expandRecurringCalendarRowsForRange,
	resolveRecurringAnchorPublishDate
} from './recurringCalendarOptimistic';

function recurringRow(
	overrides: Partial<CalendarPostRowViewModel> & Pick<CalendarPostRowViewModel, 'publishDate'>
): CalendarPostRowViewModel {
	return {
		id: 'post-1',
		postGroup: 'group-1',
		state: 'QUEUE',
		organizationId: 'org-1',
		integrationId: 'int-1',
		content: 'Weekly',
		intervalInDays: 7,
		...overrides
	};
}

describe('resolveRecurringAnchorPublishDate', () => {
	it('prefers seriesAnchorPublishDate on virtual copies', () => {
		const rows = [
			recurringRow({
				publishDate: '2030-06-15T12:00:00.000Z',
				seriesAnchorPublishDate: '2030-06-01T12:00:00.000Z'
			})
		];
		expect(resolveRecurringAnchorPublishDate(rows)).toBe('2030-06-01T12:00:00.000Z');
	});
});

describe('buildOptimisticRecurringCalendarRows', () => {
	it('re-anchors and expands from the drop slot instead of collapsing virtual copies', () => {
		const prevRows = [
			recurringRow({ publishDate: '2030-06-01T12:00:00.000Z' }),
			recurringRow({
				publishDate: '2030-06-08T12:00:00.000Z',
				seriesAnchorPublishDate: '2030-06-01T12:00:00.000Z'
			}),
			recurringRow({
				publishDate: '2030-06-15T12:00:00.000Z',
				seriesAnchorPublishDate: '2030-06-01T12:00:00.000Z'
			})
		];

		const out = buildOptimisticRecurringCalendarRows(
			prevRows,
			'2030-06-20T12:00:00.000Z',
			'2030-06-15',
			'2030-06-30'
		);

		expect(out.map((r) => r.publishDate)).toEqual([
			'2030-06-20T12:00:00.000Z',
			'2030-06-27T12:00:00.000Z'
		]);
		expect(out.every((r) => r.id === 'post-1')).toBe(true);
		expect(out[0]?.seriesAnchorPublishDate ?? null).toBeNull();
		expect(out[1]?.seriesAnchorPublishDate).toBe('2030-06-20T12:00:00.000Z');
	});

	it('keeps one anchor row per post id for multi-channel groups', () => {
		const prevRows = [
			recurringRow({ id: 'post-a', integrationId: 'int-a', publishDate: '2030-06-01T12:00:00.000Z' }),
			recurringRow({ id: 'post-b', integrationId: 'int-b', publishDate: '2030-06-01T12:00:00.000Z' })
		];

		const anchors = collapseRecurringGroupToAnchorRows(prevRows, '2030-06-10T12:00:00.000Z');
		expect(anchors).toHaveLength(2);
		expect(anchors.every((r) => r.publishDate === '2030-06-10T12:00:00.000Z')).toBe(true);

		const expanded = expandRecurringCalendarRowsForRange(
			anchors,
			'2030-06-10T00:00:00.000Z',
			'2030-06-24T23:59:59.999Z'
		);
		expect(expanded).toHaveLength(6);
	});
});
