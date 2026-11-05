import { describe, expect, it } from 'vitest';

import {
	buildAlternativesDetailUrl,
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

describe('buildAlternativesHubUrl', () => {
	const defaults = {
		category: DEFAULT_ALTERNATIVES_HUB_CATEGORY,
		sort: DEFAULT_ALTERNATIVES_HUB_SORT
	} as const;

	it('omits default category and sort from the query string', () => {
		expect(buildAlternativesHubUrl(defaults, {})).toBe('/alternatives');
	});

	it('includes non-default filters and preserves others', () => {
		expect(
			buildAlternativesHubUrl(defaults, { category: 'directory', sort: 'platforms_desc', search: 'launch' })
		).toBe('/alternatives?category=directory&sort=platforms_desc&search=launch');
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
