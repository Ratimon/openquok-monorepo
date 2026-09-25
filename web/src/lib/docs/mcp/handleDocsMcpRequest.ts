import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';

import { resolvePublicSiteUrl } from '$lib/docs/utils/site/resolvePublicSiteUrl';

import { createDocsMcpServer } from './createDocsMcpServer';

const MCP_CORS_HEADERS: Record<string, string> = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers':
		'Content-Type, Authorization, Accept, mcp-session-id, Mcp-Session-Id, mcp-protocol-version, Last-Event-ID'
};

/** Some MCP clients omit `text/event-stream` in Accept; the transport requires both. */
function withFixedAccept(request: Request): Request {
	const accept = request.headers.get('accept') ?? '';
	let next = accept;
	if (!accept.includes('text/event-stream') && !accept.includes('application/json')) {
		next = accept
			? `${accept}, application/json, text/event-stream`
			: 'application/json, text/event-stream';
	} else if (!accept.includes('text/event-stream')) {
		next = `${accept}, text/event-stream`;
	} else if (!accept.includes('application/json')) {
		next = `${accept}, application/json`;
	}
	if (next === accept) return request;
	const headers = new Headers(request.headers);
	headers.set('accept', next);
	return new Request(request, { headers });
}

function withMcpCors(response: Response): Response {
	const headers = new Headers(response.headers);
	for (const [key, value] of Object.entries(MCP_CORS_HEADERS)) {
		headers.set(key, value);
	}
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers
	});
}

/** Close MCP server + transport after the response body is fully read (mirrors API `res.on('close')`). */
function whenResponseBodyDone(response: Response, onDone: () => Promise<void>): Response {
	if (!response.body) {
		void onDone();
		return response;
	}
	const monitored = response.body.pipeThrough(
		new TransformStream({
			flush() {
				void onDone();
			}
		})
	);
	return new Response(monitored, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers
	});
}

export function docsMcpOptionsResponse(): Response {
	return new Response(null, {
		status: 204,
		headers: MCP_CORS_HEADERS
	});
}

/**
 * Stateless Streamable HTTP handler for the documentation MCP (web origin `/mcp`).
 */
export async function handleDocsMcpRequest(request: Request): Promise<Response> {
	const siteUrl = resolvePublicSiteUrl(new URL(request.url));
	const transport = new WebStandardStreamableHTTPServerTransport({
		sessionIdGenerator: undefined
	});
	const server = createDocsMcpServer({ siteUrl });

	try {
		await server.connect(transport);
		const fixed = withFixedAccept(request);
		let parsedBody: unknown;
		if (fixed.method === 'POST') {
			try {
				parsedBody = await fixed.clone().json();
			} catch {
				parsedBody = undefined;
			}
		}
		const response = withMcpCors(await transport.handleRequest(fixed, { parsedBody }));
		return whenResponseBodyDone(response, async () => {
			await transport.close();
			await server.close();
		});
	} catch (error) {
		console.error('[docs-mcp] Request failed', error);
		await transport.close();
		await server.close();
		return withMcpCors(
			new Response(
				JSON.stringify({
					jsonrpc: '2.0',
					error: { code: -32603, message: 'Internal server error' },
					id: null
				}),
				{
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				}
			)
		);
	}
}
