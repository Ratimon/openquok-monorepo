/** Route segment for the public creators hub (no leading slash). */
export function getRootPathPublicCreators(): string {
	return 'creators';
}

/** Public creator profile page: `creators/{username}` (no leading slash). */
export function getRootPathPublicCreator(username: string): string {
	return `${getRootPathPublicCreators()}/${encodeURIComponent(username)}`;
}

/** Public building block detail: `creators/{username}/building-blocks/{slug}` (no leading slash). */
export function getRootPathPublicCreatorBuildingBlock(
	username: string,
	listingSlug: string
): string {
	return `${getRootPathPublicCreator(username)}/building-blocks/${encodeURIComponent(listingSlug)}`;
}

/** Public playbook detail: `creators/{username}/playbooks/{slug}` (no leading slash). */
export function getRootPathPublicCreatorPlaybook(username: string, listingSlug: string): string {
	return `${getRootPathPublicCreator(username)}/playbooks/${encodeURIComponent(listingSlug)}`;
}
