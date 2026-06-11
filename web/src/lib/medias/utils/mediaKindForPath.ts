/** Mirrors backend `mediaKindForPath` extension rules for client-side previews. */
export function isVideoMediaPath(path: string): boolean {
	const ext = path.split('.').pop()?.toLowerCase() ?? '';
	return ['mp4', 'mov', 'webm', 'm4v', 'mpeg'].includes(ext);
}

export function isImageMediaPath(path: string): boolean {
	const ext = path.split('.').pop()?.toLowerCase() ?? '';
	return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif'].includes(ext);
}
