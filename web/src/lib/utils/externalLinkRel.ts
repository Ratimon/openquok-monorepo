/** Host suffixes treated as first-party for ExternalLink (trusted + follow). */
const TRUSTED_HOST_SUFFIXES = ['openquok.com', 'npmjs.com', 'github.com'];

export function isTrustedExternalHref(href: string): boolean {
	try {
		const host = new URL(href).hostname.replace(/^www\./, '');
		return TRUSTED_HOST_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
	} catch {
		return false;
	}
}

/** Mirrors ExternalLink.svelte rel attribute rules. */
export function buildExternalLinkRel(options: { trusted?: boolean; follow?: boolean }): string | undefined {
	const relValues: string[] = [];
	if (!options.trusted) relValues.push('noopener', 'noreferrer');
	if (!options.follow) relValues.push('nofollow');
	return relValues.length > 0 ? relValues.join(' ') : undefined;
}

export function externalLinkRelForHref(href: string): string | undefined {
	const trusted = isTrustedExternalHref(href);
	return buildExternalLinkRel({ trusted, follow: trusted });
}
