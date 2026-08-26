import { describe, expect, it } from 'vitest';

import { plainTextToComposerHtml } from '$lib/ui/components/posts/composer-editor/plainTextToComposerHtml';

describe('plainTextToComposerHtml', () => {
	it('returns empty for blank input', () => {
		expect(plainTextToComposerHtml('')).toBe('');
		expect(plainTextToComposerHtml('   ')).toBe('');
	});

	it('wraps plain text in a paragraph', () => {
		expect(plainTextToComposerHtml('Hello world')).toBe('<p>Hello world</p>');
	});

	it('preserves single line breaks as <br>', () => {
		expect(plainTextToComposerHtml('Line one\nLine two')).toBe('<p>Line one<br>Line two</p>');
	});

	it('splits paragraphs on blank lines', () => {
		expect(plainTextToComposerHtml('First\n\nSecond')).toBe('<p>First</p><p>Second</p>');
	});

	it('leaves existing HTML unchanged', () => {
		const html = '<p><strong>Bold</strong></p>';
		expect(plainTextToComposerHtml(html)).toBe(html);
	});
});
