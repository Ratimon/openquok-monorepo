import { describe, expect, it } from 'vitest';

import {
	formatRedditCommunityInput,
	normalizeSubredditFieldInput,
	normalizeSubredditInput,
	REDDIT_SUBREDDIT_MAX_LENGTH,
	subredditInputValidationError,
	subredditSlugForField,
	subredditSlugValidationError,
} from '$lib/utils/normalizeSubredditInput';

describe('normalizeSubredditInput', () => {
	it('canonicalizes r/, u/, and bare slugs', () => {
		expect(normalizeSubredditInput('  r/openquok  ')).toBe('r/openquok');
		expect(normalizeSubredditInput('/test')).toBe('r/test');
		expect(normalizeSubredditInput('u/wynne_wolf')).toBe('u/wynne_wolf');
		expect(normalizeSubredditInput('r/buildinpublic/')).toBe('r/buildinpublic');
		expect(normalizeSubredditInput('')).toBe('');
	});

	it('splits canonical and slug for the prefix field', () => {
		expect(normalizeSubredditFieldInput('r/buildinpublic/')).toEqual({
			canonical: 'r/buildinpublic',
			slug: 'buildinpublic',
		});
		expect(subredditSlugForField('r/buildinpublic/')).toBe('buildinpublic');
	});

	it('validates slug characters and length', () => {
		expect(subredditSlugValidationError('r/openquok')).toBeNull();
		expect(subredditSlugValidationError('bad-name')).toMatch(/valid name/);
		expect(subredditSlugValidationError('a'.repeat(REDDIT_SUBREDDIT_MAX_LENGTH + 1))).toMatch(
			/at most/
		);
	});

	it('allows empty input in settings', () => {
		expect(subredditInputValidationError('')).toBeNull();
		expect(subredditInputValidationError('   ')).toBeNull();
	});

	it('surfaces errors for non-empty invalid values', () => {
		expect(subredditInputValidationError('r/not!valid')).toMatch(/valid name/);
	});

	it('re-exports formatRedditCommunityInput', () => {
		expect(formatRedditCommunityInput('openquok')).toBe('r/openquok');
	});
});
