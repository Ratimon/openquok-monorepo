import { describe, expect, it } from 'vitest';

import { PUBLIC_COMPARE_PRODUCTS } from '$lib/content/constants/competitors';
import { getCompareProductCategory } from '$lib/content/constants/competitors/utils/compareProductCategories';

describe('directory directoryLongForm coverage', () => {
	it('defines directoryLongForm on every directory submission competitor', () => {
		const directory = PUBLIC_COMPARE_PRODUCTS.filter(
			(product) => getCompareProductCategory(product) === 'directory_submission'
		);

		for (const product of directory) {
			expect(product.directoryLongForm, product.slug).toBeDefined();
			expect(product.directoryLongForm!.whyPeopleLook.body).toHaveLength(3);
			expect(product.directoryLongForm!.whenTheyWin.body).toHaveLength(3);
			expect(product.directoryLongForm!.yourOptions.title).toMatch(/OpenQuok/);
		}
	});
});
