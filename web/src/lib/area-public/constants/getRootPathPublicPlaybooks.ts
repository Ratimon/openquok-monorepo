/** Route segment for the public playbooks hub (no leading slash). */
export function getRootPathPublicPlaybooks(): string {
	return 'playbooks';
}

/** Legacy single-segment hub path kept for redirects: `playbooks/{slug}`. */
export function getLegacyRootPathPublicPlaybook(playbookSlug: string): string {
	return `${getRootPathPublicPlaybooks()}/${encodeURIComponent(playbookSlug)}`;
}
