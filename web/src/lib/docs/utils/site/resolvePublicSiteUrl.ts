import { docsConfig } from '$lib/docs/constants';

/** Canonical public origin for feeds and sitemaps (env overrides request). */
export function resolvePublicSiteUrl(requestUrl: URL): string {
	const trimmed = (s: string) => s.replace(/\/$/, '');
	const fromDocs = docsConfig.site.url?.trim();
	if (fromDocs) return trimmed(fromDocs);
	const envUrl =
		(typeof process !== 'undefined' && process.env.VITE_PUBLIC_SITE_URL?.trim()) ||
		(typeof process !== 'undefined' && process.env.SITE_URL?.trim());
	if (envUrl) return trimmed(envUrl);
	return requestUrl.origin;
}
