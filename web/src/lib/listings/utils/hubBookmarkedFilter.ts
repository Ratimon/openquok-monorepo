/** Shared `?bookmarked=1` query flag for public listing hubs and account saved URLs. */
export function parseHubBookmarkedOnlyFromUrl(searchParams: URLSearchParams): boolean {
	const value = searchParams.get('bookmarked');
	return value === '1' || value === 'true';
}

export function appendHubBookmarkedOnlyQueryParam(
	params: URLSearchParams,
	bookmarkedOnly?: boolean
): void {
	if (bookmarkedOnly) {
		params.set('bookmarked', '1');
	}
}
