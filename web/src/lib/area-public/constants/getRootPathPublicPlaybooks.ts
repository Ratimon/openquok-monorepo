/** Route segment for the public playbooks hub (no leading slash). */
export function getRootPathPublicPlaybooks(): string {
	return 'playbooks';
}

/** All playbook categories index: `playbooks/categories`. */
export function getRootPathPublicPlaybooksCategories(): string {
	return `${getRootPathPublicPlaybooks()}/categories`;
}

/** Playbooks in one category: `playbooks/categories/{categorySlug}`. */
export function getRootPathPublicPlaybooksCategory(categorySlug: string): string {
	return `${getRootPathPublicPlaybooksCategories()}/${encodeURIComponent(categorySlug)}`;
}

/** All playbook tags index: `playbooks/tags`. */
export function getRootPathPublicPlaybooksTags(): string {
	return `${getRootPathPublicPlaybooks()}/tags`;
}

/** Playbooks with one tag: `playbooks/tags/{tagSlug}`. */
export function getRootPathPublicPlaybooksTag(tagSlug: string): string {
	return `${getRootPathPublicPlaybooksTags()}/${encodeURIComponent(tagSlug)}`;
}

/** Category + tag (or tag group) filter: `playbooks/categories/{categorySlug}/tags/{tagSlug}`. */
export function getRootPathPublicPlaybooksCategoryTag(
	categorySlug: string,
	tagPathSlug: string
): string {
	return `${getRootPathPublicPlaybooksCategory(categorySlug)}/tags/${encodeURIComponent(tagPathSlug)}`;
}
