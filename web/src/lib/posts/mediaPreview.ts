import { mediaRepository } from '$lib/core/index';

/** True when the URL targets the authenticated media download route (needs Bearer; not usable as raw `<img src>`). */
export function isAuthenticatedMediaDownloadHref(href: string): boolean {
	if (typeof window === 'undefined') return false;
	try {
		const u = href.startsWith('http') ? new URL(href) : new URL(href, window.location.origin);
		return u.pathname.includes('/media/download') && u.searchParams.has('path');
	} catch {
		return false;
	}
}

/**
 * For public R2 URLs or blog image URLs, returns `href` unchanged.
 * For `/api/v1/media/download?path=…`, fetches with the session Bearer token and returns a `blob:` URL (caller should revoke when done).
 */
export async function resolveMediaPreviewUrl(href: string): Promise<string> {
	if (typeof window === 'undefined') return href;
	if (!isAuthenticatedMediaDownloadHref(href)) return href;

	try {
		const u = href.startsWith('http') ? new URL(href) : new URL(href, window.location.origin);
		const path = u.searchParams.get('path');
		if (!path) return href;

		const pm = await mediaRepository.getBlobByPath(path);
		if (!pm?.blob) return href;
		return URL.createObjectURL(pm.blob);
	} catch {
		return href;
	}
}
