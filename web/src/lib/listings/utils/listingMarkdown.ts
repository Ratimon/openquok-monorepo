import { externalLinkRelForHref } from '$lib/utils/externalLinkRel';

export type InlineSegment =
	| { type: 'text'; text: string }
	| { type: 'bold'; text: string }
	| { type: 'em'; text: string }
	| { type: 'link'; label: string; href: string }
	| { type: 'code'; text: string; asBadge: boolean };

export type ListingMarkdownBlock =
	| { type: 'heading'; level: number; text: string }
	| { type: 'paragraph'; text: string }
	| { type: 'ul'; items: string[] }
	| { type: 'ol'; items: string[] }
	| { type: 'table'; headers: string[]; rows: string[][] }
	| { type: 'code'; language: string; content: string }
	| { type: 'blockquote'; text: string }
	| { type: 'hr' };

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function stripHtmlComments(markdown: string): string {
	return markdown.replace(/<!--[\s\S]*?-->/g, '');
}

/** CLI tokens, env vars, and API keys render as badge chips in listing bodies. */
export function inlineCodeShouldRenderAsBadge(code: string): boolean {
	const trimmed = code.trim();
	if (!trimmed) return false;
	if (/^opo_[\w-]+/i.test(trimmed)) return true;
	if (/^OPENQUOK_/i.test(trimmed)) return true;
	if (/^export\s+OPENQUOK_/i.test(trimmed)) return true;
	if (/^openquok\b/i.test(trimmed)) return true;
	if (/^(auth|posts|integrations|analytics|upload)[\w:-]*/i.test(trimmed)) return true;
	if (trimmed.includes(':') && !trimmed.includes(' ')) return true;
	return false;
}

const INLINE_PATTERN =
	/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

export function parseInlineMarkdown(text: string): InlineSegment[] {
	if (!text) return [];

	const segments: InlineSegment[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = INLINE_PATTERN.exec(text)) !== null) {
		if (match.index > lastIndex) {
			segments.push({ type: 'text', text: text.slice(lastIndex, match.index) });
		}

		const token = match[0];
		if (token.startsWith('**') && token.endsWith('**')) {
			segments.push({ type: 'bold', text: token.slice(2, -2) });
		} else if (token.startsWith('*') && token.endsWith('*')) {
			segments.push({ type: 'em', text: token.slice(1, -1) });
		} else if (token.startsWith('`') && token.endsWith('`')) {
			const codeText = token.slice(1, -1);
			segments.push({
				type: 'code',
				text: codeText,
				asBadge: inlineCodeShouldRenderAsBadge(codeText)
			});
		} else if (token.startsWith('[')) {
			const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
			if (linkMatch) {
				segments.push({ type: 'link', label: linkMatch[1], href: linkMatch[2] });
			} else {
				segments.push({ type: 'text', text: token });
			}
		} else {
			segments.push({ type: 'text', text: token });
		}

		lastIndex = match.index + token.length;
	}

	if (lastIndex < text.length) {
		segments.push({ type: 'text', text: text.slice(lastIndex) });
	}

	return segments;
}

export function inlineMarkdownToHtml(text: string): string {
	return parseInlineMarkdown(text)
		.map((segment) => {
			switch (segment.type) {
				case 'text':
					return escapeHtml(segment.text);
				case 'bold':
					return `<strong>${escapeHtml(segment.text)}</strong>`;
				case 'em':
					return `<em>${escapeHtml(segment.text)}</em>`;
				case 'code':
					return `<code>${escapeHtml(segment.text)}</code>`;
				case 'link': {
					const safeHref = segment.href.trim();
					if (!/^https?:\/\//i.test(safeHref)) {
						return escapeHtml(segment.label);
					}
					const rel = externalLinkRelForHref(safeHref);
					const relAttr = rel ? ` rel="${escapeHtml(rel)}"` : '';
					return `<a href="${escapeHtml(safeHref)}"${relAttr} target="_blank" class="font-medium text-primary underline decoration-primary/50 underline-offset-[3px] transition-colors hover:text-primary hover:decoration-primary">${escapeHtml(segment.label)}</a>`;
				}
				default:
					return '';
			}
		})
		.join('');
}

function isTableRow(line: string): boolean {
	const trimmed = line.trim();
	return trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|');
}

function isTableSeparator(line: string): boolean {
	return /^\|?[\s:-]+\|[\s|:-]*$/.test(line.trim());
}

function parseTableRow(line: string): string[] {
	return line
		.trim()
		.replace(/^\|/, '')
		.replace(/\|$/, '')
		.split('|')
		.map((cell) => cell.trim());
}

/**
 * Parse listing markdown (SKILL.md bodies, MCP about/README) into render blocks.
 * Supports headings, paragraphs, lists, tables, fenced code, blockquotes, and horizontal rules.
 */
