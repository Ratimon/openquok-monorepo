import { describe, expect, it } from 'vitest';

import {
	highlightBlogCodeBlocksInHtml,
	highlightBlogCodeSnippet,
	normalizeBlogCodeBlockIndentation
} from '$lib/blogs/utils/blogCodeHighlight';

describe('normalizeBlogCodeBlockIndentation', () => {
	it('removes uniform editor padding from pasted code blocks', () => {
		const input = `                      const decision = await jev.systemOne({
                                state: { proposal: { caption: globalCaption } },
                                questions: {
                                relevant: noul("The post is relevant"),
                                },
                                });`;
		const output = normalizeBlogCodeBlockIndentation(input);
		expect(output).toBe(`const decision = await jev.systemOne({
          state: { proposal: { caption: globalCaption } },
          questions: {
          relevant: noul("The post is relevant"),
          },
          });`);
	});
});

describe('highlightBlogCodeSnippet', () => {
	it('wraps TypeScript in Shiki markup', async () => {
		const html = await highlightBlogCodeSnippet('const answer = 1;', 'typescript');
		expect(html).toContain('class="shiki');
		expect(html).toContain('const');
	});
});

describe('highlightBlogCodeBlocksInHtml', () => {
	it('highlights a plain pre/code block as TypeScript by default', async () => {
		const input = '<p>Example</p><pre><code>const x = 1;</code></pre>';
		const output = await highlightBlogCodeBlocksInHtml(input);
		expect(output).toContain('class="shiki');
		expect(output).toContain('const');
		expect(output).not.toContain('<pre><code>const x = 1;</code></pre>');
	});

	it('respects language-typescript on the code element', async () => {
		const input =
			'<pre><code class="language-json">{"status":"draft"}</code></pre>';
		const output = await highlightBlogCodeBlocksInHtml(input);
		expect(output).toContain('class="shiki');
		expect(output).toContain('draft');
	});

	it('skips blocks that are already highlighted', async () => {
		const input = '<pre class="shiki"><code>already highlighted</code></pre>';
		expect(await highlightBlogCodeBlocksInHtml(input)).toBe(input);
	});

	it('leaves HTML without code blocks unchanged', async () => {
		const input = '<p>No code here.</p>';
		expect(await highlightBlogCodeBlocksInHtml(input)).toBe(input);
	});

	it('dedents over-indented pasted code before highlighting', async () => {
		const input =
			'<pre><code class="language-typescript">                      const x = 1;\n                                const y = 2;</code></pre>';
		const output = await highlightBlogCodeBlocksInHtml(input);
		expect(output).toContain('class="shiki');
		expect(output).not.toContain('                      ');
	});
});
