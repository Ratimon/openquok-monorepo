/** Chrome Writer API setup guide shown in the unsupported modal state. */
export const WRITER_API_DOCS_URL = 'https://developer.chrome.com/docs/ai/writer-api';

/** Chrome Rewriter API setup guide (tone/length refine after a first draft). */
export const REWRITER_API_DOCS_URL = 'https://developer.chrome.com/docs/ai/rewriter-api';

/** localStorage key for soft opt-in before creating a Writer session / downloading the model. */
export const WRITER_SOFT_OPT_IN_STORAGE_KEY = 'ai-writer:soft-opt-in';

/** localStorage key for soft opt-in before first Rewriter tone/length refine. */
export const REWRITER_SOFT_OPT_IN_STORAGE_KEY = 'ai-writer:rewriter-soft-opt-in';

/**
 * Base drafting rules appended into every composer Writer `sharedContext`.
 * Character limits and target labels are added dynamically at session create.
 */
export const COMPOSER_WRITER_BASE_SHARED_CONTEXT =
	'Draft short social media posts for the user’s own product, brand, or topic. Prefer clear, engaging plain text suitable for LinkedIn, X, and similar networks. Avoid hashtag spam unless the user asks for tags. When the prompt is a generic topic (e.g. launch announcement), use neutral placeholders the user can customize — do not invent or name a specific company.';

/** Soft upper bound for Writer `length: 'short'` (Global Edit / Threads-scale). */
export const COMPOSER_WRITER_LENGTH_SHORT_MAX_CHARS = 500;

/** Soft upper bound for Writer `length: 'medium'` (Instagram / TikTok-scale). */
export const COMPOSER_WRITER_LENGTH_MEDIUM_MAX_CHARS = 2200;

/** Defaults for drafting social posts in the composer AI Writer modal. */
export const COMPOSER_WRITER_DEFAULTS = {
	format: 'plain-text' as const,
	tone: 'neutral' as const,
	length: 'medium' as const,
	expectedInputLanguages: ['en'] as string[],
	expectedContextLanguages: ['en'] as string[],
	outputLanguage: 'en',
	sharedContext: COMPOSER_WRITER_BASE_SHARED_CONTEXT
};

/**
 * Defaults for composer Rewriter sessions (relative tone/length refine).
 * `tone` / `length` are overridden per refine chip; languages mirror Writer.
 */
export const COMPOSER_REWRITER_DEFAULTS = {
	format: 'plain-text' as const,
	tone: 'as-is' as const,
	length: 'as-is' as const,
	expectedInputLanguages: ['en'] as string[],
	expectedContextLanguages: ['en'] as string[],
	outputLanguage: 'en'
};

export const COMPOSER_WRITER_SUGGESTIONS = [
	'Launch announcement',
	'Engagement question',
	'Product update',
	'Behind the scenes'
] as const;

/**
 * Post-draft refine chips for the Chrome Rewriter API.
 * Each action maps to create-time `tone` / `length` (immutable per session).
 */
export const COMPOSER_REWRITER_REFINE_ACTIONS = [
	{ id: 'more-casual', label: 'More casual', tone: 'more-casual', length: 'as-is' },
	{ id: 'more-formal', label: 'More formal', tone: 'more-formal', length: 'as-is' },
	{ id: 'shorter', label: 'Shorter', tone: 'as-is', length: 'shorter' },
	{ id: 'longer', label: 'Longer', tone: 'as-is', length: 'longer' }
] as const;

export type ComposerRewriterRefineAction =
	(typeof COMPOSER_REWRITER_REFINE_ACTIONS)[number];

export type ComposerRewriterRefineActionId = ComposerRewriterRefineAction['id'];
