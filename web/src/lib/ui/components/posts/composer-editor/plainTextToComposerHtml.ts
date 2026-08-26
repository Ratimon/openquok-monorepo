const COMPOSER_HTML_TAG_RE = /<[a-z][\s\S]*>/i;

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

/**
 * Load legacy plain-text composer bodies into TipTap as paragraph HTML.
 * Already-HTML content is returned unchanged.
 */
export function plainTextToComposerHtml(text: string): string {
	const raw = typeof text === 'string' ? text : '';
	if (!raw.trim()) return '';
	if (COMPOSER_HTML_TAG_RE.test(raw)) return raw;

	const escaped = escapeHtml(raw);
	const paragraphs = escaped.split(/\n{2,}/);
	if (paragraphs.length === 1) {
		return `<p>${escaped.replace(/\n/g, '<br>')}</p>`;
	}
	return paragraphs.map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`).join('');
}
