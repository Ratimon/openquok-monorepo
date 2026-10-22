import { isExternalBlogHref } from '$lib/blogs/utils/blogContent';
import { OPENQUOK_HOSTED_WEB_ORIGIN } from '$lib/utils/hostedMarketingHref';

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

/** Origin used to expand root-relative links in the link dialog (current page, else marketing site). */
export function getContentEditorLinkSiteOrigin(): string {
	if (typeof window !== 'undefined' && window.location?.origin) {
		return window.location.origin;
	}
	return OPENQUOK_HOSTED_WEB_ORIGIN;
}

/**
 * Show a stored `href` as a full URL in the link dialog so `/path` is not mistaken for an off-site path.
 */
export function formatContentEditorLinkHrefForDisplay(href: string, siteOrigin: string): string {
	const trimmed = href.trim();
	if (!trimmed) return '';
	if (
		trimmed.startsWith('#') ||
		trimmed.startsWith('mailto:') ||
		trimmed.startsWith('tel:')
	) {
		return trimmed;
	}
	if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
		try {
			return new URL(trimmed, siteOrigin).href;
		} catch {
			return trimmed;
		}
	}
	if (trimmed.startsWith('//')) {
		return `https:${trimmed}`;
	}
	if (/^https?:\/\//i.test(trimmed)) {
		return trimmed;
	}
	const withScheme = normalizeContentEditorLinkHref(trimmed);
	return withScheme ?? trimmed;
}

/**
 * Parse dialog input into the `href` stored in HTML (relative for same-site paths when possible).
 */
export function resolveContentEditorLinkHrefForStorage(
	raw: string,
	_siteOrigin: string
): string | null {
	const normalized = normalizeContentEditorLinkHref(raw);
	if (!normalized) return null;

	if (
		normalized.startsWith('#') ||
		normalized.startsWith('mailto:') ||
		normalized.startsWith('tel:')
	) {
		return normalized;
	}

	if (normalized.startsWith('/') && !normalized.startsWith('//')) {
		return normalized;
	}

	if (/^https?:\/\//i.test(normalized) && !isExternalBlogHref(normalized)) {
		try {
			const parsed = new URL(normalized);
			const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
			return path || '/';
		} catch {
			return normalized;
		}
	}

	return normalized;
}
