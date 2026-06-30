/** Route segment for the public tools hub (no leading slash). */
export function getRootPathPublicTools(): string {
	return 'tools';
}

/** Agent stack builder: `tools/agent-builder` (no leading slash). */
export function getRootPathPublicAgentBuilder(): string {
	return `${getRootPathPublicTools()}/agent-builder`;
}
