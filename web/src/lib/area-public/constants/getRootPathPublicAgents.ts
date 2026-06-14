/** Route segment for the public agents index (no leading slash). */
export function getRootPathPublicAgents(): string {
	return 'agents';
}

/** Public agent landing page: `agents/{slug}` (no leading slash). */
export function getRootPathPublicAgent(slug: string): string {
	return `${getRootPathPublicAgents()}/${slug}`;
}
