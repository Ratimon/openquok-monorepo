export type CategoryLike = {
	id: string;
	name: string;
	slug?: string;
	parentId?: string | null;
};

export function createCategoryPath<T extends CategoryLike>(category: T, allCategories: T[]): string {
	const path: string[] = [category.name];
	let current: T | undefined = category;

	while (current && current.parentId) {
		const parentCategory = allCategories.find((c) => c.id === current!.parentId);
		if (!parentCategory) break;
		path.unshift(parentCategory.name);
		current = parentCategory;
	}

	return path.join(' > ');
}

export function sortCategories<T extends CategoryLike>(categories: T[]): T[] {
	const safeAll = [...categories];
	return safeAll.sort((a, b) => createCategoryPath(a, safeAll).localeCompare(createCategoryPath(b, safeAll)));
}

export function createSortedCategoryChoices<T extends CategoryLike>(
	categories: T[]
): { value: string; label: string; slug?: string }[] {
	const safeAll = [...categories];
	return safeAll
		.map((category) => ({
			value: category.id,
			label: createCategoryPath(category, safeAll),
			...(category.slug ? { slug: category.slug } : {})
		}))
		.sort((a, b) => a.label.localeCompare(b.label));
}
