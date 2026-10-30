/** Runtime messages (side panel / background). */
export const REDDIT_HANDOFF_RUNTIME_MESSAGE = {
	OPEN_SUBMIT_TAB: 'OPENQUOK_REDDIT_HANDOFF_OPEN_SUBMIT_TAB',
	AUTOFILL_SUBMIT: 'OPENQUOK_REDDIT_HANDOFF_AUTOFILL_SUBMIT',
} as const;

/** Content-script messages (tabs.sendMessage). */
export const REDDIT_HANDOFF_CONTENT_MESSAGE = {
	AUTOFILL: 'OPENQUOK_REDDIT_HANDOFF_AUTOFILL',
} as const;

export const REDDIT_PENDING_HANDOFF_STORAGE_KEY = 'openquok.redditPendingHandoff';

/** Location hash marker: `#openquok_handoff=<postId>` */
export const REDDIT_HANDOFF_HASH_PREFIX = 'openquok_handoff=';

export type RedditHandoffFillPayload = {
	postId: string;
	title: string;
	body: string;
	subreddit: string;
	mediaUrls: string[];
	mediaItems: RedditHandoffMediaItem[];
};

export type RedditHandoffMediaItem = {
	id: string;
	fileName: string;
};
