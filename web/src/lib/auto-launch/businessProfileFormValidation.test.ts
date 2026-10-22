import { describe, expect, it } from 'vitest';

import { parseBusinessProfileFormIssues } from '$lib/auto-launch/businessProfileFormValidation';
import { autoLaunchProductProfileFormSchema } from '$lib/auto-launch/auto-launch.types';

describe('parseBusinessProfileFormIssues', () => {
	it('maps issues to field labels for toast copy', () => {
		const result = autoLaunchProductProfileFormSchema.safeParse({
			name: '',
			websiteUrl: 'bad',
			profileData: { is_open_source: true, repository_url: null }
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			const parsed = parseBusinessProfileFormIssues(result.error.issues);
			expect(parsed.toastMessage).toContain('Product name');
			expect(parsed.toastMessage).toContain('Website URL');
			expect(parsed.toastMessage).toContain('Repository URL');
			expect(parsed.firstTabWithError).toBe('general');
		}
	});

	it('routes legacy single category errors to the discovery tab', () => {
		const result = autoLaunchProductProfileFormSchema.safeParse({
			name: 'Acme',
			profileData: {
				category: 'x'.repeat(201)
			}
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			const parsed = parseBusinessProfileFormIssues(result.error.issues);
			expect(parsed.fieldErrors['profileData.category']).toBeTruthy();
			expect(parsed.firstTabWithError).toBe('discovery');
		}
	});

	it('routes discovery field errors to the discovery tab', () => {
		const result = autoLaunchProductProfileFormSchema.safeParse({
			name: 'Acme',
			profileData: {
				categories: ['a', 'b', 'c', 'd']
			}
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			const parsed = parseBusinessProfileFormIssues(result.error.issues);
			expect(parsed.fieldErrors['profileData.categories']).toBeTruthy();
			expect(parsed.firstTabWithError).toBe('discovery');
		}
	});
});
