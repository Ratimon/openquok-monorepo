import { afterEach, describe, expect, it, vi } from 'vitest';

import { clearOpenapiSpecCacheForTests } from '$lib/docs/utils/openapi/openapiExamples';
import { fetchOpenApiSeoCodeBlocks } from '$lib/docs/utils/openapi/openapiSeoClientSamples';
import { HTTP_CLIENT_SAMPLES } from '$lib/docs/utils/openapi/httpClientSamples';

const ORIGIN = 'https://docs.example.com';

const listIntegrationsSpec = {
	openapi: '3.0.0',
	servers: [{ url: '/api/v1' }],
	components: {
		securitySchemes: {
			ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'Authorization' }
		}
	},
	security: [{ ApiKeyAuth: [] }],
	paths: {
		'/public/integrations': {
			get: { summary: 'List integrations' }
		}
	}
};

describe('fetchOpenApiSeoCodeBlocks', () => {
	afterEach(() => {
		clearOpenapiSpecCacheForTests();
		vi.unstubAllGlobals();
	});

	it('returns one block per HTTP client sample language', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => listIntegrationsSpec
			})
		);

		const blocks = await fetchOpenApiSeoCodeBlocks({
			openapi: 'GET /public/integrations',
			title: 'List Integrations',
			origin: ORIGIN,
			startIndex: 2
		});

		expect(blocks).toHaveLength(HTTP_CLIENT_SAMPLES.length);
		expect(blocks[0]).toMatchObject({
			index: 2,
			language: 'bash',
			name: 'List Integrations — cURL request example'
		});
		expect(blocks[0]?.text).toContain('curl');
	});

	it('returns empty when the operation line is invalid', async () => {
		const blocks = await fetchOpenApiSeoCodeBlocks({
			openapi: 'not-an-operation',
			title: 'Bad',
			origin: ORIGIN,
			startIndex: 0
		});
		expect(blocks).toEqual([]);
	});
});
