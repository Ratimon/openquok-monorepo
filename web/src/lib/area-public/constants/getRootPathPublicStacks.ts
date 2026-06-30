/** Route segment for the public extension stacks hub (no leading slash). */
export function getRootPathPublicStacks(): string {
	return 'stacks';
}

/** Public stack detail page: `stacks/{slug}` (no leading slash). */
export function getRootPathPublicStack(slug: string): string {
	return `${getRootPathPublicStacks()}/${slug}`;
}
