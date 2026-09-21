import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import javascript from 'shiki/langs/javascript.mjs';
import json from 'shiki/langs/json.mjs';
import python from 'shiki/langs/python.mjs';
import shellscript from 'shiki/langs/shellscript.mjs';
import typescript from 'shiki/langs/typescript.mjs';
import githubDark from 'shiki/themes/github-dark.mjs';
import githubLight from 'shiki/themes/github-light.mjs';

import { isAllowedShikiLanguageId } from '$lib/shiki/limitedLanguages';
import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';

type Highlighter = Awaited<ReturnType<typeof createHighlighterCore>>;

const BLOG_CODE_BLOCK_RE =
	/<pre\b([^>]*)>\s*<code\b([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi;

const BLOG_HEADING_BEFORE_CODE_RE = /<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi;

export type ParsedBlogCodeBlock = {
	index: number;
	start: number;
	end: number;
	/** Shiki grammar id used for syntax highlighting. */
	highlightLanguage: string;
	/** True when `class="language-*"` or `data-language` was set in saved HTML. */
	languageExplicit: boolean;
	/** Schema.org `programmingLanguage` — only when the author set a language in the editor/HTML. */
	programmingLanguageLabel: string | null;
	/** Normalized plain source text. */
	text: string;
	/** Section title from the nearest preceding h2/h3. */
	name: string;
};

let highlighterPromise: Promise<Highlighter> | null = null;

async function getBlogCodeHighlighter(): Promise<Highlighter> {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighterCore({
			themes: [githubLight, githubDark],
			langs: [typescript, javascript, json, shellscript, python],
			engine: createJavaScriptRegexEngine()
		});
	}
	return highlighterPromise;
}

function decodeHtmlEntities(text: string): string {
	return text
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&#x27;/gi, "'");
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function readLanguageFromCodeAttrs(attrBlob: string): string | null {
	const dataLang = /\bdata-language\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attrBlob);
	const fromData = (dataLang?.[1] ?? dataLang?.[2] ?? '').trim();
	if (fromData) return fromData;

	const classMatch = /\bclass\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attrBlob);
	const classValue = classMatch?.[1] ?? classMatch?.[2] ?? '';
	const langMatch = classValue.match(/language-([\w-]+)/i);
	return langMatch?.[1]?.trim() ?? null;
}

/** Strip editor/HTML paste padding so Shiki renders aligned code. */
export function normalizeBlogCodeBlockIndentation(code: string): string {
	const normalized = code.replace(/\r\n/g, '\n').replace(/\t/g, '  ');
	const lines = normalized.split('\n').map((line) => line.trimEnd());

	while (lines.length > 0 && lines[0].trim() === '') {
		lines.shift();
	}
	while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
		lines.pop();
	}
	if (lines.length === 0) return '';

	let minIndent = Infinity;
	for (const line of lines) {
		if (line.trim() === '') continue;
		const leading = /^(\s*)/.exec(line)?.[1]?.length ?? 0;
		if (leading < minIndent) minIndent = leading;
	}
	if (!Number.isFinite(minIndent) || minIndent === 0) {
		return lines.join('\n');
	}

	return lines.map((line) => (line.trim() === '' ? '' : line.slice(minIndent))).join('\n');
}

function resolveBlogCodeLanguage(rawLanguage: string | null): string | null {
	const language = (rawLanguage ?? '').trim().toLowerCase();
	if (!language || language === 'plaintext' || language === 'text') return null;
	if (language === 'bash' || language === 'sh' || language === 'shell' || language === 'zsh') {
		return 'shellscript';
	}
	if (language === 'ts') return 'typescript';
	if (language === 'js') return 'javascript';
	if (isAllowedShikiLanguageId(language)) return language;
	return null;
}

const BLOG_CODE_LANGUAGE_LABELS: Record<string, string> = {
	typescript: 'TypeScript',
	javascript: 'JavaScript',
	json: 'JSON',
	shellscript: 'Shell',
	python: 'Python',
	plaintext: 'Plain text'
};

export function blogCodeProgrammingLanguageLabel(language: string): string {
	return BLOG_CODE_LANGUAGE_LABELS[language] ?? language;
}

