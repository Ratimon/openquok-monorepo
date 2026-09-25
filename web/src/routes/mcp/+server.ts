import {
	docsMcpOptionsResponse,
	handleDocsMcpRequest
} from '$lib/docs/mcp/handleDocsMcpRequest';

import type { RequestHandler } from './$types';

/** Streamable HTTP MCP must run on the server; not static. */
export const prerender = false;

export const OPTIONS: RequestHandler = () => docsMcpOptionsResponse();

export const GET: RequestHandler = ({ request }) => handleDocsMcpRequest(request);

export const POST: RequestHandler = ({ request }) => handleDocsMcpRequest(request);
