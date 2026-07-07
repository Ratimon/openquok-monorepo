/** Route segment for the public compare hub (no leading slash). */
export function getRootPathPublicCompare(): string {
	return 'compare';
}

/** Product comparison detail page: `compare/{productA}/{productB}` (no leading slash). */
export function getRootPathPublicComparePair(productA: string, productB: string): string {
	return `${getRootPathPublicCompare()}/${productA.trim()}/${productB.trim()}`;
}
