import { BUILD_BACKLINKS_BOOKMARKS_STORAGE_KEY } from '$lib/link-directory/constants/buildBacklinksBookmarksStorage';

export type BuildBacklinksLocalBookmarkEntry = {
	slug: string;
	siteId: string;
};

function parseStoredEntries(raw: string | null): BuildBacklinksLocalBookmarkEntry[] {
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return [];
		const entries: BuildBacklinksLocalBookmarkEntry[] = [];
		for (const item of parsed) {
			if (
				item &&
				typeof item === 'object' &&
				'slug' in item &&
				'siteId' in item &&
				typeof (item as { slug: unknown }).slug === 'string' &&
				typeof (item as { siteId: unknown }).siteId === 'string'
			) {
				const slug = (item as { slug: string }).slug.trim();
				const siteId = (item as { siteId: string }).siteId.trim();
				if (slug && siteId) entries.push({ slug, siteId });
			}
		}
		return entries;
	} catch {
		return [];
	}
}

export function readBuildBacklinksLocalBookmarks(): BuildBacklinksLocalBookmarkEntry[] {
	if (typeof localStorage === 'undefined') return [];
	return parseStoredEntries(localStorage.getItem(BUILD_BACKLINKS_BOOKMARKS_STORAGE_KEY));
}

export function writeBuildBacklinksLocalBookmarks(entries: BuildBacklinksLocalBookmarkEntry[]): void {
	if (typeof localStorage === 'undefined') return;
	try {
		if (entries.length === 0) {
			localStorage.removeItem(BUILD_BACKLINKS_BOOKMARKS_STORAGE_KEY);
			return;
		}
		localStorage.setItem(BUILD_BACKLINKS_BOOKMARKS_STORAGE_KEY, JSON.stringify(entries));
	} catch {
		// Best-effort persistence.
	}
}

export function clearBuildBacklinksLocalBookmarks(): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.removeItem(BUILD_BACKLINKS_BOOKMARKS_STORAGE_KEY);
	} catch {
		// ignore
	}
}
