import { describe, it, expect } from 'vitest';

import {
	buildAccountSavedHubSearchParams,
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
	});
});
