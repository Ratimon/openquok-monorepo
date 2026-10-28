import { describe, expect, it } from 'vitest';

import { isRedditSubmitTabUrl } from './redditTabUrls.js';

describe('redditTabUrls', () => {
	it('detects submit tabs on apex and www hosts', () => {
		expect(isRedditSubmitTabUrl('https://reddit.com/user/wynne_wolf/submit/')).toBe(true);
		expect(isRedditSubmitTabUrl('https://www.reddit.com/r/foo/submit')).toBe(true);
		expect(isRedditSubmitTabUrl('https://www.reddit.com/')).toBe(false);
	});
});
