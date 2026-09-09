import { describe, expect, it } from 'vitest';

import {
	BLOG_PUBLIC_LIST_DEFAULT_PAGE_SIZE,
	buildBlogPublicListUrl,
	parseBlogPublicListPagination
} from './blogPublicListPagination';

describe('parseBlogPublicListPagination', () => {
	it('defaults page and items per page', () => {
		expect(parseBlogPublicListPagination(new URLSearchParams())).toEqual({
			page: 1,
			itemsPerPage: BLOG_PUBLIC_LIST_DEFAULT_PAGE_SIZE
		});
	});

	it('parses page and ipp from query params', () => {
		expect(parseBlogPublicListPagination(new URLSearchParams('page=3&ipp=24'))).toEqual({
			page: 3,
			itemsPerPage: 24
		});
	});

	it('clamps invalid values', () => {
		expect(parseBlogPublicListPagination(new URLSearchParams('page=0&ipp=abc'))).toEqual({
			page: 1,
			itemsPerPage: BLOG_PUBLIC_LIST_DEFAULT_PAGE_SIZE
		});
	});
});

describe('buildBlogPublicListUrl', () => {
	it('strips default page and ipp', () => {
		const href = buildBlogPublicListUrl('/blog', new URLSearchParams('page=1&ipp=12'), {});
		expect(href).toBe('/blog');
	});

	it('keeps non-default pagination params', () => {
		const href = buildBlogPublicListUrl('/blog', new URLSearchParams(), {
			page: '2',
			ipp: '24'
		});
		expect(href).toBe('/blog?page=2&ipp=24');
	});
});