export function blogCodeEncodingFormat(language: string): string | undefined {
	switch (language) {
		case 'typescript':
			return 'text/typescript';
		case 'javascript':
			return 'text/javascript';
		case 'json':
			return 'application/json';
		case 'shellscript':
			return 'text/x-shellscript';
		case 'python':
			return 'text/x-python';
		default:
			return undefined;
	}
}

function resolveCodeBlockName(html: string, blockStartIndex: number, index: number): string {
	const before = html.slice(0, blockStartIndex);
	let lastTitle = '';
	const headingRe = new RegExp(BLOG_HEADING_BEFORE_CODE_RE.source, 'gi');
	let headingMatch: RegExpExecArray | null;
	while ((headingMatch = headingRe.exec(before)) !== null) {
		lastTitle = stripHtmlToPlainText(headingMatch[2] ?? '').trim();
	}
	if (lastTitle) return lastTitle;
	return `Code example ${index + 1}`;
}

/** Parse `<pre><code>` blocks for Shiki rendering and Schema.org `SoftwareSourceCode` nodes. */
export function parseBlogCodeBlocksFromHtml(html: string): ParsedBlogCodeBlock[] {
	if (!html.trim() || !/<pre\b/i.test(html)) return [];

	const blocks: ParsedBlogCodeBlock[] = [];
	const re = new RegExp(BLOG_CODE_BLOCK_RE.source, 'gi');
	let match: RegExpExecArray | null;
	let index = 0;

	while ((match = re.exec(html)) !== null) {
		const preAttrs = match[1] ?? '';
		const codeAttrs = match[2] ?? '';
		if (/\bclass\s*=\s*["'][^"']*\bshiki\b/i.test(preAttrs)) continue;

		const rawCode = decodeHtmlEntities(match[3] ?? '');
		const rawLanguage =
			readLanguageFromCodeAttrs(codeAttrs) ?? readLanguageFromCodeAttrs(preAttrs);
		const languageExplicit = Boolean(rawLanguage?.trim());
		const resolvedLanguage = resolveBlogCodeLanguage(rawLanguage);
		const highlightLanguage = resolvedLanguage ?? 'typescript';
		const text = normalizeBlogCodeBlockIndentation(rawCode);
		const programmingLanguageLabel =
			languageExplicit && resolvedLanguage
				? blogCodeProgrammingLanguageLabel(resolvedLanguage)
				: null;

		blocks.push({
			index,
			start: match.index,
			end: match.index + match[0].length,
			highlightLanguage,
			languageExplicit,
			programmingLanguageLabel,
			text,
			name: resolveCodeBlockName(html, match.index, index)
		});
		index += 1;
	}

	return blocks;
}

function withBlogCodeBlockAnchor(html: string, index: number): string {
	const anchorId = `code-block-${index + 1}`;
	if (/\bid\s*=/.test(html)) return html;
	return html.replace(/^<pre\b/, `<pre id="${anchorId}"`);
}

export async function highlightBlogCodeSnippet(
	code: string,
	language: string,
	index?: number
): Promise<string> {
	const h = await getBlogCodeHighlighter();
	const normalizedCode = normalizeBlogCodeBlockIndentation(code);
	let html: string;
	try {
		html = await h.codeToHtml(normalizedCode, {
			lang: language,
			themes: { light: 'github-light', dark: 'github-dark' }
		});
	} catch {
		html = `<pre class="shiki blog-code-fallback"><code>${escapeHtml(normalizedCode)}</code></pre>`;
	}
	return index == null ? html : withBlogCodeBlockAnchor(html, index);
}

/**
 * Replace `<pre><code>` blocks in blog HTML with Shiki-highlighted markup (SSR-safe).
 * Skips blocks that are already highlighted. Defaults to TypeScript when no language is set.
 */
export async function highlightBlogCodeBlocksInHtml(html: string): Promise<string> {
	const blocks = parseBlogCodeBlocksFromHtml(html);
	if (blocks.length === 0) return html;

	let cursor = 0;
	const parts: string[] = [];
	for (const block of blocks) {
		parts.push(html.slice(cursor, block.start));
		parts.push(await highlightBlogCodeSnippet(block.text, block.highlightLanguage, block.index));
		cursor = block.end;
	}
	parts.push(html.slice(cursor));
	return parts.join('');
}
