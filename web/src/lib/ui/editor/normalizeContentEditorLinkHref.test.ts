import { describe, expect, it } from 'vitest';

import {
	formatContentEditorLinkHrefForDisplay,
	normalizeContentEditorLinkHref,
	resolveContentEditorLinkHrefForStorage
} from '$lib/ui/editor/normalizeContentEditorLinkHref';

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

describe('formatContentEditorLinkHrefForDisplay', () => {
	const origin = 'https://www.openquok.com';

	it('expands root-relative paths to absolute URLs', () => {
		expect(formatContentEditorLinkHrefForDisplay('/tools/skill-builder', origin)).toBe(
			'https://www.openquok.com/tools/skill-builder'
		);
		expect(formatContentEditorLinkHrefForDisplay('/ssee', origin)).toBe(
			'https://www.openquok.com/ssee'
		);
	});

	it('keeps external and special schemes', () => {
		expect(formatContentEditorLinkHrefForDisplay('https://example.com/x', origin)).toBe(
			'https://example.com/x'
		);
		expect(formatContentEditorLinkHrefForDisplay('mailto:a@b.com', origin)).toBe('mailto:a@b.com');
	});
});

describe('resolveContentEditorLinkHrefForStorage', () => {
	const origin = 'https://www.openquok.com';

	it('stores same-site absolute URLs as root-relative paths', () => {
		expect(
			resolveContentEditorLinkHrefForStorage('https://www.openquok.com/tools/skill-builder', origin)
		).toBe('/tools/skill-builder');
	});

	it('keeps external URLs absolute', () => {
		expect(resolveContentEditorLinkHrefForStorage('https://example.com/page', origin)).toBe(
			'https://example.com/page'
		);
	});
});
