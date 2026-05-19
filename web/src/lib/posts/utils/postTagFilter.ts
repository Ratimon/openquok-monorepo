import type { CalendarPostRowViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

function normalizeTagName(name: string): string {
	return String(name ?? '').trim().toLowerCase();
}

/** Returns true when the item has at least one of the selected tag names. */
export function matchesTagFilters(
	tagNames: readonly string[] | undefined,
	selectedTagNames: Set<string>
): boolean {
	const tags = tagNames ?? [];
	return tags.some((n) => selectedTagNames.has(normalizeTagName(n)));
}

/** Returns true when the row has at least one of the selected tag names. */
export function rowMatchesTagFilters(
	rowVm: CalendarPostRowViewModel,
	selectedTagNames: Set<string>
): boolean {
	return matchesTagFilters(rowVm.tagNames, selectedTagNames);
}

export function filterPostsByTags(
	posts: readonly CalendarPostRowViewModel[],
	allTags: boolean,
	selectedTagNames: string[]
): CalendarPostRowViewModel[] {
	if (allTags) return [...posts];

	const selected = new Set(
		selectedTagNames.map(normalizeTagName).filter(Boolean)
	);
	if (selected.size === 0) return [...posts];

	return posts.filter((rowVm) => rowMatchesTagFilters(rowVm, selected));
}
