import {
	formatRedditCommunityInput,
	parseRedditCommunityInput,
	redditCommunityValidationError,
	redditSubmitPathForCommunity,
} from './redditCommunityTarget.js';

describe('redditCommunityTarget', () => {
	it('formats bare slugs as r/name', () => {
		expect(formatRedditCommunityInput('openquok')).toBe('r/openquok');
		expect(formatRedditCommunityInput('  /test  ')).toBe('r/test');
		expect(formatRedditCommunityInput('r/buildinpublic/')).toBe('r/buildinpublic');
		expect(formatRedditCommunityInput('r/buildinpublic/extra/')).toBe('r/buildinpublic');
	});

	it('preserves u/ prefix for profiles', () => {
		expect(formatRedditCommunityInput('u/wynne_wolf')).toBe('u/wynne_wolf');
		expect(formatRedditCommunityInput('U/Example')).toBe('u/Example');
	});

	it('parses kind from prefix', () => {
		expect(parseRedditCommunityInput('r/foo')).toEqual({ kind: 'subreddit', slug: 'foo' });
		expect(parseRedditCommunityInput('u/bar')).toEqual({ kind: 'user', slug: 'bar' });
	});

	it('validates slug characters', () => {
		expect(redditCommunityValidationError('r/not!valid')).toMatch(/valid name/);
		expect(redditCommunityValidationError('')).toBeNull();
	});

	it('builds submit paths for subreddit and profile', () => {
		expect(redditSubmitPathForCommunity('r/example')).toBe('/r/example/submit');
		expect(redditSubmitPathForCommunity('u/wynne_wolf')).toBe('/user/wynne_wolf/submit');
	});
});
