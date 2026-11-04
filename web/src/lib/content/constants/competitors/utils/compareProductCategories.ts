import type {
	CompareHubPairViewModel,
	ComparePairLayout,
	CompareProduct,
	CompareProductCategory
} from '$lib/content/constants/competitors/types';

export function categoriesOverlap(
	left: readonly CompareProductCategory[],
	right: readonly CompareProductCategory[]
): boolean {
	return left.some((category) => right.includes(category));
}

export function canCompareProducts(left: CompareProduct, right: CompareProduct): boolean {
	if (left.slug === right.slug) return false;
	return categoriesOverlap(left.categories, right.categories);
}

/** Primary category for SEO copy: directory-only products vs everything else. */
export function getCompareProductCategory(product: CompareProduct): CompareProductCategory {
	const onlyDirectory =
		product.categories.length === 1 && product.categories[0] === 'directory_submission';
	return onlyDirectory ? 'directory_submission' : 'social_scheduling';
}

export function isDirectoryOnlyCompareProduct(product: CompareProduct): boolean {
	return (
		product.categories.length === 1 && product.categories[0] === 'directory_submission'
	);
}

export function resolveComparePairLayout(
	left: CompareProduct,
	right: CompareProduct
): ComparePairLayout {
	const directoryPair =
		isDirectoryOnlyCompareProduct(left) || isDirectoryOnlyCompareProduct(right);
	if (!directoryPair) return 'social_matrix';

	const bothDirectoryCapable =
		left.categories.includes('directory_submission') &&
		right.categories.includes('directory_submission');

	return bothDirectoryCapable ? 'directory_long_form' : 'social_matrix';
}

export function filterCompareProductsForCategory(
	products: readonly CompareProduct[],
	category: CompareProductCategory
): CompareProduct[] {
	return products.filter((product) => product.categories.includes(category));
}

export function listComparePairsForCategory(
	products: readonly CompareProduct[],
	baseProduct: CompareProduct,
	category?: CompareProductCategory
): CompareHubPairViewModel[] {
	return products
		.filter((product) => {
			if (product.slug === baseProduct.slug) return false;
			if (category && !product.categories.includes(category)) return false;
			return canCompareProducts(baseProduct, product);
		})
		.map((rightProduct) => ({
			productASlug: baseProduct.slug,
			productBSlug: rightProduct.slug,
			productBName: rightProduct.name
		}));
}
