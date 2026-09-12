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

const VIDEO_PREVIEW_URL_RE = /\.(mp4|webm|mov|m4v|mpeg)(\?|#|$)/i;

/**
 * Whether a composer preview URL should render as `<video>` (not `<img>`).
 * `blob:` preview URLs have no extension — pass the parallel storage `path` when available.
 */
export function isVideoPreviewSource(
	previewUrl: string,
	storagePath?: string | null
): boolean {
	const url = previewUrl.trim();
	if (!url) return false;
	if (VIDEO_PREVIEW_URL_RE.test(url)) return true;
	const path = storagePath?.trim();
	if (!path || path.startsWith('blob:')) return false;
	return isVideoMediaPath(path);
}
