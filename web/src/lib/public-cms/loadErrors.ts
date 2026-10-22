import { error } from '@sveltejs/kit';

import { isApiError, messageFromApiError } from '$lib/core/HttpGateway';

/** Map public CMS API failures during SSR to SvelteKit errors (avoid raw ApiError → 500). */
export function throwPublicCmsLoadError(err: unknown): never {
	if (isApiError(err)) {
		if (err.status === 429) {
			throw error(503, 'Temporarily unavailable');
		}
		if (err.status >= 500) {
			throw error(503, messageFromApiError(err, 'Temporarily unavailable'));
		}
		throw error(err.status, messageFromApiError(err, 'Request failed'));
	}
	throw err;
}
