import { afterEach, describe, expect, it, vi } from 'vitest';

import {
	clearOpenapiSpecCacheForTests,
	loadOpenapiSpec
} from '$lib/docs/utils/openapi/openapiExamples';

const ORIGIN = 'https://docs.example.com';
const SPEC_PATH = '/api/v1/openapi.json';

const minimalSpec = {
	openapi: '3.0.0',
	servers: [{ url: '/api/v1' }],
	paths: {
		'/public/health': {
			get: { summary: 'Health' }
		}
	},
	security: []
};

describe('loadOpenapiSpec', () => {
	afterEach(() => {
		clearOpenapiSpecCacheForTests();
		vi.unstubAllGlobals();
	});

	it('deduplicates fetch per resolved spec URL', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => minimalSpec
		});
		vi.stubGlobal('fetch', fetchMock);

		const first = await loadOpenapiSpec(ORIGIN, '/api/v1/openapi.json');
		const second = await loadOpenapiSpec(ORIGIN, '/api/v1/openapi.json');

		expect(first.ok).toBe(true);
		expect(second.ok).toBe(true);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(fetchMock).toHaveBeenCalledWith(SPEC_PATH, { credentials: 'same-origin' });
	});

	it('allows retry after a failed fetch', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({ ok: false, status: 503 })
			.mockResolvedValueOnce({
				ok: true,
				json: async () => minimalSpec
			});
		vi.stubGlobal('fetch', fetchMock);

		const failed = await loadOpenapiSpec(ORIGIN, '/api/v1/openapi.json');
		const ok = await loadOpenapiSpec(ORIGIN, '/api/v1/openapi.json');

		expect(failed.ok).toBe(false);
		expect(ok.ok).toBe(true);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});
});
