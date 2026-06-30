export type ListingMarkdownBlock =
	| { type: 'heading'; level: number; text: string }
	| { type: 'paragraph'; text: string }
	| { type: 'ul'; items: string[] }
	| { type: 'ol'; items: string[] }
	| { type: 'table'; headers: string[]; rows: string[][] }
	| { type: 'code'; language: string; content: string }
	| { type: 'blockquote'; text: string }
	| { type: 'hr' };

function stripHtmlComments(markdown: string): string {
	return markdown.replace(/<!--[\s\S]*?-->/g, '');
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
