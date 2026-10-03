export type SavedHubTabId = 'libs' | 'backlinks';
export type SavedLibsSegmentId = 'browse' | 'library';

const TAB_PARAM = 'tab';
const LIBS_PARAM = 'libs';
const BOOKMARKED_PARAM = 'bookmarked';

/** Top-level Saved hub tab from `?tab=` (defaults to Libs). */
export function parseSavedHubTab(value: string | null): SavedHubTabId {
	if (value === 'backlinks') return 'backlinks';
	return 'libs';
}

/** Libs inner segment from `?libs=` and legacy `?tab=explore|mine`. */
export function parseSavedLibsSegment(
	tabParam: string | null,
	libsParam: string | null
): SavedLibsSegmentId {
	if (libsParam === 'library') return 'library';
	if (libsParam === 'browse') return 'browse';
	if (tabParam === 'mine') return 'library';
	if (tabParam === 'explore') return 'browse';
	return 'browse';
}

export function parseSavedBookmarkedFilter(value: string | null): boolean {
	return value === '1' || value === 'true';
}

export function buildAccountSavedHubSearchParams(options: {
	tab: SavedHubTabId;
	libsSegment?: SavedLibsSegmentId;
	bookmarkedOnly?: boolean;
}): string {
	const params = new URLSearchParams();

	if (options.tab === 'backlinks') {
		params.set(TAB_PARAM, 'backlinks');
		return params.toString();
	}

	params.set(TAB_PARAM, 'libs');
	if (options.libsSegment === 'library') {
		params.set(LIBS_PARAM, 'library');
	}
	if (options.bookmarkedOnly) {
		params.set(BOOKMARKED_PARAM, '1');
	}
	return params.toString();
}
