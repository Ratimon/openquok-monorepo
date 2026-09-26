import { describe, expect, it } from 'vitest';

import { ApiError, withOptionalCmsFallback } from '$lib/core/HttpGateway';

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
