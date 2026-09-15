import { describe, expect, it } from 'vitest';

import { UNTAGGED_POST_TAG_FILTER } from '$lib/posts/scheduler.types';

import { hasNoPostTagNames, matchesTagFilters } from './filters';

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
