/**
 * Align blog-body `<a>` tags with ExternalLink defaults for third-party URLs,
 * while keeping same-site / relative links followable for SEO.
 *
 * External (http/https to other hosts): `rel="noopener noreferrer nofollow"` + `target="_blank"`.
 * Internal (relative, hash, mailto/tel, own openquok.com host): strip forced TipTap rel/target.
 */

const OWN_HOST_SUFFIX = 'openquok.com';

function readHref(attrBlob: string): string {
	const match = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrBlob);
	return (match?.[1] ?? match?.[2] ?? match?.[3] ?? '').trim();
}

function stripRelAndTarget(attrBlob: string): string {
	return attrBlob
		.replace(/\s*\brel\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
		.replace(/\s*\btarget\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
		.trim();
}

function hostnameFromHref(href: string): string | null {
	try {
		if (href.startsWith('//')) {
			return new URL(`https:${href}`).hostname.toLowerCase();
		}
		return new URL(href).hostname.toLowerCase();
	} catch {
		return null;
	}
}

function isOwnSiteHostname(hostname: string): boolean {
	const h = hostname.toLowerCase();
	if (h === 'localhost' || h.endsWith('.localhost')) return true;
	return h === OWN_HOST_SUFFIX || h.endsWith(`.${OWN_HOST_SUFFIX}`);
}

/** True when the link should use ExternalLink-style defaults (untrusted + nofollow). */
export function isExternalBlogHref(href: string): boolean {
	const h = href.trim();
	if (!h) return false;
	if (h.startsWith('#') || h.startsWith('mailto:') || h.startsWith('tel:')) return false;
	if (h.startsWith('/') && !h.startsWith('//')) return false;
	if (!/^https?:\/\//i.test(h) && !h.startsWith('//')) {
		// Relative / other non-http schemes — not ExternalLink territory.
		return false;
	}
	const hostname = hostnameFromHref(h);
	if (!hostname) return true;
	if (isOwnSiteHostname(hostname)) return false;
	if (typeof window !== 'undefined' && window.location?.hostname) {
		if (hostname === window.location.hostname.toLowerCase()) return false;
	}
	return true;
}

export function normalizeBlogContentLinks(html: string): string {
	if (!html.trim()) return html;

	return html.replace(/<a\b([^>]*)>/gi, (full, attrBlob: string) => {
		const href = readHref(attrBlob);
		if (!href) return full;

		const attrs = stripRelAndTarget(attrBlob);
		if (isExternalBlogHref(href)) {
			const externalAttrs = 'rel="noopener noreferrer nofollow" target="_blank"';
			return attrs.length > 0 ? `<a ${attrs} ${externalAttrs}>` : `<a ${externalAttrs}>`;
		}
		return attrs.length > 0 ? `<a ${attrs}>` : '<a>';
	});
}
