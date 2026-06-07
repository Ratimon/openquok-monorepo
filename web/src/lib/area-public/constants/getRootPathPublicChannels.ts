/** Route segment for the public channels index (no leading slash). */
export function getRootPathPublicChannels(): string {
	return 'channels';
}

/** Public channel landing page: `channels/{slug}` (no leading slash). */
export function getRootPathPublicChannel(slug: string): string {
	return `${getRootPathPublicChannels()}/${slug}`;
}
