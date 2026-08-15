import { describe, expect, it } from 'vitest';

import { prepareBlogRichTextForDisplay } from '$lib/blogs/utils/prepareBlogContentForDisplay';

describe('prepareBlogRichTextForDisplay', () => {
	it('keeps internal skill-builder links followable', () => {
		const html = prepareBlogRichTextForDisplay(
			'<p>Use <a href="/tools/skill-builder">Skill Builder</a>.</p>'
		);
		expect(html).toContain('href="/tools/skill-builder"');
		expect(html).not.toContain('nofollow');
	});

	it('adds nofollow on third-party anchors', () => {
		const html = prepareBlogRichTextForDisplay(
			'<p>See <a href="https://example.com/x">example</a>.</p>'
		);
		expect(html).toContain('rel="noopener noreferrer nofollow"');
	});

	it('wraps plain text without promoting headings', () => {
		const html = prepareBlogRichTextForDisplay('Install the skill, then export SKILL.md.');
		expect(html).toBe('<p>Install the skill, then export SKILL.md.</p>');
		expect(html).not.toContain('<h2>');
	});

	it('decodes entity-encoded HTML pasted as How-to step text', () => {
		const html = prepareBlogRichTextForDisplay(
			'&lt;p&gt;Download the Grok Bot app for &lt;strong&gt;macOS&lt;/strong&gt;.&lt;/p&gt;'
		);
		expect(html).toContain('<p>');
		expect(html).toContain('<strong>macOS</strong>');
		expect(html).not.toContain('&lt;p&gt;');
	});

	it('unwraps TipTap code-block wrapping of escaped HTML', () => {
		const html = prepareBlogRichTextForDisplay(
			'<pre><code>&lt;p&gt;Ask the Bot to run &lt;strong&gt;npm install -g @openquok/auto-cli@latest&lt;/strong&gt;.&lt;/p&gt;</code></pre>'
		);
		expect(html).toContain('<p>');
		expect(html).toContain('<strong>npm install -g @openquok/auto-cli@latest</strong>');
		expect(html).not.toContain('<pre>');
		expect(html).not.toContain('&lt;p&gt;');
	});

	it('unwraps a TipTap paragraph that only contains escaped HTML', () => {
		const html = prepareBlogRichTextForDisplay(
			'<p>&lt;p&gt;Official docs: &lt;a href="/docs/agent-setup-guides/grok-bot"&gt;Grok Bot agent setup guide&lt;/a&gt;.&lt;/p&gt;</p>'
		);
		expect(html).toContain('href="/docs/agent-setup-guides/grok-bot"');
		expect(html).not.toContain('&lt;a');
		expect(html).not.toContain('nofollow');
	});

	it('keeps a real CLI code block that is not escaped HTML', () => {
		const html = prepareBlogRichTextForDisplay(
			'<p>Ask the Bot to run this on its cloud computer:</p><pre><code>npm install -g @openquok/auto-cli@latest\nopenquok --version</code></pre>'
		);
		expect(html).toContain('<pre><code>npm install -g @openquok/auto-cli@latest');
		expect(html).toContain('openquok --version</code></pre>');
	});
});
