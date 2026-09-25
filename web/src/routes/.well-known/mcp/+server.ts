import { resolvePublicSiteUrl } from '$lib/docs/utils/site/resolvePublicSiteUrl';

import type { RequestHandler } from './$types';

export const prerender = false;

export const GET: RequestHandler = ({ url }) => {
	const siteUrl = resolvePublicSiteUrl(url);
	const body = JSON.stringify({
		url: `${siteUrl}/mcp`,
		transport: 'http',
		authentication: 'none'
	});
	return new Response(body, {
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
