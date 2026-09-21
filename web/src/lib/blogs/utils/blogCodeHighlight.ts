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

type Highlighter = Awaited<ReturnType<typeof createHighlighterCore>>;

const BLOG_CODE_BLOCK_RE =
	/<pre\b([^>]*)>\s*<code\b([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi;

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

export async function highlightBlogCodeSnippet(code: string, language: string): Promise<string> {
	const h = await getBlogCodeHighlighter();
	const normalizedCode = normalizeBlogCodeBlockIndentation(code);
	try {
		return h.codeToHtml(normalizedCode, {
			lang: language,
			themes: { light: 'github-light', dark: 'github-dark' }
		});
	} catch {
		return `<pre class="shiki blog-code-fallback"><code>${escapeHtml(normalizedCode)}</code></pre>`;
	}
}

/**
 * Replace `<pre><code>` blocks in blog HTML with Shiki-highlighted markup (SSR-safe).
 * Skips blocks that are already highlighted. Defaults to TypeScript when no language is set.
 */
export async function highlightBlogCodeBlocksInHtml(html: string): Promise<string> {
	if (!html.trim() || !/<pre\b/i.test(html)) return html;

	const matches: Array<{
		start: number;
		end: number;
		code: string;
		language: string;
	}> = [];

	let match: RegExpExecArray | null;
	const re = new RegExp(BLOG_CODE_BLOCK_RE.source, 'gi');
	while ((match = re.exec(html)) !== null) {
		const preAttrs = match[1] ?? '';
		const codeAttrs = match[2] ?? '';
		if (/\bclass\s*=\s*["'][^"']*\bshiki\b/i.test(preAttrs)) continue;

		const rawCode = decodeHtmlEntities(match[3] ?? '');
		const language =
			resolveBlogCodeLanguage(readLanguageFromCodeAttrs(codeAttrs)) ??
			resolveBlogCodeLanguage(readLanguageFromCodeAttrs(preAttrs)) ??
			'typescript';

		matches.push({
			start: match.index,
			end: match.index + match[0].length,
			code: rawCode,
			language
		});
	}

	if (matches.length === 0) return html;

	let cursor = 0;
	const parts: string[] = [];
	for (const block of matches) {
		parts.push(html.slice(cursor, block.start));
		parts.push(await highlightBlogCodeSnippet(block.code, block.language));
		cursor = block.end;
	}
	parts.push(html.slice(cursor));
	return parts.join('');
}
