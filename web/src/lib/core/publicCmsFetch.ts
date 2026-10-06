import type { ApiRequestOptions } from '$lib/core/HttpGateway';

/**
 * Options for anonymous public CMS API reads during SSR.
 * Pairs with backend `Cache-Control` on `/company/*`, `/blog-system/*`, `/listings/*`, etc.
 *
 * Editor-managed **detail** reads (post/listing/stack/site by slug, blog comments) use
 * {@link publicCmsEditorManagedDetailRequestOptions} (`cache: 'no-store'`) so SvelteKit does not
 * reuse stale JSON when the API is `private, no-cache`. HTML document headers are separate — see
 * `applyPublicHtmlCacheHeadersForPathname` and cache-design → Public CMS HTTP cache layers.
 */
export function publicCmsServerRequestOptions(
	fetch?: typeof globalThis.fetch
): Pick<ApiRequestOptions, 'withCredentials' | 'cache' | 'fetch'> {
	return {
		withCredentials: false,
		cache: 'default',
		...(fetch ? { fetch } : {})
	};
}

/** SSR fetch options for editor-managed public detail endpoints (no-store + anonymous). */
export function publicCmsEditorManagedDetailRequestOptions(
	fetch?: typeof globalThis.fetch
): Pick<ApiRequestOptions, 'withCredentials' | 'cache' | 'fetch'> {
	return {
		...publicCmsServerRequestOptions(fetch),
		cache: 'no-store'
	};
}
