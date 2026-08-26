import { describe, expect, it } from 'vitest';

import { composerBodyForEditorMode } from '$lib/posts/utils/composer/bodyForEditorMode';

describe('composerBodyForEditorMode', () => {
	it('returns empty for blank input', () => {
		expect(composerBodyForEditorMode('normal', '')).toBe('');
		expect(composerBodyForEditorMode('markdown', '   ')).toBe('');
		expect(composerBodyForEditorMode('html', '\n\n')).toBe('');
	});

	it('normal and none strip HTML to plain text', () => {
		const html = '<p>Hello<br>world</p>';
		expect(composerBodyForEditorMode('normal', html)).toBe('Hello\nworld');
		expect(composerBodyForEditorMode('none', html)).toBe('Hello\nworld');
	});

	it('markdown and html wrap plain text in paragraph HTML', () => {
		expect(composerBodyForEditorMode('markdown', 'Hello world')).toBe('<p>Hello world</p>');
		expect(composerBodyForEditorMode('html', 'Line one\nLine two')).toBe(
			'<p>Line one<br>Line two</p>'
		);
	});

	it('markdown and html preserve existing HTML', () => {
		const html = '<p><strong>Bold</strong></p>';
		expect(composerBodyForEditorMode('markdown', html)).toBe(html);
		expect(composerBodyForEditorMode('html', html)).toBe(html);
	});

	it('round-trips HTML storage through normal then rich modes', () => {
		const storedHtml = '<p>Test</p>';
		const plain = composerBodyForEditorMode('normal', storedHtml);
		expect(plain).toBe('Test');
		expect(composerBodyForEditorMode('markdown', plain)).toBe('<p>Test</p>');
		expect(composerBodyForEditorMode('html', plain)).toBe('<p>Test</p>');
	});

	it('round-trips plain storage through rich then normal modes', () => {
		const storedPlain = 'First\n\nSecond';
		const html = composerBodyForEditorMode('markdown', storedPlain);
		expect(html).toBe('<p>First</p><p>Second</p>');
		expect(composerBodyForEditorMode('normal', html)).toBe('First\nSecond');
	});
});
