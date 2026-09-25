/**
 * Build-time catalog for docs MCP `search_docs` (slug, title, description, excerpt, locale).
 *
 * Usage: node ./scripts/generate-docs-mcp-index.mjs
 */
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const contentRoot = join(webRoot, 'src/content');
const outDir = join(webRoot, 'src/lib/docs/mcp/generated');
const outFile = join(outDir, 'searchIndex.json');

const DEFAULT_LOCALE = readDefaultLocale();
const EXCERPT_MAX = 240;

function readDefaultLocale() {
	const configPath = join(webRoot, 'src/lib/docs/constants/config.ts');
	const raw = readFileSync(configPath, 'utf8');
	const m = /defaultLocale:\s*['"]([^'"]+)['"]/.exec(raw);
	return m?.[1] ?? 'en';
}

function unquote(s) {
	const t = s.trim();
	if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
		return t.slice(1, -1);
	}
	return t;
}

function coerceScalar(raw) {
	const s = raw.trim();
	if (s === 'true') return true;
	if (s === 'false') return false;
	if (/^-?\d+$/.test(s)) return parseInt(s, 10);
	if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s);
	return unquote(s);
}

function parseFrontmatterBlock(block) {
	const result = {};
	const lines = block.split(/\r?\n/);

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const top = /^(\w+):\s*(.*)$/.exec(line);
		if (!top) continue;
		const [, key, rest] = top;
		const trimmed = rest.trim();

		if (key === 'sidebar' && trimmed === '') {
			const sub = /^\s{2}(\w+):\s*(.*)$/.exec(lines[i + 1] ?? '');
			if (sub?.[1] === 'label') {
				result.sidebar = { label: unquote(sub[2].trim()) };
				i++;
			}
			continue;
		}

		result[key] = coerceScalar(trimmed);
	}

	return result;
}

function docMetaFromRawSource(raw) {
	const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
	if (!m) {
		return { title: '', description: '', draft: false };
	}
	const data = parseFrontmatterBlock(m[1]);
	return {
		title: typeof data.title === 'string' ? data.title : String(data.title ?? ''),
		description:
			typeof data.description === 'string' ? data.description : String(data.description ?? ''),
		draft: data.draft === true
	};
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
		.replace(/`([^`]+)`/g, '$1')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/^#{1,6}\s+/gm, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function bodyExcerpt(raw) {
	const withoutFm = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
	const plain = stripMarkup(withoutFm);
	if (plain.length <= EXCERPT_MAX) return plain;
	return `${plain.slice(0, EXCERPT_MAX - 1).trim()}…`;
}

function slugFromRelativePath(relativePath) {
	return relativePath
		.replace(/\.(md|svx)$/, '')
		.replace(/(?:^|\/)index$/, '');
}

function walkDocFiles(dir, files = []) {
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		if (statSync(p).isDirectory()) {
			walkDocFiles(p, files);
			continue;
		}
		if (name.endsWith('.md') || name.endsWith('.svx')) files.push(p);
	}
	return files;
}

function discoverDocRoots() {
	const roots = [];
	for (const name of readdirSync(contentRoot)) {
		const p = join(contentRoot, name);
		if (!statSync(p).isDirectory()) continue;
		if (name === 'docs') {
			roots.push({ locale: DEFAULT_LOCALE, dir: p, hrefPrefix: '/docs' });
			continue;
		}
		const localized = /^docs-(.+)$/.exec(name);
		if (localized) {
			roots.push({ locale: localized[1], dir: p, hrefPrefix: `/docs/${localized[1]}` });
		}
	}
	return roots;
}

function main() {
	const entries = [];

	for (const { locale, dir, hrefPrefix } of discoverDocRoots()) {
		const prefixLen = `${dir}/`.length;
		for (const filePath of walkDocFiles(dir)) {
			const raw = readFileSync(filePath, 'utf8');
			const meta = docMetaFromRawSource(raw);
			if (meta.draft) continue;

			const rel = relative(dir, filePath).replace(/\\/g, '/');
			const slug = slugFromRelativePath(rel);
			const href = slug ? `${hrefPrefix}/${slug}` : hrefPrefix;

			entries.push({
				slug,
				title: meta.title || slug.split('/').pop() || '',
				description: meta.description,
				href,
				locale,
				excerpt: bodyExcerpt(raw)
			});
		}
	}

	entries.sort(
		(a, b) => a.locale.localeCompare(b.locale) || a.slug.localeCompare(b.slug)
	);

	mkdirSync(outDir, { recursive: true });
	writeFileSync(outFile, `${JSON.stringify({ generatedAt: new Date().toISOString(), entries }, null, 2)}\n`);
	console.log(`Wrote ${entries.length} docs MCP index entries to ${relative(webRoot, outFile)}`);
}

main();
