import { describe, expect, it } from 'vitest';

import {
	isValidBusinessProfileSlug,
	normalizeBusinessProfileSlug,
} from './normalizeBusinessProfileSlug.js';

describe('normalizeBusinessProfileSlug', () => {
	it('trims trailing hyphens from punctuated names', () => {
		expect(normalizeBusinessProfileSlug('my-product-')).toBe('my-product');
		expect(normalizeBusinessProfileSlug('openquok-peerpush-')).toBe('openquok-peerpush');
	});

	it('collapses repeated hyphens', () => {
		expect(normalizeBusinessProfileSlug('open--quok')).toBe('open-quok');
	});

	it('produces valid slugs for directory variant style names', () => {
		const slug = normalizeBusinessProfileSlug('openquok-peerpush');
		expect(slug).toBe('openquok-peerpush');
		expect(isValidBusinessProfileSlug(slug)).toBe(true);
	});
});
