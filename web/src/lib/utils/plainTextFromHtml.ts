/**
 * Plain text derived from HTML for previews, snippets, and SEO meta (no DOM on the server).
 * Strips script/style blocks before tags so embedded markup does not leak into snippets.
 */
export function stripHtmlToPlainText(html: string): string {
	return html
		.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
		.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

/** Truncate plain text with an ellipsis for titles/descriptions/meta. */
export function truncatePlainText(s: string, maxChars: number): string {
	if (s.length <= maxChars) return s;
	return `${s.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}
