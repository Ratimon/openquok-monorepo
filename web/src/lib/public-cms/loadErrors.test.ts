import { describe, expect, it } from 'vitest';

import { ApiError } from '$lib/core/HttpGateway';
import { throwPublicCmsLoadError } from '$lib/public-cms/loadErrors';

function apiError(status: number): ApiError {
	return new ApiError(`Request failed with status ${status}`, {
		status,
		statusText: 'Error',
		headers: {},
		data: { message: 'Too many requests' },
		request: { url: '/api/v1/blog-system/posts/x', method: 'GET' as never },
		ok: false
	});
}

describe('throwPublicCmsLoadError', () => {
	it('maps 429 to SvelteKit 503', () => {
		try {
			throwPublicCmsLoadError(apiError(429));
			expect.unreachable('should throw');
		} catch (err) {
			expect(err).toMatchObject({ status: 503, body: { message: 'Temporarily unavailable' } });
		}
	});

	it('maps 5xx ApiError to 503', () => {
		try {
			throwPublicCmsLoadError(apiError(502));
			expect.unreachable('should throw');
		} catch (err) {
			expect(err).toMatchObject({ status: 503 });
		}
	});
});
