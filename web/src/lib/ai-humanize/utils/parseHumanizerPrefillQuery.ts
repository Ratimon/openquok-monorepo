/** Query key used when the browser extension opens Humanizer with a selection. */
export const HUMANIZER_PREFILL_QUERY_PARAM = 'text';

/** Max plain-text length passed via URL (aligned with extension opener). */
export const HUMANIZER_PREFILL_MAX_CHARS = 2200;

export function coerceHumanizerPrefillText(
	value: unknown,
	maxChars: number = HUMANIZER_PREFILL_MAX_CHARS
): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	if (trimmed.length > maxChars) return trimmed.slice(0, maxChars);
	return trimmed;
}

export function parseHumanizerPrefillQuery(params: URLSearchParams): string | null {
	return coerceHumanizerPrefillText(params.get(HUMANIZER_PREFILL_QUERY_PARAM));
}

/** Remove extension prefill from the address bar without a SvelteKit navigation (keeps composer state). */
export function stripHumanizerPrefillFromBrowserUrl(): void {
	if (typeof window === 'undefined') return;
	const url = new URL(window.location.href);
	if (!url.searchParams.has(HUMANIZER_PREFILL_QUERY_PARAM)) return;
	url.searchParams.delete(HUMANIZER_PREFILL_QUERY_PARAM);
	const next = `${url.pathname}${url.search}${url.hash}`;
	window.history.replaceState(window.history.state, '', next);
}
