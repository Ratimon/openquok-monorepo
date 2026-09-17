import { describe, expect, it } from 'vitest';

import { UNTAGGED_POST_TAG_FILTER } from '$lib/posts/scheduler.types';

import type { CalendarPostRowViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

import {
	filterPostsByPostType,
	hasActiveCalendarToolbarFilters,
	hasNoPostTagNames,
	matchesTagFilters
} from './filters';

function row(overrides: Partial<CalendarPostRowViewModel> = {}): CalendarPostRowViewModel {
	return {
		id: 'post-1',
		postGroup: 'group-1',
		state: 'QUEUE',
		publishDate: '2030-06-01T12:00:00.000Z',
		organizationId: 'org-1',
		integrationId: 'int-1',
		content: 'hello',
		...overrides
	};
}

function selected(...names: string[]): Set<string> {
	return new Set(names.map((n) => n.trim().toLowerCase()).filter(Boolean));
}

describe('hasNoPostTagNames', () => {
	it('treats missing, empty, and whitespace-only names as untagged', () => {
		expect(hasNoPostTagNames(undefined)).toBe(true);
		expect(hasNoPostTagNames(null)).toBe(true);
		expect(hasNoPostTagNames([])).toBe(true);
		expect(hasNoPostTagNames(['', '  '])).toBe(true);
		expect(hasNoPostTagNames(['reels'])).toBe(false);
	});
});

describe('filterPostsByPostType', () => {
	it('shows non-repeating drafts when REPEATING and DRAFT are selected but PUBLISHED is not', () => {
		const posts = [
			row({ id: 'draft-plain', state: 'DRAFT' }),
			row({ id: 'draft-repeat', state: 'DRAFT', intervalInDays: 7 }),
			row({ id: 'pub-repeat', state: 'PUBLISHED', intervalInDays: 7 })
		];
		const out = filterPostsByPostType(posts, false, [
			'QUEUE',
			'DRAFT',
			'ERROR',
			'REPEATING'
		]);
		expect(out.map((p) => p.id).sort()).toEqual(['draft-plain', 'draft-repeat'].sort());
	});

	it('shows only repeating rows when REPEATING is the sole selected filter', () => {
		const posts = [
			row({ id: 'queue', state: 'QUEUE' }),
			row({ id: 'repeat', state: 'QUEUE', intervalInDays: 7 })
		];
		const out = filterPostsByPostType(posts, false, ['REPEATING']);
		expect(out.map((p) => p.id)).toEqual(['repeat']);
	});

	it('shows repeating and non-repeating rows for a selected DB state when REPEATING is off', () => {
		const posts = [
			row({ id: 'draft-plain', state: 'DRAFT' }),
			row({ id: 'draft-repeat', state: 'DRAFT', intervalInDays: 7 })
		];
		const out = filterPostsByPostType(posts, false, ['DRAFT']);
		expect(out.map((p) => p.id).sort()).toEqual(['draft-plain', 'draft-repeat'].sort());
	});
});

describe('matchesTagFilters', () => {
	it('matches only empty-tag rows when Untagged is selected', () => {
		const untaggedOnly = selected(UNTAGGED_POST_TAG_FILTER);
		expect(matchesTagFilters([], untaggedOnly)).toBe(true);
		expect(matchesTagFilters(['  '], untaggedOnly)).toBe(true);
		expect(matchesTagFilters(['reels'], untaggedOnly)).toBe(false);
		expect(matchesTagFilters(['reels', 'launch'], untaggedOnly)).toBe(false);
	});

	it('uses OR semantics when Untagged is combined with named tags', () => {
		const mixed = selected(UNTAGGED_POST_TAG_FILTER, 'reels');
		expect(matchesTagFilters([], mixed)).toBe(true);
		expect(matchesTagFilters(['reels'], mixed)).toBe(true);
		expect(matchesTagFilters(['REELS'], mixed)).toBe(true);
		expect(matchesTagFilters(['launch'], mixed)).toBe(false);
	});

	it('still matches named tags without the untagged sentinel', () => {
		const reels = selected('reels');
		expect(matchesTagFilters(['reels'], reels)).toBe(true);
		expect(matchesTagFilters([], reels)).toBe(false);
		expect(matchesTagFilters(['launch'], reels)).toBe(false);
	});
});

describe('hasActiveCalendarToolbarFilters', () => {
	const defaults = {
		allGroups: true,
		allSocialPlatforms: true,
		allPostStates: true,
		allTags: true
	};

	it('returns false when every toolbar filter is at the default show-all state', () => {
		expect(hasActiveCalendarToolbarFilters(defaults)).toBe(false);
	});

	it('returns true when any toolbar filter is narrowed', () => {
		expect(hasActiveCalendarToolbarFilters({ ...defaults, allGroups: false })).toBe(true);
		expect(hasActiveCalendarToolbarFilters({ ...defaults, allSocialPlatforms: false })).toBe(
			true
		);
		expect(hasActiveCalendarToolbarFilters({ ...defaults, allPostStates: false })).toBe(true);
		expect(hasActiveCalendarToolbarFilters({ ...defaults, allTags: false })).toBe(true);
	});
});
