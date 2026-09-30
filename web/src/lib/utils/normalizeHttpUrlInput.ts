/**
 * Ensures a user-typed URL has a valid http(s) scheme.
 * Fixes missing schemes and `https:host` / `http:host` (no `//`).
 */
export function normalizeHttpUrlInput(raw: string): string {
	const url = raw.trim();
	if (!url) return '';

	const schemeMissingSlashes = url.match(/^(https?):([^/].+)$/i);
	if (schemeMissingSlashes) {
		return `${schemeMissingSlashes[1].toLowerCase()}://${schemeMissingSlashes[2]}`;
	}

	if (/^https?:\/\//i.test(url)) return url;
	return `https://${url}`;
}

/** X community field may be a numeric ID only — do not prepend https to bare digits. */
export function normalizeXCommunityUrlInput(raw: string): string {
	const trimmed = raw.trim();
	if (!trimmed) return '';
	if (/^\d+$/.test(trimmed)) return trimmed;
	return normalizeHttpUrlInput(trimmed);
}
