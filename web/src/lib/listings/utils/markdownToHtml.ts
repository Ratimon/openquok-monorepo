import { inlineMarkdownToHtml } from '$lib/listings/utils/inlineMarkdown';
import { parseListingMarkdown } from '$lib/listings/utils/parseListingMarkdown';

/** Strip HTML comments (e.g. SPDX headers in imported SKILL.md) before rendering. */
function stripHtmlComments(markdown: string): string {
	return markdown.replace(/<!--[\s\S]*?-->/g, '');
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
