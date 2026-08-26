/**
 * Adds howToName / howToDescription to bare <Steps> blocks for HowTo JSON-LD.
 * Skips blocks that already declare howToName (unless --force).
 *
 * Usage: node web/scripts/inject-docs-steps-howto-props.mjs [--write] [--force]
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DOCS_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '../src/content/docs');
const WRITE = process.argv.includes('--write');
const FORCE = process.argv.includes('--force');

function walk(dir, files = []) {
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		if (statSync(p).isDirectory()) walk(p, files);
		else if (name.endsWith('.md')) files.push(p);
	}
	return files;
}

function parseFrontmatterField(raw, field) {
	const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!fm) return '';
	const m = fm[1].match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
	if (!m) return '';
	return m[1].trim().replace(/^['"](.*)['"]$/, '$1');
}

function cleanSectionHeading(heading) {
	return heading.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

function findPrecedingSectionHeading(raw, stepsIndex) {
	const before = raw.slice(0, stepsIndex);
	const candidates = [];

	for (const match of before.matchAll(/^##\s+(.+)$/gm)) {
		if (match.index != null && match[1]) candidates.push({ index: match.index, text: match[1] });
	}
	for (const match of before.matchAll(/<h2[^>]*>([^<]+)<\/h2>/gi)) {
		if (match.index != null && match[1]) candidates.push({ index: match.index, text: match[1] });
	}

	candidates.sort((a, b) => a.index - b.index);
	const last = candidates.at(-1);
	if (!last?.text) return '';
	return cleanSectionHeading(last.text.replace(/<[^>]+>/g, '').trim());
}

function stripMarkup(text) {
	return text
		.replace(/<[^>]+>/g, '')
		.replace(/&quot;/g, '"')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/\*([^*]+)\*/g, '$1')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/\s+/g, ' ')
		.trim();
}

function sectionIntroParagraph(raw, stepsIndex) {
	const before = raw.slice(0, stepsIndex);
	const matches = [...before.matchAll(/^##\s+.+$/gm)];
	const htmlMatches = [...before.matchAll(/<h2[^>]*>[^<]+<\/h2>/gi)];
	const lastIndex = Math.max(
		matches.at(-1)?.index ?? -1,
		htmlMatches.at(-1)?.index ?? -1
	);
	if (lastIndex < 0) return '';
	const section = raw.slice(lastIndex, stepsIndex);
	for (const line of section.split(/\r?\n/).slice(1)) {
		const t = line.trim();
		if (!t) continue;
		if (/^#{1,6}\s/.test(t) || /^<h[1-6]\b/i.test(t)) break;
		if (t.startsWith('|') || t.startsWith('```')) continue;
		const plain = stripMarkup(t);
		if (!plain || plain.length < 20) continue;
		return plain.length > 240 ? `${plain.slice(0, 237)}…` : plain;
	}
	return '';
}

function escapeAttr(value) {
	return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function attrsNeedRefresh(attrs) {
	if (!/\bhowToName\s*=/.test(attrs)) return true;
	return /&(?:quot|lt|gt|amp);/.test(attrs) || /<[A-Za-z]/.test(attrs);
}

function buildHowToDescription({ howToName, pageDescription, pageTitle, sectionIntro, stepsOnPage }) {
	if (sectionIntro && sectionIntro.length > 20) {
		return sectionIntro;
	}
	if (stepsOnPage === 1 && pageDescription) {
		return pageDescription;
	}
	if (pageDescription) {
		return `${howToName}: ${pageDescription}`;
	}
	if (pageTitle) {
		return `Step-by-step ${howToName.toLowerCase()} for ${pageTitle}.`;
	}
	return `Step-by-step guide: ${howToName}.`;
}

/** Match real `<Steps …>` open tags (not backtick prose like `` `<Steps>` ``). */
function* iterStepsOpenTags(raw) {
	let i = 0;
	while (i < raw.length) {
		const start = raw.indexOf('<Steps', i);
		if (start === -1) return;
		if (isInsideBackticks(raw, start)) {
			i = start + 6;
			continue;
		}
		const end = raw.indexOf('\n>', start);
		if (end === -1) return;
		yield { start, end: end + 2, attrs: raw.slice(start + 6, end), full: raw.slice(start, end + 2) };
		i = end + 2;
	}
}

function isInsideBackticks(raw, index) {
	const before = raw.slice(0, index);
	const ticks = (before.match(/`/g) ?? []).length;
	return ticks % 2 === 1;
}

function injectFile(filePath) {
	const raw = readFileSync(filePath, 'utf8');
	const pageTitle = parseFrontmatterField(raw, 'title');
	const pageDescription = parseFrontmatterField(raw, 'description');
	const stepsOnPage = (raw.match(/<Steps\b/gi) ?? []).length;
	if (stepsOnPage === 0) return { changed: false, count: 0 };

	let injected = 0;
	let result = '';
	let cursor = 0;

	for (const tag of iterStepsOpenTags(raw)) {
		if (!FORCE && !attrsNeedRefresh(tag.attrs)) {
			result += raw.slice(cursor, tag.end);
			cursor = tag.end;
			continue;
		}

		const howToName =
			findPrecedingSectionHeading(raw, tag.start) || pageTitle || 'Procedure';
		const sectionIntro = sectionIntroParagraph(raw, tag.start);
		const howToDescription = buildHowToDescription({
			howToName,
			pageDescription,
			pageTitle,
			sectionIntro,
			stepsOnPage
		});

		const replacement = `<Steps\n\thowToName="${escapeAttr(howToName)}"\n\thowToDescription="${escapeAttr(howToDescription)}"\n>`;
		result += raw.slice(cursor, tag.start) + replacement;
		cursor = tag.end;
		injected++;
	}

	result += raw.slice(cursor);

	if (injected === 0) return { changed: false, count: 0 };

	if (WRITE) writeFileSync(filePath, result, 'utf8');
	return { changed: true, count: injected, rel: filePath.replace(DOCS_ROOT + '/', '') };
}

const files = walk(DOCS_ROOT);
const updates = [];

for (const file of files) {
	const outcome = injectFile(file);
	if (outcome.changed) updates.push(outcome);
}

console.log(
	WRITE
		? `Updated ${updates.length} files (${updates.reduce((n, u) => n + u.count, 0)} Steps blocks).`
		: `Dry run: would update ${updates.length} files (${updates.reduce((n, u) => n + u.count, 0)} Steps blocks). Pass --write to apply.`
);
