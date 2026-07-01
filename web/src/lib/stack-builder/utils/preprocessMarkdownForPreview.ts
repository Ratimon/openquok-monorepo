import { parse as parseYaml } from 'yaml';

const FRONTMATTER_PATTERN = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function escapeGfmCell(value: string): string {
	return value.replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim();
}

function formatScalar(value: unknown): string {
	if (value === null || value === undefined) return '';
	return escapeGfmCell(String(value));
}

function formatCellValue(value: unknown): string {
	if (value === null || value === undefined) return '';
	if (Array.isArray(value)) {
		return value
			.map((item) => {
				if (typeof item === 'string') return `\`${escapeGfmCell(item)}\``;
				return formatCellValue(item);
			})
			.join(', ');
	}
	if (typeof value === 'object') {
		return Object.entries(value as Record<string, unknown>)
			.map(([key, nested]) => `**${escapeGfmCell(key)}**: ${formatCellValue(nested)}`)
			.join('; ');
	}
	return formatScalar(value);
}

function formatFrontmatterTable(data: Record<string, unknown>): string {
	const rows = Object.entries(data).map(
		([key, value]) => `| **${escapeGfmCell(key)}** | ${formatCellValue(value)} |`
	);

	return ['| | |', '| --- | --- |', ...rows].join('\n');
}

/**
 * Convert leading YAML frontmatter into a GFM table for preview rendering.
 * The Write tab keeps the original markdown; only Carta render paths use this.
 */
export function preprocessMarkdownForPreview(markdown: string): string {
	const match = markdown.match(FRONTMATTER_PATTERN);
	if (!match) return markdown;

	let data: unknown;
	try {
		data = parseYaml(match[1]);
	} catch {
		return markdown;
	}

	if (!data || typeof data !== 'object' || Array.isArray(data)) {
		return markdown;
	}

	const table = formatFrontmatterTable(data as Record<string, unknown>);
	const body = markdown.slice(match[0].length).replace(/^\s+/, '');
	return `${table}\n\n${body}`;
}
