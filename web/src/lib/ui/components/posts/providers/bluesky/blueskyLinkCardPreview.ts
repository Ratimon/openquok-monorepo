/** Resolve URL for parsing (preview may receive values normalized at publish time). */
function parseLinkCardUrl(url: string): URL | null {
	const trimmed = url.trim();
	if (!trimmed) return null;
	try {
		return new URL(trimmed);
	} catch {
		try {
			return new URL(`https://${trimmed}`);
		} catch {
			return null;
		}
	}
}

function titleCaseWords(text: string): string {
	return text
		.split(/\s+/)
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
}

/** Placeholder title when Link title is empty in composer settings. */
export function mockBlueskyLinkCardTitle(url: string): string {
	const parsed = parseLinkCardUrl(url);
	if (!parsed) return 'Page title';

	const segment = parsed.pathname.replace(/\/$/, '').split('/').filter(Boolean).pop();
	if (segment) {
		const decoded = decodeURIComponent(segment);
		const words = decoded.replace(/[-_+.]+/g, ' ').trim();
		if (words) return titleCaseWords(words).slice(0, 120);
	}

	const host = parsed.hostname.replace(/^www\./, '');
	const site = host.split('.')[0] ?? host;
	if (!site) return 'Page title';
	return titleCaseWords(site.replace(/[-_]+/g, ' '));
}

/** Placeholder description when Link description is empty in composer settings. */
export function mockBlueskyLinkCardDescription(url: string, hostname: string): string {
	const parsed = parseLinkCardUrl(url);
	const hostLabel = parsed?.hostname.replace(/^www\./, '') || hostname.replace(/^www\./, '');
	if (hostLabel) return `Summary from ${hostLabel}`;
	return 'Link preview description';
}
