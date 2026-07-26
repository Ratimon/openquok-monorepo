/**
 * Plain text derived from HTML for previews, snippets, and SEO meta (no DOM on the server).
 * Strips script/style blocks before tags so embedded markup does not leak into snippets.
 * Preserves line breaks so provider previews and publish paths keep paragraph structure.
 */
export function stripHtmlToPlainText(html: string): string {
	return html
		.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
		.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<\/(?:p|div|li|h[1-6])>/gi, '\n')
		.replace(/<[^>]+>/g, '')
		.replace(/[ \t]+\n/g, '\n')
		.replace(/[ \t]{2,}/g, ' ')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

/** Truncate plain text with an ellipsis for titles/descriptions/meta. */
export function truncatePlainText(s: string, maxChars: number): string {
	if (s.length <= maxChars) return s;
	return `${s.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}
