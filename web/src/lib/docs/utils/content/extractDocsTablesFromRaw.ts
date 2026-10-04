import { docsStepBodyToPlainText } from '$lib/docs/utils/content/docsStepBodyToPlainText';

export const DOCS_TABLE_SCROLL_CLASS = 'docs-table-scroll';

export type DocsTableFromRaw = {
	index: number;
	/** Section title from the nearest preceding h2–h4. */
	name: string;
	/** Plain-text grid (` | ` between cells, newline between rows) for JSON-LD `text`. */
	text: string;
};

export function docsTableAnchorId(index: number): string {
	return `doc-table-${index + 1}`;
}

export function docsTableNodeId(canonicalUrl: string, index: number): string {
	return `${canonicalUrl}#${docsTableAnchorId(index)}`;
}

function stripFrontmatter(raw: string): string {
	return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

function splitMarkdownTableRow(line: string): string[] | null {
	const trimmed = line.trim();
	if (!trimmed.includes('|')) return null;

	let rest = trimmed;
	if (rest.startsWith('|')) rest = rest.slice(1);
	if (rest.endsWith('|')) rest = rest.slice(0, -1);

	const cells = rest.split('|').map((cell) => cell.trim());
	if (cells.length < 2) return null;
	return cells;
}

function isMarkdownTableSeparator(cells: string[]): boolean {
	return cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s/g, '')));
}

function defaultTableName(index: number): string {
	return `Table ${index + 1}`;
}

function cellsToPlainText(cells: string[]): string {
	return cells
		.map((cell) =>
			docsStepBodyToPlainText(cell)
				.replace(/\s+/g, ' ')
				.trim()
		)
		.filter(Boolean)
		.join(' | ');
}

/**
 * Extract GitHub-flavored markdown tables from docs source for JSON-LD `Table`.
 * Skips pipe rows inside fenced code blocks.
 */
export function extractDocsTablesFromRaw(raw: string): DocsTableFromRaw[] {
	const body = stripFrontmatter(raw);
	const lines = body.split(/\r?\n/);
	const tables: DocsTableFromRaw[] = [];
	let lastHeading = '';
	let inFence = false;
	let index = 0;

	for (let i = 0; i < lines.length; i += 1) {
		const line = lines[i] ?? '';
		const trimmed = line.trim();

		if (trimmed.startsWith('```')) {
			inFence = !inFence;
			continue;
		}
		if (inFence) continue;

		const headingMatch = trimmed.match(/^#{2,4}\s+(.+)$/);
		if (headingMatch?.[1]) {
			lastHeading = docsStepBodyToPlainText(headingMatch[1]);
			continue;
		}

		const headerCells = splitMarkdownTableRow(line);
		const separatorCells = splitMarkdownTableRow(lines[i + 1] ?? '');
		if (!headerCells || !separatorCells || !isMarkdownTableSeparator(separatorCells)) {
			continue;
		}

		const rows: string[] = [];
		const headerText = cellsToPlainText(headerCells);
		if (headerText) rows.push(headerText);

		i += 2;
		while (i < lines.length) {
			const bodyLine = lines[i] ?? '';
			if (bodyLine.trim().startsWith('```')) break;
			const bodyCells = splitMarkdownTableRow(bodyLine);
			if (!bodyCells || isMarkdownTableSeparator(bodyCells)) break;
			const rowText = cellsToPlainText(bodyCells);
			if (rowText) rows.push(rowText);
			i += 1;
		}
		i -= 1;

		if (rows.length === 0) continue;

		tables.push({
			index,
			name: lastHeading.trim() || defaultTableName(index),
			text: rows.join('\n')
		});
		index += 1;
	}

	return tables;
}
