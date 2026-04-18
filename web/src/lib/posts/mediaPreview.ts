/** Legacy: media previews use public object URLs ({@link publicUrlForMediaStorageKey}) or list `publicUrl`, not authenticated download routes. */
export function isAuthenticatedMediaDownloadHref(href: string): boolean {
	if (typeof window === 'undefined') return false;
	try {
		const u = href.startsWith('http') ? new URL(href) : new URL(href, window.location.origin);
		return u.pathname.includes('/media/download') && u.searchParams.has('organizationId');
	} catch {
		return false;
	}
}

/** Returns `href` unchanged. User media previews use public storage URLs, not gated `/media/download`. */
export async function resolveMediaPreviewUrl(href: string): Promise<string> {
	return href;
}
