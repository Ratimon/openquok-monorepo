import { describe, expect, it } from 'vitest';

import { normalizeContentEditorLinkHref } from '$lib/ui/editor/normalizeContentEditorLinkHref';

describe('normalizeContentEditorLinkHref', () => {
	it('keeps root-relative marketing paths', () => {
		expect(normalizeContentEditorLinkHref('/tools/skill-builder')).toBe('/tools/skill-builder');
		expect(normalizeContentEditorLinkHref('/tools/skill-builder/tiktok')).toBe(
			'/tools/skill-builder/tiktok'
		);
	});

	it('keeps http(s), hash, mailto, and tel', () => {
		expect(normalizeContentEditorLinkHref('https://www.openquok.com/docs')).toBe(
			'https://www.openquok.com/docs'
		);
		expect(normalizeContentEditorLinkHref('#faq')).toBe('#faq');
		expect(normalizeContentEditorLinkHref('mailto:hi@example.com')).toBe('mailto:hi@example.com');
	});

	it('prefixes bare hostnames with https', () => {
		expect(normalizeContentEditorLinkHref('example.com/x')).toBe('https://example.com/x');
	});

	it('returns null for empty input', () => {
		expect(normalizeContentEditorLinkHref('   ')).toBeNull();
	});
});
