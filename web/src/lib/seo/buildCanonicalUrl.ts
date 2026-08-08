import type { MetaTagsProps } from 'svelte-meta-tags';

/** Path-only canonical URL — strips query strings and hash fragments. */
export function buildCanonicalUrl(url: Pick<URL, 'pathname' | 'origin'>): string {
	return new URL(url.pathname, url.origin).href;
}

type CanonicalMetaOverrides = Partial<Pick<MetaTagsProps, 'openGraph' | 'twitter' | 'titleTemplate'>>;

/**
 * Merge `createMetaData` output with a request-scoped canonical.
 * Spread `metaTags` first so pathname-based canonical wins over company-config URLs.
 */
export function withCanonicalMetaTags(
	metaTags: MetaTagsProps,
	canonical: string,
	overrides?: CanonicalMetaOverrides
): MetaTagsProps {
	const additionalMetaTags = (metaTags.additionalMetaTags ?? []).map((tag) => {
		if ('property' in tag && tag.property === 'twitter:url') {
			return { ...tag, content: canonical };
		}
		return tag;
	});

	return Object.freeze({
		...metaTags,
		...overrides,
		canonical,
		openGraph: {
			...metaTags.openGraph,
			...overrides?.openGraph,
			url: canonical
		},
		twitter: {
			...metaTags.twitter,
			...overrides?.twitter
		},
		additionalMetaTags
	}) satisfies MetaTagsProps;
}
