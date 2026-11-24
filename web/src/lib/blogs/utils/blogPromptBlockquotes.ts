import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';

const BLOG_HEADING_BEFORE_BLOCKQUOTE_RE = /<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
const BLOG_BLOCKQUOTE_RE = /<blockquote\b([^>]*)>([\s\S]*?)<\/blockquote>/gi;

export type ParsedBlogPromptBlockquote = {
	index: number;
	/** Section title from the nearest preceding h2/h3. */
	name: string;
	/** Plain-text prompt for JSON-LD `text`. */
	text: string;
};

export function blogPostPromptAnchorId(index: number): string {
	return `blog-prompt-${index + 1}`;
}

export function blogPostPromptNodeId(canonicalUrl: string, index: number): string {
	return `${canonicalUrl}#${blogPostPromptAnchorId(index)}`;
}

function resolvePromptName(html: string, blockquoteStart: number, index: number): string {
	const before = html.slice(0, blockquoteStart);
	const headingRe = new RegExp(BLOG_HEADING_BEFORE_BLOCKQUOTE_RE.source, 'gi');
	let lastTitle = '';
	let headingMatch: RegExpExecArray | null;
	while ((headingMatch = headingRe.exec(before)) !== null) {
		lastTitle = stripHtmlToPlainText(headingMatch[2] ?? '').trim();
	}
	if (lastTitle) return lastTitle;
	return `Agent prompt ${index + 1}`;
}

/** Parse CMS `<blockquote>` blocks for Schema.org `CreativeWork` agent-prompt nodes. */
export function parseBlogPromptBlockquotesFromHtml(html: string): ParsedBlogPromptBlockquote[] {
	if (!html.trim() || !/<blockquote\b/i.test(html)) return [];

	const blocks: ParsedBlogPromptBlockquote[] = [];
	const re = new RegExp(BLOG_BLOCKQUOTE_RE.source, 'gi');
	let match: RegExpExecArray | null;
	let index = 0;

	while ((match = re.exec(html)) !== null) {
		const innerHtml = match[2] ?? '';
		const text = stripHtmlToPlainText(innerHtml).trim();
		if (!text) continue;

		blocks.push({
			index,
			name: resolvePromptName(html, match.index, index),
			text
		});
		index += 1;
	}

	return blocks;
}

/**
 * Stamp stable `id` attributes on blockquotes so JSON-LD `cssSelector` matches public HTML.
 */
export function stampBlogPromptBlockquoteIds(html: string): string {
	if (!/<blockquote\b/i.test(html)) return html;

	let index = 0;
	return html.replace(new RegExp(BLOG_BLOCKQUOTE_RE.source, 'gi'), (_full, attrs: string, inner: string) => {
		const id = blogPostPromptAnchorId(index);
		index += 1;
		const withoutId = attrs.replace(/\s*\bid\s*=\s*["'][^"']*["']/gi, '');
		const trimmedAttrs = withoutId.trim();
		const attrPrefix = trimmedAttrs ? ` ${trimmedAttrs}` : '';
		return `<blockquote id="${id}"${attrPrefix}>${inner}</blockquote>`;
	});
}