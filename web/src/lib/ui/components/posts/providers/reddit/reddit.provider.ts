import type {
	LaunchProviderCheckContext,
	LaunchProviderConfig,
	RedditLaunchProviderSettings
} from '$lib/ui/components/posts/providers/provider.types';

import {
	normalizeSubredditInput,
	redditCommunityValidationError
} from '$lib/utils/normalizeSubredditInput';

/** Reddit post body limit (matches backend `REDDIT_MAX_LENGTH`). */
export const REDDIT_MAX_CHARACTERS = 10000;
export const REDDIT_TITLE_MAX_LENGTH = 300;
export const REDDIT_TITLE_MIN_LENGTH = 1;

function readString(source: Record<string, unknown>, ...keys: string[]): string {
	for (const key of keys) {
		const value = source[key];
		if (typeof value === 'string' && value.trim()) return value.trim();
	}
	return '';
}

/** True when per-channel Settings fields are in use (strict validation applies). */
export function redditPerChannelSettingsActive(settings: RedditLaunchProviderSettings): boolean {
	if (settings.subreddit.trim()) return true;
	if (settings.title.trim()) return true;
	return false;
}

/** Reads Reddit settings from per-integration provider settings (flat CLI + nested bucket). */
export function readRedditLaunchSettings(
	settings: Record<string, unknown>
): RedditLaunchProviderSettings {
	const bucket = (settings as { reddit?: Partial<RedditLaunchProviderSettings> & Record<string, unknown> })
		.reddit;
	const source: Record<string, unknown> = {
		...settings,
		...(bucket && typeof bucket === 'object' ? bucket : {})
	};

	const nestedTitle = typeof bucket?.title === 'string' ? bucket.title.trim() : '';
	const flatTitle = typeof settings.title === 'string' ? settings.title.trim() : '';
	const title = nestedTitle || flatTitle;

	const subreddit = normalizeSubredditInput(readString(source, 'subreddit', 'community', 'sub'));

	return {
		subreddit,
		title
	};
}

export function checkRedditLaunchValidity(settings: RedditLaunchProviderSettings): true | string {
	if (!redditPerChannelSettingsActive(settings)) {
		return true;
	}

	if (!settings.subreddit.trim()) {
		return 'Reddit posts require r/name or u/name when Settings are in use';
	}
	const communityError = redditCommunityValidationError(settings.subreddit);
	if (communityError) return communityError;

	if (settings.title.trim().length < REDDIT_TITLE_MIN_LENGTH) {
		return 'Reddit posts require a title';
	}
	if (settings.title.length > REDDIT_TITLE_MAX_LENGTH) {
		return `Reddit titles must be at most ${REDDIT_TITLE_MAX_LENGTH} characters`;
	}
	return true;
}

function redditCheckContext(ctx: LaunchProviderCheckContext) {
	return readRedditLaunchSettings(ctx.settings);
}

export const redditProvider: LaunchProviderConfig = {
	id: 'reddit',
	maximumCharacters: REDDIT_MAX_CHARACTERS,
	minimumCharacters: 0,
	postComment: 'NONE',
	checkValidity: (ctx) => checkRedditLaunchValidity(redditCheckContext(ctx))
};
