import { describe, expect, it } from 'vitest';

import {
	buildHubListUrl,
	HUB_LIST_DEFAULT_PAGE_SIZE,
	paginateHubList,
	parseHubListPagination
} from '$lib/listings/utils/hubListPagination';

describe('parseHubListPagination', () => {
	it('defaults to page 1 and default page size', () => {
		expect(parseHubListPagination(new URLSearchParams())).toEqual({
			page: 1,
			itemsPerPage: HUB_LIST_DEFAULT_PAGE_SIZE
		});
	});

	it('parses page and ipp from query params', () => {
		expect(parseHubListPagination(new URLSearchParams('page=3&ipp=40'))).toEqual({
			page: 3,
			itemsPerPage: 40
		});
	});

	it('sanitizes invalid page and clamps ipp to at least 1', () => {
		expect(parseHubListPagination(new URLSearchParams('page=abc&ipp=-5'))).toEqual({
			page: 1,
			itemsPerPage: 5
		});
	});
});

describe('paginateHubList', () => {
	const items = Array.from({ length: 25 }, (_, index) => `item-${index + 1}`);

	it('returns the requested page slice and offset', () => {
		const result = paginateHubList(items, 2, 10);

		expect(result.page).toBe(2);
		expect(result.itemsPerPage).toBe(10);
		expect(result.count).toBe(25);
		expect(result.totalPages).toBe(3);
		expect(result.listOffset).toBe(10);
		expect(result.items).toEqual(items.slice(10, 20));
	});

	it('clamps page to the last page when out of range', () => {
		const result = paginateHubList(items, 99, 10);

		expect(result.page).toBe(3);
		expect(result.items).toEqual(items.slice(20, 25));
	});
});

describe('buildHubListUrl', () => {
	it('adds page and ipp query params', () => {
		const href = buildHubListUrl('/playbooks', new URLSearchParams('sort=popular'), {
			page: '2',
			ipp: '40'
		});

		expect(href).toBe('/playbooks?sort=popular&page=2&ipp=40');
	});

	it('removes default page and ipp values', () => {
		const href = buildHubListUrl('/playbooks', new URLSearchParams('page=1&ipp=20'), {
			page: '1',
			ipp: String(HUB_LIST_DEFAULT_PAGE_SIZE)
		});

		expect(href).toBe('/playbooks');
	});
});
