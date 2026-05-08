import { transformerMetaHighlight, transformerNotationHighlight } from '@shikijs/transformers';
import { createHighlighter } from 'shiki';

/**
 * Minimal HTML escape for raw code blocks.
 * @param {string} s
 */
function escapeHtml(s) {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

const highlighter = await createHighlighter({
	themes: ['github-dark', 'github-light'],
	langs: [
		'typescript',
		'javascript',
		'svelte',
		'bash',
		'json',
		'css',
		'html',
		'markdown',
		'yaml',
		'shell'
	]
});

/**
 * @param {string} code
 * @param {string | undefined} lang
 * @param {string | undefined} meta
 */
export function mdsvexCodeHighlighter(code, lang, meta) {
	const titleMatch = meta?.match(/title="([^"]+)"/);
	const title = titleMatch?.[1];

	const requestedLang = lang || 'text';
	let html;
	try {
		html = highlighter.codeToHtml(code, {
			lang: requestedLang,
			themes: { light: 'github-light', dark: 'github-dark' },
			meta: meta ? { __raw: meta } : undefined,
			transformers: [transformerMetaHighlight(), transformerNotationHighlight()]
		});
	} catch (e) {
		// Shiki throws for unknown langs (e.g. `mermaid`). Fall back to plain <pre><code>.
		const classLang = requestedLang.replace(/[^a-zA-Z0-9_-]/g, '');
		html = `<pre class="shiki"><code class="language-${classLang}">${escapeHtml(code)}</code></pre>`;
	}

	let result = html;
	if (title) {
		result = `<div class="code-block-titled"><div class="code-block-title">${title}</div>${result}</div>`;
	}

	return `{@html \`${result.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`}`;
}
