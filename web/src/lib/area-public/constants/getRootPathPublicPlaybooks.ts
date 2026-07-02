/** Route segment for the public playbooks hub (no leading slash). */
export function getRootPathPublicPlaybooks(): string {
	return 'playbooks';
}

/** Public playbook detail page: `playbooks/{slug}` (no leading slash). */
export function getRootPathPublicPlaybook(slug: string): string {
	return `${getRootPathPublicPlaybooks()}/${slug}`;
}
