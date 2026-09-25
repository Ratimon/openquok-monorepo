import { describe, expect, it } from 'vitest';

import { buildCurlSample, buildLiveCurlSample } from '$lib/docs/utils/openapi/openapiExamples';
import {
	HTTP_CLIENT_SAMPLES,
	httpRequestDescriptorFromLivePlayground,
	httpRequestDescriptorFromOpenapiStatic,
	renderCurlFromDescriptor,
	renderHttpClientSamples
} from '$lib/docs/utils/openapi/httpClientSamples';

const ORIGIN = 'https://docs.example.com';

describe('httpRequestDescriptorFromOpenapiStatic', () => {
	it('builds URL from relative server path and fills path params', () => {
		const descriptor = httpRequestDescriptorFromOpenapiStatic({
			origin: ORIGIN,
			serverUrl: '/api/v1',
			method: 'GET',
			pathPattern: '/public/integrations/{integrationId}',
			apiKeyHeader: true,
			apiKeyHeaderName: 'Authorization'
		});
		expect(descriptor.method).toBe('GET');
		expect(descriptor.url).toBe(`${ORIGIN}/api/v1/public/integrations/twitter`);
		expect(descriptor.headers).toEqual([{ name: 'Authorization', value: 'YOUR_API_KEY' }]);
	});

	it('omits auth header when apiKeyHeader is false', () => {
		const descriptor = httpRequestDescriptorFromOpenapiStatic({
			origin: ORIGIN,
			serverUrl: '/api/v1',
			method: 'GET',
			pathPattern: '/public/health',
			apiKeyHeader: false
		});
		expect(descriptor.headers).toEqual([]);
	});
});

describe('httpRequestDescriptorFromLivePlayground', () => {
	it('substitutes path params, query string, auth, and JSON body', () => {
		const descriptor = httpRequestDescriptorFromLivePlayground({
			origin: ORIGIN,
			serverUrl: '/api/v1',
			method: 'POST',
			pathPattern: '/public/posts/{id}',
			pathValues: { id: 'abc' },
			queryValues: { limit: '10' },
			authHeaderName: 'Authorization',
			authHeaderValue: 'sk_live_test',
			body: '{\n  "text": "hi"\n}'
		});
		expect(descriptor.url).toBe(`${ORIGIN}/api/v1/public/posts/abc?limit=10`);
		expect(descriptor.headers).toEqual([
			{ name: 'Authorization', value: 'sk_live_test' },
			{ name: 'Content-Type', value: 'application/json' }
		]);
		expect(descriptor.jsonBody).toBe('{\n  "text": "hi"\n}');
	});
});

describe('renderHttpClientSamples', () => {
	it('returns all client samples in fixed order', () => {
		const descriptor = httpRequestDescriptorFromOpenapiStatic({
			origin: ORIGIN,
			serverUrl: '/api/v1',
			method: 'GET',
			pathPattern: '/public/integrations',
			apiKeyHeader: true
		});
		const samples = renderHttpClientSamples(descriptor);
		expect(samples.map((s) => s.id)).toEqual(HTTP_CLIENT_SAMPLES.map((s) => s.id));
		expect(samples[0]).toMatchObject({ id: 'curl', label: 'cURL', shikiLanguage: 'bash' });
		expect(samples[0]!.code).toContain('curl --request GET');
		expect(samples[1]!.code).toContain('import requests');
		expect(samples[2]!.code).toContain('await fetch');
	});

	it('escapes single quotes in live auth values for cURL', () => {
		const descriptor = httpRequestDescriptorFromLivePlayground({
			origin: ORIGIN,
			serverUrl: '/api/v1',
			method: 'GET',
			pathPattern: '/public/integrations',
			pathValues: {},
			queryValues: {},
			authHeaderName: 'Authorization',
			authHeaderValue: "key'with'quotes"
		});
		const curl = renderCurlFromDescriptor(descriptor);
		expect(curl).toContain(`'Authorization: key'\\''with'\\''quotes'`);
	});
});

describe('buildCurlSample / buildLiveCurlSample compatibility', () => {
	it('matches static cURL via descriptor renderer', () => {
		const opts = {
			origin: ORIGIN,
			serverUrl: '/api/v1',
			method: 'GET',
			pathPattern: '/public/integrations',
			apiKeyHeader: true,
			apiKeyHeaderName: 'X-Api-Key'
		};
		const descriptor = httpRequestDescriptorFromOpenapiStatic(opts);
		expect(buildCurlSample(opts)).toBe(renderCurlFromDescriptor(descriptor));
	});

	it('matches live cURL via descriptor renderer', () => {
		const opts = {
			origin: ORIGIN,
			serverUrl: '/api/v1',
			method: 'POST',
			pathPattern: '/public/posts',
			pathValues: {},
			queryValues: {},
			authHeaderName: 'Authorization',
			authHeaderValue: 'token',
			body: '{"draft":true}'
		};
		const descriptor = httpRequestDescriptorFromLivePlayground(opts);
		expect(buildLiveCurlSample(opts)).toBe(renderCurlFromDescriptor(descriptor));
	});
});
