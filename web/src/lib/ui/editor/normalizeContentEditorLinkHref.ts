/**
 * Resolve a URL from the content-editor link prompt.
 * Keep same-site paths (`/tools/skill-builder`) so they stay dofollow on display.
 */
export function normalizeContentEditorLinkHref(raw: string): string | null {
	const url = raw.trim();
	if (!url) return null;
	if (
		url.startsWith('/') ||
		url.startsWith('#') ||
		url.startsWith('mailto:') ||
		url.startsWith('tel:') ||
		/^https?:\/\//i.test(url)
	) {
		return url;
	}
	return `https://${url}`;
}
