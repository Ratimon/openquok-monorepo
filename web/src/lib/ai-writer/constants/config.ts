/** Chrome Writer API setup guide shown in the unsupported modal state. */
export const WRITER_API_DOCS_URL = 'https://developer.chrome.com/docs/ai/writer-api';

/** localStorage key for soft opt-in before creating a Writer session / downloading the model. */
export const WRITER_SOFT_OPT_IN_STORAGE_KEY = 'ai-writer:soft-opt-in';

/** Defaults for drafting social posts in the composer AI Writer modal. */
export const COMPOSER_WRITER_DEFAULTS = {
	format: 'plain-text' as const,
	tone: 'neutral' as const,
	length: 'medium' as const,
	expectedInputLanguages: ['en'] as string[],
	expectedContextLanguages: ['en'] as string[],
	outputLanguage: 'en',
	sharedContext:
		'Draft short social media posts for the user’s own product, brand, or topic. Prefer clear, engaging plain text suitable for LinkedIn, X, and similar networks. Avoid hashtag spam unless the user asks for tags. When the prompt is a generic topic (e.g. launch announcement), use neutral placeholders the user can customize — do not invent or name a specific company.'
};

export const COMPOSER_WRITER_SUGGESTIONS = [
	'Launch announcement',
	'Engagement question',
	'Product update',
	'Behind the scenes'
] as const;
