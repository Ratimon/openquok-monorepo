import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { ListToolsResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { describe, expect, it } from 'vitest';

import { docsMcpOptionsResponse, handleDocsMcpRequest } from './handleDocsMcpRequest';

const DOCS_MCP_HTTP_URL = 'https://www.example.test/mcp';

function docsMcpFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
	const url =
		typeof input === 'string'
			? input
			: input instanceof URL
				? input.href
				: input.url;
	return handleDocsMcpRequest(new Request(url, init));
}

describe('handleDocsMcpRequest', () => {
	it('responds to OPTIONS with CORS headers', () => {
		const res = docsMcpOptionsResponse();
		expect(res.status).toBe(204);
		expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
	});

	it('handles initialize over streamable HTTP', async () => {
		const request = new Request('https://www.example.test/mcp', {
			method: 'POST',
			headers: {
				Accept: 'application/json, text/event-stream',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				jsonrpc: '2.0',
				id: 1,
				method: 'initialize',
				params: {
					protocolVersion: '2025-03-26',
					capabilities: {},
					clientInfo: { name: 'vitest', version: '1.0.0' }
				}
			})
		});

		const response = await handleDocsMcpRequest(request);
		expect(response.status).toBe(200);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

		const text = await response.text();
		expect(text).toContain('openquok-documentation');
	});

	it('lists v1 tools over streamable HTTP after initialize', async () => {
		const transport = new StreamableHTTPClientTransport(new URL(DOCS_MCP_HTTP_URL), {
			fetch: docsMcpFetch
		});
		const client = new Client({ name: 'vitest-docs-mcp-http', version: '1.0.0' });

		try {
			await client.connect(transport);
			const result = await client.request(
				{ method: 'tools/list', params: {} },
				ListToolsResultSchema
			);
			expect(result.tools.map((t) => t.name).sort()).toEqual([
				'get_site_overview',
				'read_page',
				'search_docs',
				'submit_feedback'
			]);
		} finally {
			await transport.close();
			await client.close();
		}
	});
});
