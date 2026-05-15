/**
 * OpenAPI MDX examples highlight snippets in the browser.
 *
 * Avoid `shiki` default export and `shiki/bundle/web`: they still pull a multi‑MB dependency graph
 * (Onig WASM + the full “web” language catalog). This path uses `createHighlighterCore` with the
 * JavaScript regex engine and only the grammars we need for API examples.
 */
import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import bash from 'shiki/langs/bash.mjs';
import javascript from 'shiki/langs/javascript.mjs';
import json from 'shiki/langs/json.mjs';
import shellscript from 'shiki/langs/shellscript.mjs';
import typescript from 'shiki/langs/typescript.mjs';
import githubDark from 'shiki/themes/github-dark.mjs';
import githubLight from 'shiki/themes/github-light.mjs';

type Highlighter = Awaited<ReturnType<typeof createHighlighterCore>>;

let highlighterPromise: Promise<Highlighter> | null = null;

async function getHighlighter(): Promise<Highlighter> {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighterCore({
			themes: [githubLight, githubDark],
			langs: [bash, json, typescript, javascript, shellscript],
			engine: createJavaScriptRegexEngine()
		});
	}
	return highlighterPromise;
}

export async function highlightCode(code: string, lang: string): Promise<string> {
	const h = await getHighlighter();
	try {
		return h.codeToHtml(code, {
			lang,
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
