import { describe, expect, it } from 'vitest';

import {
	buildAlternativesCategoryHubUrl,
	buildAlternativesDetailUrl,
	buildAlternativesHubNavigationUrl,
	buildAlternativesHubUrl,
	DEFAULT_ALTERNATIVES_HUB_CATEGORY,
	DEFAULT_ALTERNATIVES_HUB_SORT,
	parseAlternativesDetailFiltersFromUrl,
	parseAlternativesHubFiltersFromUrl
} from '$lib/content/constants/hubs/alternativesHubFilters';

describe('parseAlternativesHubFiltersFromUrl', () => {
	it('returns defaults when query is empty', () => {
		expect(parseAlternativesHubFiltersFromUrl(new URLSearchParams())).toEqual({
			category: DEFAULT_ALTERNATIVES_HUB_CATEGORY,
			sort: DEFAULT_ALTERNATIVES_HUB_SORT
		});
	});

	it('parses category, sort, and search', () => {
		const params = new URLSearchParams({
			category: 'social',
			sort: 'price_asc',
			search: '  buffer  '
		});
		expect(parseAlternativesHubFiltersFromUrl(params)).toEqual({
			category: 'social',
			sort: 'price_asc',
			search: 'buffer'
		});
	});

	it('falls back to defaults for unknown enum values', () => {
		const params = new URLSearchParams({ category: 'invalid', sort: 'invalid' });
		expect(parseAlternativesHubFiltersFromUrl(params)).toEqual({
			category: DEFAULT_ALTERNATIVES_HUB_CATEGORY,
			sort: DEFAULT_ALTERNATIVES_HUB_SORT
		});
	});
});

describe('buildAlternativesHubNavigationUrl', () => {
	const defaults = {
		category: DEFAULT_ALTERNATIVES_HUB_CATEGORY,
		sort: DEFAULT_ALTERNATIVES_HUB_SORT
	} as const;

	it('routes social and directory picks to category hubs', () => {
		expect(buildAlternativesHubNavigationUrl(defaults, { category: 'social' })).toBe(
			'/alternatives/categories/social-scheduler'
		);
		expect(
			buildAlternativesHubNavigationUrl(
				{ ...defaults, sort: 'price_asc', search: 'buffer' },
				{ category: 'directory' }
			)
		).toBe('/alternatives/categories/directory-submission?sort=price_asc&search=buffer');
	});

	it('keeps sort and search on the main hub when category is all', () => {
		expect(
			buildAlternativesHubNavigationUrl(defaults, { sort: 'platforms_desc', search: 'hootsuite' })
		).toBe('/alternatives?sort=platforms_desc&search=hootsuite');
	});
});

describe('buildAlternativesCategoryHubUrl', () => {
	const socialFilters = {
		category: 'social' as const,
		sort: DEFAULT_ALTERNATIVES_HUB_SORT
	};

	it('builds path-scoped URLs without category query', () => {
		expect(buildAlternativesCategoryHubUrl('social-scheduler', socialFilters, {})).toBe(
			'/alternatives/categories/social-scheduler'
		);
	});

	it('keeps sort and search query params', () => {
		expect(
			buildAlternativesCategoryHubUrl(
				'directory-submission',
				socialFilters,
				{ sort: 'price_asc', search: 'boring' }
			)
		).toBe('/alternatives/categories/directory-submission?sort=price_asc&search=boring');
	});
});

describe('buildAlternativesHubUrl', () => {
	const defaults = {
		category: DEFAULT_ALTERNATIVES_HUB_CATEGORY,
		sort: DEFAULT_ALTERNATIVES_HUB_SORT
	} as const;

	it('omits default category and sort from the query string', () => {
		expect(buildAlternativesHubUrl(defaults, {})).toBe('/alternatives');
	});

	it('omits category query params on the main hub', () => {
		expect(
			buildAlternativesHubUrl(
				{ ...defaults, category: 'directory' },
				{ sort: 'platforms_desc', search: 'launch' }
			)
		).toBe('/alternatives?sort=platforms_desc&search=launch');
	});

	it('clears search when override is undefined', () => {
		expect(
			buildAlternativesHubUrl({ ...defaults, search: 'buffer' }, { search: undefined })
		).toBe('/alternatives');
	});
});

describe('parseAlternativesDetailFiltersFromUrl', () => {
	it('defaults sort to name A–Z', () => {
		expect(parseAlternativesDetailFiltersFromUrl(new URLSearchParams())).toEqual({
			sort: DEFAULT_ALTERNATIVES_HUB_SORT
		});
	});

	it('parses sort query', () => {
		expect(
			parseAlternativesDetailFiltersFromUrl(new URLSearchParams({ sort: 'price_asc' }))
		).toEqual({ sort: 'price_asc' });
	});
});

describe('buildAlternativesDetailUrl', () => {
	it('omits sort when default', () => {
		expect(buildAlternativesDetailUrl('openquok', { sort: DEFAULT_ALTERNATIVES_HUB_SORT }, {})).toBe(
			'/alternatives/openquok'
		);
	});

	it('includes non-default sort', () => {
		expect(
			buildAlternativesDetailUrl('openquok', { sort: DEFAULT_ALTERNATIVES_HUB_SORT }, { sort: 'price_asc' })
		).toBe('/alternatives/openquok?sort=price_asc');
	});
});
