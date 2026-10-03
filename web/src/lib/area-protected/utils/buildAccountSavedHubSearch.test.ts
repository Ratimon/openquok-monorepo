import { describe, it, expect } from 'vitest';

import {
	buildAccountSavedBacklinksNavigationUrl,
	buildAccountSavedHubSearchParams,
	parseAccountSavedBacklinksFiltersFromUrl,
	parseAccountSavedLibsFiltersFromUrl,
	parseSavedBookmarkedFilter,
	parseSavedHubTab,
	parseSavedLibsSegment
} from '$lib/area-protected/utils/buildAccountSavedHubSearch';

describe('buildAccountSavedHubSearch', () => {
	describe('parseSavedHubTab', () => {
		it('defaults to libs', () => {
			expect(parseSavedHubTab(null)).toBe('libs');
			expect(parseSavedHubTab('libs')).toBe('libs');
		});

		it('parses backlinks', () => {
			expect(parseSavedHubTab('backlinks')).toBe('backlinks');
		});
	});

	describe('parseSavedLibsSegment', () => {
		it('reads libs param', () => {
			expect(parseSavedLibsSegment('libs', 'library')).toBe('library');
			expect(parseSavedLibsSegment('libs', 'browse')).toBe('browse');
		});

		it('maps legacy tab params', () => {
			expect(parseSavedLibsSegment('explore', null)).toBe('browse');
			expect(parseSavedLibsSegment('mine', null)).toBe('library');
		});

		it('defaults to browse', () => {
			expect(parseSavedLibsSegment(null, null)).toBe('browse');
		});
	});

	describe('parseSavedBookmarkedFilter', () => {
		it('accepts 1 and true', () => {
			expect(parseSavedBookmarkedFilter('1')).toBe(true);
			expect(parseSavedBookmarkedFilter('true')).toBe(true);
		});

		it('rejects other values', () => {
			expect(parseSavedBookmarkedFilter(null)).toBe(false);
			expect(parseSavedBookmarkedFilter('0')).toBe(false);
		});
	});

	describe('parseAccountSavedLibsFiltersFromUrl', () => {
		it('defaults when query is empty', () => {
			expect(parseAccountSavedLibsFiltersFromUrl(new URLSearchParams())).toEqual({
				search: '',
				category: null,
				tags: [],
				tagGroup: null,
				listingKind: 'all',
				sort: 'newest',
				extensionType: 'all'
			});
		});

		it('reads browse facet params', () => {
			const params = new URLSearchParams(
				'kind=stack&category=automation&tagGroup=use-case&tags=ai,agents&sort=popular&type=mcp&search=foo'
			);
			expect(parseAccountSavedLibsFiltersFromUrl(params)).toEqual({
				search: 'foo',
				category: 'automation',
				tags: ['ai', 'agents'],
				tagGroup: 'use-case',
				listingKind: 'stack',
				sort: 'popular',
				extensionType: 'mcp'
			});
		});
	});

	describe('parseAccountSavedBacklinksFiltersFromUrl', () => {
		it('defaults sort when query is empty', () => {
			expect(parseAccountSavedBacklinksFiltersFromUrl(new URLSearchParams()).sort).toBe('dr_desc');
		});

		it('reads category, tags, and facet params', () => {
			const params = new URLSearchParams(
				'tab=backlinks&category=directories&tags=saas&sort=visits_desc&search=crm&cost=free,paid&dofollow=dofollow&effort=easy&approval=instant&opportunityTypeSlugs=guest-post,listing'
			);
			expect(parseAccountSavedBacklinksFiltersFromUrl(params)).toEqual({
				sort: 'visits_desc',
				search: 'crm',
				category: 'directories',
				tags: ['saas'],
				costTiers: ['free', 'paid'],
				dofollow: ['dofollow'],
				effort: ['easy'],
				approvalMode: ['instant'],
				opportunityTypeSlugs: ['guest-post', 'listing']
			});
		});

		it('reads bookmarked filter', () => {
			const params = new URLSearchParams('tab=backlinks&bookmarked=1');
			expect(parseAccountSavedBacklinksFiltersFromUrl(params)).toEqual({
				sort: 'dr_desc',
				bookmarkedOnly: true
			});
		});
	});

	describe('buildAccountSavedHubSearchParams', () => {
		it('builds libs browse with bookmarked filter', () => {
			expect(
				buildAccountSavedHubSearchParams({
					tab: 'libs',
					libsSegment: 'browse',
					bookmarkedOnly: true
				})
			).toBe('tab=libs&bookmarked=1');
		});

		it('builds libs library segment', () => {
			expect(
				buildAccountSavedHubSearchParams({
					tab: 'libs',
					libsSegment: 'library'
				})
			).toBe('tab=libs&libs=library');
		});

		it('builds backlinks tab only', () => {
			expect(buildAccountSavedHubSearchParams({ tab: 'backlinks' })).toBe('tab=backlinks');
		});

		it('omits default libs filter values', () => {
			expect(
				buildAccountSavedHubSearchParams({
					tab: 'libs',
					libsFilters: {
						search: '',
						category: null,
						tags: [],
						tagGroup: null,
						listingKind: 'all',
						sort: 'newest',
						extensionType: 'all'
					}
				})
			).toBe('tab=libs');
		});

		it('serializes libs browse filters', () => {
			const search = buildAccountSavedHubSearchParams({
				tab: 'libs',
				libsSegment: 'browse',
				libsFilters: {
					listingKind: 'extension',
					category: 'devtools',
					tagGroup: 'stack',
					tags: ['mcp', 'skills'],
					sort: 'views',
					extensionType: 'official',
					search: 'openquok'
				}
			});
			const params = new URLSearchParams(search);
			expect(params.get('tab')).toBe('libs');
			expect(params.get('kind')).toBe('extension');
			expect(params.get('category')).toBe('devtools');
			expect(params.get('tagGroup')).toBe('stack');
			expect(params.get('tags')).toBe('mcp,skills');
			expect(params.get('sort')).toBe('views');
			expect(params.get('type')).toBe('official');
			expect(params.get('search')).toBe('openquok');
		});

		it('serializes backlinks filters', () => {
			const search = buildAccountSavedHubSearchParams({
				tab: 'backlinks',
				backlinksFilters: {
					sort: 'title_asc',
					search: 'news',
					category: 'media',
					tags: ['pr'],
					costTiers: ['freemium'],
					dofollow: ['nofollow'],
					effort: ['medium'],
					approvalMode: ['manual_review'],
					opportunityTypeSlugs: ['podcast']
				}
			});
			const params = new URLSearchParams(search);
			expect(params.get('tab')).toBe('backlinks');
			expect(params.get('sort')).toBe('title_asc');
			expect(params.get('search')).toBe('news');
			expect(params.get('category')).toBe('media');
			expect(params.get('tags')).toBe('pr');
			expect(params.get('cost')).toBe('freemium');
			expect(params.get('dofollow')).toBe('nofollow');
			expect(params.get('effort')).toBe('medium');
			expect(params.get('approval')).toBe('manual_review');
			expect(params.get('opportunityTypeSlugs')).toBe('podcast');
		});

		it('buildAccountSavedBacklinksNavigationUrl keeps tab and resets pagination on filter change', () => {
			const href = buildAccountSavedBacklinksNavigationUrl(
				'/account/saved',
				{ sort: 'dr_desc', category: 'media' },
				{ search: 'crm' }
			);
			const params = new URLSearchParams(href.split('?')[1] ?? '');
			expect(params.get('tab')).toBe('backlinks');
			expect(params.get('category')).toBe('media');
			expect(params.get('search')).toBe('crm');
			expect(params.get('page')).toBeNull();
		});

		it('buildAccountSavedBacklinksNavigationUrl can preserve pagination', () => {
			const preserve = new URLSearchParams('tab=backlinks&page=3&ipp=40');
			const href = buildAccountSavedBacklinksNavigationUrl(
				'/account/saved',
				{ sort: 'dr_desc' },
				{},
				{ preservePaginationFrom: preserve }
			);
			const params = new URLSearchParams(href.split('?')[1] ?? '');
			expect(params.get('page')).toBe('3');
			expect(params.get('ipp')).toBe('40');
		});

		it('round-trips libs filters through parse', () => {
			const built = buildAccountSavedHubSearchParams({
				tab: 'libs',
				bookmarkedOnly: true,
				libsFilters: {
					listingKind: 'stack',
					category: 'growth',
					tags: ['seo'],
					sort: 'oldest',
					extensionType: 'both',
					search: 'test'
				}
			});
			const parsed = parseAccountSavedLibsFiltersFromUrl(new URLSearchParams(built));
			expect(parsed).toMatchObject({
				listingKind: 'stack',
				category: 'growth',
				tags: ['seo'],
				sort: 'oldest',
				extensionType: 'both',
				search: 'test'
			});
			expect(parseSavedBookmarkedFilter(new URLSearchParams(built).get('bookmarked'))).toBe(true);
		});
	});
});
