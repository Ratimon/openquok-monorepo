/**
 * Server order is preserved; local-only slugs append in local order without duplicates.
 */
export function mergeBuildBacklinksBookmarkSlugs(
	serverOrderedSlugs: string[],
	localOrderedSlugs: string[]
): string[] {
	const seen = new Set(serverOrderedSlugs);
	const merged = [...serverOrderedSlugs];
	for (const slug of localOrderedSlugs) {
		if (!slug.trim() || seen.has(slug)) continue;
		merged.push(slug);
		seen.add(slug);
	}
	return merged;
}
