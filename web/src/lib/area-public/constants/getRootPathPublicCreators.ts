/** Route segment for the public creators hub (no leading slash). */
export function getRootPathPublicCreators(): string {
	return 'creators';
}

/** Public creator profile page: `creators/{username}` (no leading slash). */
export function getRootPathPublicCreator(username: string): string {
	return `${getRootPathPublicCreators()}/${encodeURIComponent(username)}`;
}
