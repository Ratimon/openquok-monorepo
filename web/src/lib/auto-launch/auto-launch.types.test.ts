import { describe, expect, it } from 'vitest';

import {
	autoLaunchProductProfileFormSchema,
	businessProfileDataFormSchema
} from '$lib/auto-launch/auto-launch.types';

describe('businessProfileDataFormSchema', () => {
	it('rejects more than three tags', () => {
		const result = businessProfileDataFormSchema.safeParse({
			tags: ['a', 'b', 'c', 'd']
		});
		expect(result.success).toBe(false);
	});

	it('requires repository URL when open source is enabled', () => {
		const result = businessProfileDataFormSchema.safeParse({
			is_open_source: true,
			repository_url: null
		});
		expect(result.success).toBe(false);
	});

	it('accepts a valid open-source profile block', () => {
		const result = businessProfileDataFormSchema.safeParse({
			is_open_source: true,
			repository_url: 'https://github.com/acme/product',
			tags: ['devtools']
		});
		expect(result.success).toBe(true);
	});

	it('normalizes repository URL without scheme on save', () => {
		const result = businessProfileDataFormSchema.safeParse({
			is_open_source: true,
			repository_url: 'github.com/acme/product'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.repository_url).toBe('https://github.com/acme/product');
		}
	});
});

describe('autoLaunchProductProfileFormSchema', () => {
	it('requires name and nests profileData validation', () => {
		const missingName = autoLaunchProductProfileFormSchema.safeParse({
			profileData: { tags: ['a', 'b', 'c', 'd'] }
		});
		expect(missingName.success).toBe(false);

		const valid = autoLaunchProductProfileFormSchema.safeParse({
			name: 'Acme',
			description: '<p>Rich HTML</p>',
			profileData: {
				pricing_type: 'paid',
				social_x: 'https://x.com/acme'
			}
		});
		expect(valid.success).toBe(true);
	});

	it('normalizes website URL without scheme on save', () => {
		const result = autoLaunchProductProfileFormSchema.safeParse({
			name: 'Acme',
			websiteUrl: 'www.openquok.com'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.websiteUrl).toBe('https://www.openquok.com');
		}
	});

	it('accepts null optional fields from loaded profiles', () => {
		const result = autoLaunchProductProfileFormSchema.safeParse({
			name: 'Group 1',
			tagline: null,
			description: null,
			websiteUrl: null,
			logoUrl: null,
			profileData: {
				category: null,
				pricing_type: null,
				repository_url: null
			}
		});
		expect(result.success).toBe(true);
	});

	it('reports a clear message for invalid website URL', () => {
		const result = autoLaunchProductProfileFormSchema.safeParse({
			name: 'Acme',
			websiteUrl: 'not a url'
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues.some((i) => i.path.includes('websiteUrl'))).toBe(true);
		}
	});
});
