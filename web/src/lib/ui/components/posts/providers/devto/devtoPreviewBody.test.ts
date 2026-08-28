import { describe, expect, it } from 'vitest';

import { renderDevtoPreviewBodyHtml } from '$lib/ui/components/posts/providers/devto/devtoPreviewBody';

describe('renderDevtoPreviewBodyHtml', () => {
	it('returns empty string for blank input', () => {
		expect(renderDevtoPreviewBodyHtml('')).toBe('');
		expect(renderDevtoPreviewBodyHtml('   \n  ')).toBe('');
	});

	it('renders markdown headings as HTML', () => {
		const html = renderDevtoPreviewBodyHtml('# Heading 1\n\n## Heading 2');
		expect(html).toContain('<h1>');
		expect(html).toContain('Heading 1');
		expect(html).toContain('<h2>');
		expect(html).toContain('Heading 2');
	});

	it('renders lists and inline formatting', () => {
		const html = renderDevtoPreviewBodyHtml('- first\n- second\n\n**bold** and `code`');
		expect(html).toContain('<ul>');
		expect(html).toContain('<li>');
		expect(html).toContain('<strong>bold</strong>');
		expect(html).toContain('<code>code</code>');
	});
});
