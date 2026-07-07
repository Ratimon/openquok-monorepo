/** Route segment for the public agents index (no leading slash). */
export function getRootPathPublicAgents(): string {
	return 'agents';
}

/** Public agent landing page: `agents/{slug}` (no leading slash). */
export function getRootPathPublicAgent(slug: string): string {
	return `${getRootPathPublicAgents()}/${slug}`;
}

/** Platform-specific agent landing page: `agents/{agentSlug}/{channelSlug}` (no leading slash). */
export function getRootPathPublicAgentChannel(agentSlug: string, channelSlug: string): string {
	return `${getRootPathPublicAgent(agentSlug)}/${channelSlug.trim()}`;
}
