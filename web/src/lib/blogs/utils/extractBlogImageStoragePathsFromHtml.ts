import { extractBlogImageStoragePathFromImageSrc } from '$lib/blogs/utils/extractBlogImageStoragePathFromImageSrc';

/**
 * Collects `blog_images` object keys referenced by HTML body (src URLs and `data-storage-path`).
 */
export function extractBlogImageStoragePathsFromHtml(html: string): Set<string> {
	const keys = new Set<string>();
	if (!html) return keys;

	const srcRE = /\ssrc\s*=\s*["']([^"']+)["']/gi;
	const storagePathRE = /\sdata-storage-path\s*=\s*["']([^"']+)["']/gi;
	let m: RegExpExecArray | null;
	while ((m = srcRE.exec(html)) !== null) {
		const p = extractBlogImageStoragePathFromImageSrc(m[1]);
		if (p) keys.add(p);
	}
	while ((m = storagePathRE.exec(html)) !== null) {
		const raw = m[1]?.trim().replace(/^\/+/, '') ?? '';
		if (raw && raw !== 'null' && raw !== 'undefined') keys.add(decodeURIComponent(raw));
	}

	return keys;
}
