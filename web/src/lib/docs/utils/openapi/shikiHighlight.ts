/**
 * OpenAPI request examples highlight snippets in the browser.
 *
 * Avoid bare `shiki` / `shiki/bundle/*`: they register large language catalogs. This path uses
 * `createHighlighterCore` with the JavaScript regex engine and grammars aligned with
 * `HTTP_CLIENT_SAMPLES` `shikiLanguage` values in `httpClientSamples.ts` (plus legacy MDX fences).
 */
import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import go from 'shiki/langs/go.mjs';
import java from 'shiki/langs/java.mjs';
import javascript from 'shiki/langs/javascript.mjs';
import json from 'shiki/langs/json.mjs';
import php from 'shiki/langs/php.mjs';
import python from 'shiki/langs/python.mjs';
import ruby from 'shiki/langs/ruby.mjs';
import shellscript from 'shiki/langs/shellscript.mjs';
import typescript from 'shiki/langs/typescript.mjs';
import githubDark from 'shiki/themes/github-dark.mjs';
import githubLight from 'shiki/themes/github-light.mjs';

/** Fence / sample aliases → canonical Shiki grammar ids (keep in sync with `limitedLanguages.ts`). */
const OPENAPI_HIGHLIGHT_LANG_ALIASES: Record<string, string> = {
	bash: 'shellscript',
	sh: 'shellscript',
	shell: 'shellscript',
	zsh: 'shellscript',
	py: 'python'
};

export function normalizeOpenApiHighlightLang(lang: string): string {
	const key = lang.trim().toLowerCase();
	return OPENAPI_HIGHLIGHT_LANG_ALIASES[key] ?? key;
}

type Highlighter = Awaited<ReturnType<typeof createHighlighterCore>>;

let highlighterPromise: Promise<Highlighter> | null = null;

async function getHighlighter(): Promise<Highlighter> {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighterCore({
			themes: [githubLight, githubDark],
			langs: [
				json,
				typescript,
				javascript,
				shellscript,
				python,
				php,
				go,
				java,
				ruby
			],
			engine: createJavaScriptRegexEngine()
		});
	}
	return highlighterPromise;
}

export async function highlightCode(code: string, lang: string): Promise<string> {
	const h = await getHighlighter();
	const normalizedLang = normalizeOpenApiHighlightLang(lang);
	try {
		return h.codeToHtml(code, {
			lang: normalizedLang,
			themes: { light: 'github-light', dark: 'github-dark' }
		});
	} catch {
		return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
	}
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
