import { docsStepBodyToPlainText } from '$lib/docs/utils/docsStepBodyToPlainText';

export interface DocsHowToStep {
	name: string;
	text: string;
}

export interface DocsHowToBlock {
	name: string;
	description?: string;
	steps: DocsHowToStep[];
}

const STEPS_BLOCK_RE = /<Steps\b([^>]*)>([\s\S]*?)<\/Steps>/gi;
const STEP_HEADING_RE = /^(#{3,4})\s+(.+)$/;

function parseFrontmatter(raw: string): { title?: string; description?: string } {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match?.[1]) return {};
	const title = match[1].match(/^title:\s*(.+)$/m)?.[1]?.trim().replace(/^['"](.*)['"]$/, '$1');
	const description = match[1]
		.match(/^description:\s*(.+)$/m)?.[1]
		?.trim()
		.replace(/^['"](.*)['"]$/, '$1');
	return { title, description };
}

function cleanSectionHeading(heading: string): string {
	return heading.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

function parseMdxAttributes(attrString: string): Record<string, string> {
	const attrs: Record<string, string> = {};
	const re = /(\w+)=(?:"([^"]*)"|'([^']*)')/g;
	for (const match of attrString.matchAll(re)) {
		attrs[match[1]!] = match[2] ?? match[3] ?? '';
	}
	return attrs;
}

function findPrecedingSectionHeading(raw: string, stepsIndex: number): string | undefined {
	const before = raw.slice(0, stepsIndex);
	const candidates: { index: number; text: string }[] = [];

	for (const match of before.matchAll(/^##\s+(.+)$/gm)) {
		if (match.index != null && match[1]) {
			candidates.push({ index: match.index, text: match[1] });
		}
	}
	for (const match of before.matchAll(/<h2[^>]*>([^<]+)<\/h2>/gi)) {
		if (match.index != null && match[1]) {
			candidates.push({ index: match.index, text: match[1] });
		}
	}

	candidates.sort((a, b) => a.index - b.index);
	const last = candidates.at(-1);
	if (!last?.text) return undefined;
	return docsStepBodyToPlainText(last.text);
}

function parseStepsFromBlock(inner: string): DocsHowToStep[] {
	const steps: DocsHowToStep[] = [];
	let currentName: string | null = null;
	let currentBody: string[] = [];

	const flush = () => {
		if (!currentName) return;
		const name = docsStepBodyToPlainText(currentName);
		const text = docsStepBodyToPlainText(currentBody.join('\n'));
		if (name && text) {
			steps.push({ name, text });
		}
		currentName = null;
		currentBody = [];
	};

	for (const line of inner.split(/\r?\n/)) {
		const heading = STEP_HEADING_RE.exec(line);
		if (heading) {
			flush();
			currentName = heading[2] ?? '';
			continue;
		}
		if (currentName) {
			currentBody.push(line);
		}
	}

	flush();
	return steps;
}

/**
 * Extract HowTo blocks from docs markdown for JSON-LD.
 * Reads `<Steps howToName="…" howToDescription="…">` and `###` / `####` step headings.
 * Falls back to the nearest preceding `##` section title when `howToName` is omitted.
 */
export function extractDocsHowToBlocksFromRaw(raw: string): DocsHowToBlock[] {
	const blocks: DocsHowToBlock[] = [];
	const { title: pageTitle, description: pageDescription } = parseFrontmatter(raw);

	for (const match of raw.matchAll(STEPS_BLOCK_RE)) {
		const attrs = parseMdxAttributes(match[1] ?? '');
		const inner = match[2] ?? '';
		const steps = parseStepsFromBlock(inner);
		if (steps.length === 0) continue;

		const sectionHeading = findPrecedingSectionHeading(raw, match.index ?? 0);
		const name =
			(attrs.howToName ?? attrs.name)?.trim() ||
			(sectionHeading ? cleanSectionHeading(sectionHeading) : '') ||
			pageTitle?.trim() ||
			'';
		if (!name) continue;

		const description =
			(attrs.howToDescription ?? attrs.description)?.trim() || pageDescription?.trim() || undefined;

		blocks.push({ name, description, steps });
	}

	return blocks;
}
