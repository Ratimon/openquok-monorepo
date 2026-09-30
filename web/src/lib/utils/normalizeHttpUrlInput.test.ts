import { describe, expect, it } from 'vitest';

import {
	normalizeHttpUrlInput,
	normalizeXCommunityUrlInput
} from '$lib/utils/normalizeHttpUrlInput';

describe('normalizeHttpUrlInput', () => {
	it('prepends https when the scheme is missing', () => {
		expect(normalizeHttpUrlInput('www.example.com/path')).toBe('https://www.example.com/path');
		expect(normalizeHttpUrlInput('example.com')).toBe('https://example.com');
	});

	it('preserves http and https', () => {
		expect(normalizeHttpUrlInput('https://example.com')).toBe('https://example.com');
		expect(normalizeHttpUrlInput('http://example.com')).toBe('http://example.com');
	});

	it('fixes scheme without slashes', () => {
		expect(normalizeHttpUrlInput('https:www.example.com/path')).toBe('https://www.example.com/path');
		expect(normalizeHttpUrlInput('http:example.com')).toBe('http://example.com');
	});

	it('trims whitespace', () => {
		expect(normalizeHttpUrlInput('  example.com  ')).toBe('https://example.com');
	});

	it('returns empty for blank input', () => {
		expect(normalizeHttpUrlInput('')).toBe('');
		expect(normalizeHttpUrlInput('   ')).toBe('');
	});
});

describe('normalizeXCommunityUrlInput', () => {
	it('keeps numeric community IDs', () => {
		expect(normalizeXCommunityUrlInput('123456789')).toBe('123456789');
	});

	it('normalizes community URLs', () => {
		expect(normalizeXCommunityUrlInput('x.com/i/communities/123')).toBe(
			'https://x.com/i/communities/123'
		);
	});
});
