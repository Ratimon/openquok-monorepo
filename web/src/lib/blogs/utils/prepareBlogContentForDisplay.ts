function decodeHtmlEntities(html: string): string {
	return html
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&#x27;/gi, "'");
}

function looksLikeHtml(text: string): boolean {
	return /<\/?[a-z][\s\S]*>/i.test(text);
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** Convert plain text (paragraphs separated by blank lines) into simple HTML. */
export function plainTextToBlogHtml(text: string): string {
	const blocks = text.split(/\n\n+/).map((block) => block.trim()).filter(Boolean);
	if (blocks.length === 0) return '';

	return blocks
		.map((block) => {
			const lines = block.split(/\n/).map((line) => escapeHtml(line.trim())).filter(Boolean);
			return `<p>${lines.join('<br>')}</p>`;
		})
		.join('');
}

/**
 * Repair content saved when raw HTML was pasted into the TipTap editor as plain text
 * (each tag line wrapped in `<p>&lt;...&gt;</p>`).
 */
export function repairDoubleEncodedBlogHtml(html: string): string {
	if (!html.includes('&lt;')) return html;

	let decoded = decodeHtmlEntities(html);
	if (decoded.includes('&lt;')) {
		decoded = decodeHtmlEntities(decoded);
	}
	return decoded;
}

/**
 * When authors paste plain text, section titles often become short `<p>` blocks.
 * Promote those to `<h2>` so typography styles apply. Skips content that already has headings.
 */
function promoteLikelySectionHeadings(html: string): string {
	if (/<h[1-6]\b/i.test(html)) return html;

	let isFirstParagraph = true;
	return html.replace(/<p>([^<]{1,100})<\/p>(\s*)<p>/gi, (match, title: string, gap: string) => {
		const text = title.trim();
		if (!text || text.length > 100) return match;

		if (isFirstParagraph) {
			isFirstParagraph = false;
			// Keep the opening subtitle/intro as a normal paragraph.
			if (text.length > 55 || /[.!?]$/.test(text)) return match;
		}

		return `<h2>${title}</h2>${gap}<p>`;
	});
}

/**
 * Promote short standalone CTA/callout lines into blockquotes for display.
 * This mainly repairs content that was drafted as plain text without explicitly
 * applying blockquote formatting in the editor.
 */
function promoteLikelyBlockquotes(html: string): string {
	if (/<blockquote\b/i.test(html)) return html;

	return html.replace(/<p>([^<]{1,180})<\/p>/gi, (match, text: string) => {
		const trimmed = text.trim();
		if (!trimmed) return match;
		const looksLikeCallout =
			/^(let|save)\b/i.test(trimmed) &&
			/[.!?]$/.test(trimmed) &&
			trimmed.length >= 24 &&
			trimmed.length <= 180;
		if (!looksLikeCallout) return match;
		return `<blockquote><p>${text}</p></blockquote>`;
	});
}

/**
 * Normalize blog post body for public rendering (SSR-safe).
 * - Decodes double-escaped HTML from bad paste/submit flows.
 * - Wraps plain text in paragraphs when no HTML tags are present.
 * - Promotes likely plain-text section titles to h2.
 */
export function prepareBlogContentForDisplay(content: string): string {
	const trimmed = content.trim();
	if (!trimmed) return '';

	let html = repairDoubleEncodedBlogHtml(trimmed);
	if (!looksLikeHtml(html)) {
		html = plainTextToBlogHtml(html);
	}
	html = promoteLikelySectionHeadings(html);
	html = promoteLikelyBlockquotes(html);
	return html;
}
