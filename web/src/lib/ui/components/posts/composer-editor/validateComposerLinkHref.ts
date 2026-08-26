import { normalizeContentEditorLinkHref } from '$lib/ui/editor/normalizeContentEditorLinkHref';

const BARE_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Resolve a composer link URL for markdown/html modes.
 * Rejects ftp:, file:, mailto:, and bare email addresses.
 */
export function validateComposerLinkHref(raw: string): string | null {
	const url = raw.trim();
	if (!url) return null;

	const lower = url.toLowerCase();
	if (lower.startsWith('ftp:') || lower.startsWith('file:') || lower.startsWith('mailto:')) {
		return null;
	}
	if (BARE_EMAIL_RE.test(url)) return null;

	return normalizeContentEditorLinkHref(url);
}
