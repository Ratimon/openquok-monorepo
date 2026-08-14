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
});
