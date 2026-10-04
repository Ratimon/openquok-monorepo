import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';

export const BLOG_TABLE_SCROLL_CLASS = 'blog-table-scroll';

const BLOG_HEADING_BEFORE_TABLE_RE = /<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
const BLOG_TABLE_RE = /<table\b[^>]*>[\s\S]*?<\/table>/gi;

export type ParsedBlogHtmlTable = {
	index: number;
	/** Section title from the nearest preceding h2/h3. */
	name: string;
	/** Plain-text grid (` | ` between cells, newline between rows) for JSON-LD `text`. */
	text: string;
};

export function blogPostTableAnchorId(index: number): string {
	return `blog-table-${index + 1}`;
}

export function blogPostTableNodeId(canonicalUrl: string, index: number): string {
	return `${canonicalUrl}#${blogPostTableAnchorId(index)}`;
}

function resolveTableName(html: string, tableStart: number, index: number): string {
	const before = html.slice(0, tableStart);
	const headingRe = new RegExp(BLOG_HEADING_BEFORE_TABLE_RE.source, 'gi');
	let lastTitle = '';
	let headingMatch: RegExpExecArray | null;
	while ((headingMatch = headingRe.exec(before)) !== null) {
		lastTitle = stripHtmlToPlainText(headingMatch[2] ?? '').trim();
	}
	if (lastTitle) return lastTitle;
	return `Table ${index + 1}`;
}

function tableHtmlToPlainText(tableHtml: string): string {
	const rows: string[] = [];
	const trRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
	let trMatch: RegExpExecArray | null;
	while ((trMatch = trRe.exec(tableHtml)) !== null) {
		const cells: string[] = [];
		const cellRe = /<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi;
		let cellMatch: RegExpExecArray | null;
		while ((cellMatch = cellRe.exec(trMatch[1] ?? '')) !== null) {
			const text = stripHtmlToPlainText(cellMatch[1] ?? '')
				.replace(/\s+/g, ' ')
				.trim();
			if (text) cells.push(text);
		}
		if (cells.length > 0) rows.push(cells.join(' | '));
	}
	return rows.join('\n');
}

/** Parse CMS `<table>` blocks for Schema.org `Table` nodes. */
export function parseBlogHtmlTablesFromHtml(html: string): ParsedBlogHtmlTable[] {
	if (!html.trim() || !/<table\b/i.test(html)) return [];

	const tables: ParsedBlogHtmlTable[] = [];
	const re = new RegExp(BLOG_TABLE_RE.source, 'gi');
	let match: RegExpExecArray | null;
	let index = 0;

	while ((match = re.exec(html)) !== null) {
		tables.push({
			index,
			name: resolveTableName(html, match.index, index),
			text: tableHtmlToPlainText(match[0])
		});
		index += 1;
	}

	return tables;
}

/**
 * Wrap each table for overflow scroll and stamp a stable `id` that matches JSON-LD `@id` fragments.
 */
export function wrapBlogHtmlTablesForScroll(html: string): string {
	if (!/<table\b/i.test(html)) return html;

	const unwrapped = html.replace(
		new RegExp(
			`<div class="${BLOG_TABLE_SCROLL_CLASS}"(?:\\s+id="blog-table-\\d+")?>\\s*(<table\\b[\\s\\S]*?<\\/table>)\\s*<\\/div>`,
			'gi'
		),
		'$1'
	);
	let index = 0;
	return unwrapped.replace(new RegExp(BLOG_TABLE_RE.source, 'gi'), (tableHtml) => {
		const id = blogPostTableAnchorId(index);
		index += 1;
		return `<div class="${BLOG_TABLE_SCROLL_CLASS}" id="${id}">${tableHtml}</div>`;
	});
}
