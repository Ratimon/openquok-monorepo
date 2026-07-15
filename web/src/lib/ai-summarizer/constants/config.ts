/** Chrome Summarizer API setup guide shown in the unsupported modal state. */
export const SUMMARIZER_API_DOCS_URL = 'https://developer.chrome.com/docs/ai/summarizer-api';

/** localStorage key for soft opt-in before creating a Summarizer session / downloading the model. */
export const SUMMARIZER_SOFT_OPT_IN_STORAGE_KEY = 'ai-summarizer:soft-opt-in';

/**
 * Base summarization rules appended into every composer Summarizer `sharedContext`.
 * Character limits and target labels are added dynamically at session create.
 */
export const COMPOSER_SUMMARIZER_BASE_SHARED_CONTEXT =
	'Shorten the user’s social media post for the active composer target. Prefer clear, engaging plain text suitable for LinkedIn, X, and similar networks. Preserve the core message and call to action; cut filler, redundancy, and hashtag spam unless those are essential to the meaning.';

/** Soft upper bound for Summarizer `length: 'short'` (Global Edit / Threads-scale). */
export const COMPOSER_SUMMARIZER_LENGTH_SHORT_MAX_CHARS = 500;

/** Soft upper bound for Summarizer `length: 'medium'` (Instagram / TikTok-scale). */
export const COMPOSER_SUMMARIZER_LENGTH_MEDIUM_MAX_CHARS = 2200;

/** Defaults for shortening social posts in the composer AI Summarize modal. */
export const COMPOSER_SUMMARIZER_DEFAULTS = {
	type: 'tldr' as const,
	format: 'plain-text' as const,
	length: 'medium' as const,
	expectedInputLanguages: ['en'] as string[],
	expectedContextLanguages: ['en'] as string[],
	outputLanguage: 'en',
	sharedContext: COMPOSER_SUMMARIZER_BASE_SHARED_CONTEXT
};
