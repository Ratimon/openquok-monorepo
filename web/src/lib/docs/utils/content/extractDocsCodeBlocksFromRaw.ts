import { docsStepBodyToPlainText } from '$lib/docs/utils/content/docsStepBodyToPlainText';

export interface DocsCodeBlockFromRaw {
	index: number;
	language: string;
	text: string;
	name: string;
}

const FENCE_RE = /```([^\s`]*)\s*\r?\n([\s\S]*?)```/g;

const SKIP_LANGUAGES = new Set(['', 'text', 'txt', 'markdown', 'md', 'plaintext']);

function stripFrontmatter(raw: string): string {
	return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

function normalizeFenceLanguage(raw: string): string {
	return raw.trim().toLowerCase();
}

function findPrecedingSectionHeading(raw: string, fenceIndex: number): string | undefined {
	const before = raw.slice(0, fenceIndex);
	const candidates: { index: number; text: string }[] = [];

	for (const match of before.matchAll(/^#{2,4}\s+(.+)$/gm)) {
		if (match.index != null && match[1]) {
			candidates.push({ index: match.index, text: match[1] });
		}
	}

	candidates.sort((a, b) => a.index - b.index);
	const last = candidates.at(-1);
	if (!last?.text) return undefined;
	return docsStepBodyToPlainText(last.text);
}

function defaultCodeBlockName(index: number): string {
	return `Code example ${index + 1}`;
}

/**
 * Extract fenced code blocks from docs markdown for JSON-LD `SoftwareSourceCode`.
 * Skips non-source fences (`text`, bare fences, etc.).
 */
export function extractDocsCodeBlocksFromRaw(raw: string): DocsCodeBlockFromRaw[] {
	const body = stripFrontmatter(raw);
	const blocks: DocsCodeBlockFromRaw[] = [];
	let index = 0;

	for (const match of body.matchAll(FENCE_RE)) {
		const language = normalizeFenceLanguage(match[1] ?? '');
		if (SKIP_LANGUAGES.has(language)) continue;

		const text = (match[2] ?? '').replace(/\s+$/, '');
		if (!text.trim()) continue;

		const fenceIndex = match.index ?? 0;
		const sectionHeading = findPrecedingSectionHeading(body, fenceIndex);
		const name = sectionHeading?.trim() || defaultCodeBlockName(index);

		blocks.push({
			index,
			language: language || 'plaintext',
			text,
			name
		});
		index += 1;
	}

	return blocks;
}
