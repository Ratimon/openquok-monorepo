import { describe, expect, it } from 'vitest';

import { ApiError, withNotFoundFallback, withOptionalCmsFallback } from '$lib/core/HttpGateway';

function apiError(status: number): ApiError {
	return new ApiError(`Request failed with status ${status}`, {
		status,
		statusText: String(status),
		headers: {},
		data: null,
		request: { url: '/test', method: 'GET', headers: {} },
		ok: false
	});
}

describe('withNotFoundFallback', () => {
	it('returns fallback on 404 and 403', async () => {
		for (const status of [404, 403]) {
			await expect(
				withNotFoundFallback(async () => {
					throw apiError(status);
				}, null)
			).resolves.toBeNull();
		}
	});

	it('rethrows 429', async () => {
		await expect(
			withNotFoundFallback(async () => {
				throw apiError(429);
			}, null)
		).rejects.toThrow('429');
	});

	it('returns fallback on duck-typed 403 errors', async () => {
		await expect(
			withNotFoundFallback(async () => {
				throw { status: 403, message: 'Forbidden' };
			}, null)
		).resolves.toBeNull();
	});
});

describe('withOptionalCmsFallback', () => {
	it('returns the run result on success', async () => {
		await expect(withOptionalCmsFallback(async () => 'ok', 'fallback')).resolves.toBe('ok');
	});

	it('returns fallback on ApiError including 5xx', async () => {
		const error = new ApiError('Request failed with status 500', {
			status: 500,
			statusText: 'Internal Server Error',
			headers: {},
			data: null,
			request: { url: '/test', method: 'GET', headers: {} },
			ok: false
		});

		await expect(
			withOptionalCmsFallback(async () => {
				throw error;
			}, { listings: [] })
		).resolves.toEqual({ listings: [] });
	});

	it('returns fallback on transport errors', async () => {
		await expect(
			withOptionalCmsFallback(async () => {
				throw new TypeError('fetch failed');
			}, null)
		).resolves.toBeNull();
	});
});
