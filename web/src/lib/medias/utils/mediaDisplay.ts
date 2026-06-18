/** Human-readable byte size for upload progress and media metadata. */
export function formatBytes(bytes: number): string {
	if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
	const units = ['B', 'KB', 'MB', 'GB'];
	let index = 0;
	let value = bytes;
	while (value >= 1024 && index < units.length - 1) {
		value /= 1024;
		index += 1;
	}
	return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
}

/** Mirrors backend `mediaKindForPath` extension rules for client-side previews. */
export function isVideoMediaPath(path: string): boolean {
	const ext = path.split('.').pop()?.toLowerCase() ?? '';
	return ['mp4', 'mov', 'webm', 'm4v', 'mpeg'].includes(ext);
}

export function isImageMediaPath(path: string): boolean {
	const ext = path.split('.').pop()?.toLowerCase() ?? '';
	return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif'].includes(ext);
}
