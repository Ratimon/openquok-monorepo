import type { RequestHandler } from './$types';
import { getCliAuthServerUrl } from '$lib/cli-auth/server';

/** Proxies OAuth callback handling to the CLI auth server while keeping the browser on www.openquok.com. */
export const GET: RequestHandler = async ({ url }) => {
	const authServer = getCliAuthServerUrl();
	const target = `${authServer}/device/callback${url.search}`;

	const res = await fetch(target, { redirect: 'manual' });

	const location = res.headers.get('location');
	if (location && res.status >= 300 && res.status < 400) {
		return new Response(null, { status: res.status, headers: { Location: location } });
	}

	const contentType = res.headers.get('content-type') ?? 'text/html; charset=utf-8';
	const body = await res.text();
	return new Response(body, { status: res.status, headers: { 'content-type': contentType } });
};
