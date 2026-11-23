/** Section copy for the category sibling grid on `/build-backlinks/{slug}` detail pages. */
export function buildBuildBacklinksCategorySiblingGridTitle(categoryName: string): string {
	const category = categoryName.trim();
	return category.length > 0
		? `Build more Backlinks from other ${category}`
		: 'Build more Backlinks from other sites';
}

export function buildBuildBacklinksCategorySiblingGridDescription(
	siteTitle: string,
	categoryName: string
): string {
	const title = siteTitle.trim();
	const category = categoryName.trim();
	if (title.length > 0 && category.length > 0) {
		return `Start with ${title}, then open step-by-step backlink guides for every other site in ${category}.`;
	}
	if (category.length > 0) {
		return `Open step-by-step backlink guides for other sites in ${category}.`;
	}
	return 'Open step-by-step backlink guides for related sites in this category.';
}

export function buildBuildBacklinksCategorySiblingGridCardDescription(siteTitle: string): string {
	const title = siteTitle.trim();
	return title.length > 0
		? `See backlink opportunities and how-to steps for ${title}.`
		: 'See backlink opportunities and how-to steps.';
}