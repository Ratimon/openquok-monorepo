/** Default sort_order for a new opportunity on a site (10, 20, 30… seed convention). */
export function defaultLinkDirectoryOpportunitySortOrder(
	existing: ReadonlyArray<{ sortOrder: number }>
): number {
	if (existing.length === 0) {
		return 10;
	}
	const max = Math.max(...existing.map((row) => row.sortOrder));
	return max + 10;
}
