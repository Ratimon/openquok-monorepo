import type { ApiRequestOptions } from '$lib/core/HttpGateway';

/**
 * Options for anonymous public CMS API reads during SSR.
 * Pairs with backend `Cache-Control` on `/company/*`, `/blog-system/*`, `/listings/*`, etc.
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
