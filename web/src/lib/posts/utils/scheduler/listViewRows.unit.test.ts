import { describe, expect, it } from 'vitest';

import type { SchedulerCalendarEvent } from '$lib/posts/scheduler.types';

import {
	formatDateSectionHeader,
	groupRowsByDate,
	LIST_VIEW_NO_DATE_KEY,
	LIST_VIEW_PAGE_SIZE,
	normalizeRowsFromEvents,
	paginateRows,
	resolveListViewEmptyMessage,
	sortListRows,
	type ListViewRow
} from './listViewRows';

function row(overrides: Partial<ListViewRow> & Pick<ListViewRow, 'postGroup'>): ListViewRow {
	return {
		content: 'Hello',
		chipTagColor: '#6366f1',
		...overrides
	};
}

function eventFromSummary(
	summary: NonNullable<SchedulerCalendarEvent['slotSummary']>[number]
): SchedulerCalendarEvent {
	return {
		id: summary.postId,
		title: summary.channelName,
		start: summary.publishDate,
		end: summary.publishDate,
		slotSummary: [summary]
	} as SchedulerCalendarEvent;
}

describe('normalizeRowsFromEvents', () => {
	it('includes past published rows instead of dropping them as non-upcoming', () => {
		const pastIso = '2020-01-01T12:00:00.000Z';
		const events = [
			eventFromSummary({
				postId: 'past-1',
				postGroup: 'group-past',
				integrationId: 'int-1',
				state: 'PUBLISHED',
				publishDate: pastIso,
				content: 'Old post',
				channelPicture: '',
				channelName: 'Channel',
				channelIdentifier: 'x'
			})
		];

		const rows = normalizeRowsFromEvents(events);
		expect(rows).toHaveLength(1);
		expect(rows[0]?.publishDateIso).toBe(pastIso);
		expect(rows[0]?.state).toBe('PUBLISHED');
	});

	it('includes past-due draft and scheduled rows for audit use cases', () => {
		const pastIso = '2019-06-01T09:00:00.000Z';
		const events = [
			eventFromSummary({
				postId: 'draft-1',
				postGroup: 'group-draft',
				integrationId: 'int-1',
				state: 'DRAFT',
				publishDate: pastIso,
				content: 'Stale draft',
				channelPicture: '',
				channelName: 'Channel',
				channelIdentifier: 'x'
			}),
			eventFromSummary({
				postId: 'queue-1',
				postGroup: 'group-queue',
				integrationId: 'int-2',
				state: 'QUEUE',
				publishDate: pastIso,
				content: 'Missed slot',
				channelPicture: '',
				channelName: 'Channel',
				channelIdentifier: 'y'
			})
		];

		const rows = normalizeRowsFromEvents(events);
		expect(rows).toHaveLength(2);
		expect(rows.map((r) => r.state).sort()).toEqual(['DRAFT', 'QUEUE']);
		expect(rows.every((r) => r.publishDateIso === pastIso)).toBe(true);
	});

	it('deduplicates slot summaries that share the same post id', () => {
		const summary = {
			postId: 'dup-1',
			postGroup: 'group-dup',
			integrationId: 'int-1',
			state: 'QUEUE',
			publishDate: '2030-06-01T12:00:00.000Z',
			content: 'First',
			channelPicture: '',
			channelName: 'Channel',
			channelIdentifier: 'x'
		};
		const events = [
			{ ...eventFromSummary(summary), slotSummary: [summary, summary] } as SchedulerCalendarEvent
		];

		expect(normalizeRowsFromEvents(events)).toHaveLength(1);
	});
});

describe('sortListRows', () => {
	it('sorts by publish date ascending and puts undated rows last', () => {
		const sorted = sortListRows([
			row({ postGroup: 'undated', publishDateIso: undefined }),
			row({ postGroup: 'later', publishDateIso: '2030-06-02T12:00:00.000Z' }),
			row({ postGroup: 'earlier', publishDateIso: '2030-06-01T12:00:00.000Z' })
		]);

		expect(sorted.map((r) => r.postGroup)).toEqual(['earlier', 'later', 'undated']);
	});
});

describe('groupRowsByDate', () => {
	it('groups rows under local date headers with undated rows last', () => {
		const groups = groupRowsByDate([
			row({ postGroup: 'no-date' }),
			row({ postGroup: 'a', publishDateIso: '2030-06-01T12:00:00.000Z' }),
			row({ postGroup: 'b', publishDateIso: '2030-06-01T15:00:00.000Z' })
		]);

		expect(groups).toHaveLength(2);
		expect(groups[0]?.dateKey).not.toBe(LIST_VIEW_NO_DATE_KEY);
		expect(groups[0]?.rows).toHaveLength(2);
		expect(groups[1]?.dateKey).toBe(LIST_VIEW_NO_DATE_KEY);
		expect(groups[1]?.label).toBe(formatDateSectionHeader(LIST_VIEW_NO_DATE_KEY));
	});

	it('orders date sections chronologically before the no-date bucket', () => {
		const groups = groupRowsByDate([
			row({ postGroup: 'later', publishDateIso: '2030-06-03T12:00:00.000Z' }),
			row({ postGroup: 'undated' }),
			row({ postGroup: 'earlier', publishDateIso: '2030-06-01T12:00:00.000Z' })
		]);

		expect(groups.map((g) => g.dateKey)).toEqual([
			'2030-06-01',
			'2030-06-03',
			LIST_VIEW_NO_DATE_KEY
		]);
	});
});

describe('paginateRows', () => {
	it('returns 100 rows per page with stable range labels', () => {
		const rows = Array.from({ length: 150 }, (_, i) =>
			row({ postGroup: `post-${i}`, publishDateIso: `2030-06-01T${String(i).padStart(2, '0')}:00:00.000Z` })
		);

		const firstPage = paginateRows(rows, 0, LIST_VIEW_PAGE_SIZE);
		expect(firstPage.rows).toHaveLength(100);
		expect(firstPage.rangeStart).toBe(1);
		expect(firstPage.rangeEnd).toBe(100);
		expect(firstPage.pageCount).toBe(2);

		const secondPage = paginateRows(rows, 1, LIST_VIEW_PAGE_SIZE);
		expect(secondPage.rows).toHaveLength(50);
		expect(secondPage.rangeStart).toBe(101);
		expect(secondPage.rangeEnd).toBe(150);
	});

	it('returns empty pagination metadata when there are no rows', () => {
		const page = paginateRows([], 0, LIST_VIEW_PAGE_SIZE);
		expect(page.rows).toHaveLength(0);
		expect(page.totalCount).toBe(0);
		expect(page.rangeStart).toBe(0);
		expect(page.rangeEnd).toBe(0);
		expect(page.pageIndex).toBe(0);
		expect(page.pageCount).toBe(1);
	});

	it('clamps out-of-range page indices to the last page', () => {
		const rows = [row({ postGroup: 'only-one' })];
		const page = paginateRows(rows, 99, LIST_VIEW_PAGE_SIZE);
		expect(page.pageIndex).toBe(0);
		expect(page.rows).toHaveLength(1);
	});
});

describe('resolveListViewEmptyMessage', () => {
	it('distinguishes filtered-empty from window-empty copy', () => {
		expect(resolveListViewEmptyMessage(0, 0)).toBe('No posts in this date range');
		expect(resolveListViewEmptyMessage(0, 5)).toBe('No posts match your filters');
		expect(resolveListViewEmptyMessage(3, 0)).toBeNull();
	});
});
