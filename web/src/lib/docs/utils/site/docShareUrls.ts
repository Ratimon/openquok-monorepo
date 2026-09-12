import { base } from '$app/paths';

import { docsConfig } from '$lib/docs/constants';

function defaultLocale(): string {
	return docsConfig.i18n?.defaultLocale ?? 'en';
}

/** Path to the rendered doc page (respects base path). */
export function docsPagePath(slug: string, locale?: string): string {
	const def = defaultLocale();
	if (!locale || locale === def) {
		return slug ? `${base}/docs/${slug}` : `${base}/docs`;
	}
	return slug ? `${base}/docs/${locale}/${slug}` : `${base}/docs/${locale}`;
}

/** Path to the raw Markdown endpoint for this page (respects base path). */
export function docsMarkdownPath(slug: string, locale?: string): string {
	const def = defaultLocale();
	if (!locale || locale === def) {
		return slug ? `${base}/docs/${slug}/markdown` : `${base}/docs/markdown`;
	}
	return slug ? `${base}/docs/${locale}/${slug}/markdown` : `${base}/docs/${locale}/markdown`;
}

/** Prefer configured public site URL; otherwise use the request origin. */
export function canonicalDocsOrigin(fallbackOrigin: string): string {
	const cfg = docsConfig.site.url?.trim();
	if (cfg) return cfg.replace(/\/$/, '');
	return fallbackOrigin;
}

export function absoluteDocsUrl(path: string, origin: string): string {
	const root = canonicalDocsOrigin(origin);
	return new URL(path, `${root}/`).href;
}
