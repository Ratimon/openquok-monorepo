import { describe, expect, it } from 'vitest';

import { validateComposerLinkHref } from '$lib/ui/components/posts/composer-editor/validateComposerLinkHref';

describe('validateComposerLinkHref', () => {
	it('accepts https URLs', () => {
		expect(validateComposerLinkHref('https://example.com')).toBe('https://example.com');
	});

	it('accepts root-relative paths', () => {
		expect(validateComposerLinkHref('/docs/platforms')).toBe('/docs/platforms');
	});

	it('rejects ftp, file, and mailto schemes', () => {
		expect(validateComposerLinkHref('ftp://example.com')).toBeNull();
		expect(validateComposerLinkHref('file:///tmp/x')).toBeNull();
		expect(validateComposerLinkHref('mailto:hi@example.com')).toBeNull();
	});

	it('rejects bare email addresses', () => {
		expect(validateComposerLinkHref('hi@example.com')).toBeNull();
	});
});
