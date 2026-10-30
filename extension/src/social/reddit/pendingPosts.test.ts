import { describe, expect, it } from 'vitest';

import {
	buildRedditClipboardText,
	redditClipboardTextFromRow,
	redditHandoffSupportsOpenAutofill,
} from './pendingPosts.js';

describe('redditPendingPosts', () => {
	it('builds clipboard text with community, title, and body', () => {
		expect(
			buildRedditClipboardText({
				community: 'openquok',
				title: 'Hello',
				body: 'World',
			})
		).toBe('r/openquok\n\nHello\n\nWorld');
		expect(
			buildRedditClipboardText({ community: 'u/me', title: 'Hello', body: 'World' })
		).toBe('u/me\n\nHello\n\nWorld');
		expect(buildRedditClipboardText({ title: 'Hello', body: 'World' })).toBe('Hello\n\nWorld');
		expect(buildRedditClipboardText({ body: 'Caption only' })).toBe('Caption only');
	});

	it('builds clipboard text from calendar rows', () => {
		expect(
			redditClipboardTextFromRow({
				id: 'p1',
				state: 'AWAITING_MEMBER',
				publishDate: '2026-01-01T00:00:00.000Z',
				content: 'Body',
				title: 'Title',
				integrationId: null,
				providerIdentifier: 'reddit',
				channelName: null,
			})
		).toBe('Title\n\nBody');
		expect(
			redditClipboardTextFromRow({
				id: 'p2',
				state: 'AWAITING_MEMBER',
				publishDate: '2026-01-01T00:00:00.000Z',
				content: '<p>test 1</p>',
				title: null,
				integrationId: null,
				providerIdentifier: 'reddit',
				channelName: null,
				handoffSubreddit: 'openquok',
				handoffTitle: 'My title',
				handoffBody: 'Plain body',
				handoffMediaItems: [],
			})
		).toBe('r/openquok\n\nMy title\n\nPlain body');
	});

	it('allows open/autofill without subreddit (generic submit URL)', () => {
		expect(
			redditHandoffSupportsOpenAutofill({
				postId: 'p1',
				subreddit: 'r/test',
				title: 'T',
				body: 'B',
				mediaUrls: [],
				mediaItems: [],
			})
		).toBe(true);
		expect(
			redditHandoffSupportsOpenAutofill({
				postId: 'p1',
				subreddit: '',
				title: 'T',
				body: 'B',
				mediaUrls: [],
				mediaItems: [],
			})
		).toBe(true);
	});
});