export function parseListingMarkdown(markdown: string): ListingMarkdownBlock[] {
	const trimmed = stripHtmlComments(markdown).trim();
	if (!trimmed) return [];

	const lines = trimmed.split(/\r?\n/);
	const blocks: ListingMarkdownBlock[] = [];
	let listItems: string[] = [];
	let listOrdered = false;
	let inCode = false;
	let codeLanguage = '';
	let codeLines: string[] = [];

	const flushList = () => {
		if (listItems.length === 0) return;
		blocks.push(listOrdered ? { type: 'ol', items: [...listItems] } : { type: 'ul', items: [...listItems] });
		listItems = [];
		listOrdered = false;
	};

	const flushCode = () => {
		if (codeLines.length === 0) return;
		blocks.push({
			type: 'code',
			language: codeLanguage,
			content: codeLines.join('\n')
		});
		codeLines = [];
		codeLanguage = '';
	};

	for (let index = 0; index < lines.length; index += 1) {
		const rawLine = lines[index];
		const line = rawLine.trimEnd();

		if (line.startsWith('```')) {
			if (inCode) {
				inCode = false;
				flushCode();
			} else {
				flushList();
				inCode = true;
				codeLanguage = line.slice(3).trim();
			}
			continue;
		}

		if (inCode) {
			codeLines.push(rawLine);
			continue;
		}

		if (!line.trim()) {
			flushList();
			continue;
		}

		if (/^---+$/.test(line.trim())) {
			flushList();
			blocks.push({ type: 'hr' });
			continue;
		}

		const heading = line.match(/^(#{1,6})\s+(.+)$/);
		if (heading) {
			flushList();
			blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] });
			continue;
		}

		const blockquote = line.match(/^>\s?(.*)$/);
		if (blockquote) {
			flushList();
			blocks.push({ type: 'blockquote', text: blockquote[1] });
			continue;
		}

		if (isTableRow(line)) {
			const headers = parseTableRow(line);
			const separatorLine = lines[index + 1]?.trim() ?? '';
			if (isTableSeparator(separatorLine)) {
				flushList();
				const rows: string[][] = [];
				index += 2;
				while (index < lines.length && isTableRow(lines[index])) {
					rows.push(parseTableRow(lines[index]));
					index += 1;
				}
				index -= 1;
				blocks.push({ type: 'table', headers, rows });
				continue;
			}
		}

		const unorderedItem = line.match(/^[-*]\s+(.+)$/);
		if (unorderedItem) {
			if (listItems.length > 0 && listOrdered) flushList();
			listOrdered = false;
			listItems.push(unorderedItem[1]);
			continue;
		}

		const orderedItem = line.match(/^\d+\.\s+(.+)$/);
		if (orderedItem) {
			if (listItems.length > 0 && !listOrdered) flushList();
			listOrdered = true;
			listItems.push(orderedItem[1]);
			continue;
		}

		flushList();
		blocks.push({ type: 'paragraph', text: line });
	}

	flushList();
	flushCode();

	return blocks;
}

/** Minimal Markdown → HTML for listing bodies (headings, lists, tables, paragraphs, inline code/links). */
export function markdownToHtml(markdown: string): string {
	const trimmed = stripHtmlComments(markdown).trim();
	if (!trimmed) return '';
	if (/^<[a-z][\s\S]*>/i.test(trimmed)) {
		return trimmed;
	}

	const blocks = parseListingMarkdown(trimmed);
	const htmlParts: string[] = [];

	for (const block of blocks) {
		switch (block.type) {
			case 'heading':
				htmlParts.push(`<h${block.level}>${inlineMarkdownToHtml(block.text)}</h${block.level}>`);
				break;
			case 'paragraph':
				htmlParts.push(`<p>${inlineMarkdownToHtml(block.text)}</p>`);
				break;
			case 'ul':
				htmlParts.push(
					`<ul>${block.items.map((item) => `<li>${inlineMarkdownToHtml(item)}</li>`).join('')}</ul>`
				);
				break;
			case 'ol':
				htmlParts.push(
					`<ol>${block.items.map((item) => `<li>${inlineMarkdownToHtml(item)}</li>`).join('')}</ol>`
				);
				break;
			case 'table': {
				const head = block.headers
					.map((header) => `<th>${inlineMarkdownToHtml(header)}</th>`)
					.join('');
				const body = block.rows
					.map(
						(row) =>
							`<tr>${row.map((cell) => `<td>${inlineMarkdownToHtml(cell)}</td>`).join('')}</tr>`
					)
					.join('');
				htmlParts.push(`<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`);
				break;
			}
			case 'code':
				htmlParts.push(`<pre><code>${block.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`);
				break;
			case 'blockquote':
				htmlParts.push(`<blockquote><p>${inlineMarkdownToHtml(block.text)}</p></blockquote>`);
				break;
			case 'hr':
				htmlParts.push('<hr />');
				break;
			default:
				break;
		}
	}

	return htmlParts.join('\n');
}
