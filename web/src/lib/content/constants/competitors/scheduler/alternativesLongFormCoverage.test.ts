import { describe, expect, it } from 'vitest';

import { PUBLIC_COMPARE_PRODUCTS } from '$lib/content/constants/competitors';
import { getCompareProductCategory } from '$lib/content/constants/competitors/utils/compareProductCategories';

describe('scheduler alternativesLongForm coverage', () => {
	it('defines alternativesLongForm on every social scheduling competitor', () => {
		const social = PUBLIC_COMPARE_PRODUCTS.filter(
			(product) => getCompareProductCategory(product) === 'social_scheduling'
		);

		for (const product of social) {
			expect(product.alternativesLongForm, product.slug).toBeDefined();
			expect(product.alternativesLongForm!.whyPeopleLook.body).toHaveLength(3);
			expect(product.alternativesLongForm!.whenTheyWin.body).toHaveLength(3);
		}
	});
});
