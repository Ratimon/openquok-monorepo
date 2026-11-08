import { describe, expect, it } from 'vitest';

import {
	getRootPathPublicAlternatives,
	getRootPathPublicAlternativesCategories,
	getRootPathPublicAlternativesCategory
} from '$lib/area-public/constants/getRootPathPublicAlternatives';

describe('getRootPathPublicAlternatives', () => {
	it('returns hub and category path segments', () => {
		expect(getRootPathPublicAlternatives()).toBe('alternatives');
		expect(getRootPathPublicAlternativesCategories()).toBe('alternatives/categories');
		expect(getRootPathPublicAlternativesCategory('social-scheduler')).toBe(
			'alternatives/categories/social-scheduler'
		);
		expect(getRootPathPublicAlternativesCategory('directory-submission')).toBe(
			'alternatives/categories/directory-submission'
		);
	});
});
