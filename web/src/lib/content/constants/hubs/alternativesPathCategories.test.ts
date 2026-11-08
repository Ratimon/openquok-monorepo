import { describe, expect, it } from 'vitest';

import {
	alternativesPathCategorySlugForHubCategory,
	isAlternativesPathCategorySlug,
	PUBLIC_ALTERNATIVES_PATH_CATEGORIES
} from '$lib/content/constants/hubs/alternativesPathCategories';

describe('alternativesPathCategories', () => {
	it('recognizes known category slugs', () => {
		expect(isAlternativesPathCategorySlug('social-scheduler')).toBe(true);
		expect(isAlternativesPathCategorySlug('directory-submission')).toBe(true);
		expect(isAlternativesPathCategorySlug('categories')).toBe(false);
	});

	it('maps hub filter categories to path slugs', () => {
		expect(alternativesPathCategorySlugForHubCategory('social')).toBe('social-scheduler');
		expect(alternativesPathCategorySlugForHubCategory('directory')).toBe('directory-submission');
	});

	it('maps each slug to a hub filter category', () => {
		expect(PUBLIC_ALTERNATIVES_PATH_CATEGORIES['social-scheduler'].hubFilterCategory).toBe('social');
		expect(PUBLIC_ALTERNATIVES_PATH_CATEGORIES['directory-submission'].hubFilterCategory).toBe(
			'directory'
		);
	});
});
