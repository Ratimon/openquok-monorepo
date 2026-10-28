import {
	formatRedditCommunityInput,
	redditSubmitPathForCommunity,
} from 'openquok-common';

import type { RedditHandoffFillPayload } from './handoffProtocol.js';

export function normalizeSubredditName(raw: string): string {
	return formatRedditCommunityInput(raw);
}

export function buildRedditSubmitPageUrl(
	payload: Pick<RedditHandoffFillPayload, 'subreddit' | 'title'>
): string {
	const canonical = formatRedditCommunityInput(payload.subreddit);
	if (!canonical) {
		const url = new URL('https://www.reddit.com/submit');
		url.searchParams.set('type', 'TEXT');
		const title = payload.title.trim();
		if (title) {
			url.searchParams.set('title', title.slice(0, 300));
		}
		return url.toString();
	}
	const path = redditSubmitPathForCommunity(canonical);
	if (!path) {
		return 'https://www.reddit.com/submit';
	}
	const url = new URL(`https://www.reddit.com${path}`);
	url.searchParams.set('type', 'TEXT');
	const title = payload.title.trim();
	if (title) {
		url.searchParams.set('title', title.slice(0, 300));
	}
	return url.toString();
}

export function isRedditSubmitLocation(href: string): boolean {
	try {
		const url = new URL(href);
		if (!url.hostname.endsWith('reddit.com')) return false;
		return url.pathname.includes('/submit');
	} catch {
		return false;
	}
}
