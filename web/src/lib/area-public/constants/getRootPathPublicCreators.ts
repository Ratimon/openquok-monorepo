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
export function getRootPathPublicCreatorPlaybook(username: string, playbookSlug: string): string {
	return `${getRootPathPublicCreator(username)}/playbooks/${encodeURIComponent(playbookSlug)}`;
}

/** Legacy hub-nested path: `building-blocks/{username}/{slug}` — redirect only. */
export function getLegacyNestedBuildingBlockPath(userSlug: string, listingSlug: string): string {
	return `building-blocks/${encodeURIComponent(userSlug)}/${encodeURIComponent(listingSlug)}`;
}

/** Legacy hub-nested path: `playbooks/{username}/{slug}` — redirect only. */
export function getLegacyNestedPlaybookPath(userSlug: string, playbookSlug: string): string {
	return `playbooks/${encodeURIComponent(userSlug)}/${encodeURIComponent(playbookSlug)}`;
}
