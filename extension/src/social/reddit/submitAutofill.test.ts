import { describe, expect, it } from 'vitest';

import { applyRedditHandoffAutofill } from './submitAutofill.js';
import { buildRedditSubmitPageUrl, isRedditSubmitLocation, normalizeSubredditName } from './submitUrls.js';

describe('redditSubmitUrls', () => {
	it('normalizes community names to r/ or u/', () => {
		expect(normalizeSubredditName('r/OpenQuok')).toBe('r/OpenQuok');
		expect(normalizeSubredditName('/test')).toBe('r/test');
		expect(normalizeSubredditName('u/wynne_wolf')).toBe('u/wynne_wolf');
	});

	it('builds text submit URLs with type and title', () => {
		const url = buildRedditSubmitPageUrl({
			subreddit: 'r/example',
			title: 'Hello world',
		});
		expect(url).toContain('/r/example/submit');
		expect(url).toContain('type=TEXT');
		expect(url).toContain('title=Hello');

		const profileUrl = buildRedditSubmitPageUrl({
			subreddit: 'u/wynne_wolf',
			title: 'Profile post',
		});
		expect(profileUrl).toContain('/user/wynne_wolf/submit');

		const genericUrl = buildRedditSubmitPageUrl({
			subreddit: '',
			title: 'Pick community on Reddit',
		});
		expect(genericUrl).toBe(
			'https://www.reddit.com/submit?type=TEXT&title=Pick+community+on+Reddit'
		);
	});

	it('detects submit pages', () => {
		expect(isRedditSubmitLocation('https://www.reddit.com/r/foo/submit')).toBe(true);
		expect(isRedditSubmitLocation('https://www.reddit.com/')).toBe(false);
	});
});

describe('applyRedditHandoffAutofill', () => {
	it('fills classic title and body fields', () => {
		document.body.innerHTML = `
			<input name="title" />
			<textarea name="text"></textarea>
		`;
		const title = document.querySelector<HTMLInputElement>('input[name="title"]')!;
		const body = document.querySelector<HTMLTextAreaElement>('textarea[name="text"]')!;

		const result = applyRedditHandoffAutofill(document, {
			postId: 'post-1',
			subreddit: 'r/test',
			title: 'My title',
			body: 'Body copy',
		});

		expect(result.ok).toBe(true);
		expect(title.value).toBe('My title');
		expect(body.value).toBe('Body copy');
		expect(document.getElementById('openquok-reddit-handoff-banner')).toBeTruthy();
	});
});
