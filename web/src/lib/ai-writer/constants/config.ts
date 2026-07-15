/** Chrome Writer API setup guide shown in the unsupported modal state. */
export const WRITER_API_DOCS_URL = 'https://developer.chrome.com/docs/ai/writer-api';

/** Defaults for drafting social posts in the composer AI Writer modal. */
export const COMPOSER_WRITER_DEFAULTS = {
	format: 'plain-text' as const,
	tone: 'neutral' as const,
	length: 'medium' as const,
	expectedInputLanguages: ['en'] as string[],
	expectedContextLanguages: ['en'] as string[],
	outputLanguage: 'en',
	sharedContext:
		'Draft short social media posts for OpenQuok, a social publishing tool. Prefer clear, engaging plain text suitable for LinkedIn, X, and similar networks. Avoid hashtag spam unless the user asks for tags.'
};

export const COMPOSER_WRITER_SUGGESTIONS = [
	'Launch announcement',
	'Engagement question',
	'Product update',
	'Behind the scenes'
] as const;
