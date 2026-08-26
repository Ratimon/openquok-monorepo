import { describe, expect, it } from 'vitest';

import { stripComposerBodyForEditor } from '$lib/posts/utils/composer/stripBodyForEditor';

describe('stripComposerBodyForEditor', () => {
	it('returns empty for blank input', () => {
		expect(stripComposerBodyForEditor('normal', '')).toBe('');
		expect(stripComposerBodyForEditor('markdown', '   ')).toBe('');
	});

	it('normal mode strips HTML to plain text with line breaks', () => {
		expect(stripComposerBodyForEditor('normal', '<p>Hello<br>world</p>')).toBe('Hello\nworld');
	});

	it('markdown mode converts common TipTap HTML to markdown', () => {
		expect(
			stripComposerBodyForEditor(
				'markdown',
				'<p>Hello <strong>world</strong></p><p><a href="https://example.com">link</a></p>'
			)
		).toBe('Hello **world**\n\n[link](https://example.com)');
	});

	it('markdown mode preserves legacy plain text', () => {
		expect(stripComposerBodyForEditor('markdown', 'Already plain')).toBe('Already plain');
	});

	it('markdown mode converts headings', () => {
		expect(stripComposerBodyForEditor('markdown', '<h2>Section</h2><p>Body</p>')).toBe(
			'## Section\n\nBody'
		);
	});
});
