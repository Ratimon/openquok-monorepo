import type { Handle } from '@sveltejs/kit';

/**
 * Forward `/api/*` to the local backend in development so the browser stays on the HTTPS dev origin.
 * Vite `server.proxy` is not always applied before SvelteKit’s dev middleware, which breaks auth
 * cookies and OAuth callbacks when the SPA uses same-origin `/api` URLs.
 */
const DEFAULT_DEV_BACKEND_ORIGIN = 'http://localhost:3000';

/** `Headers` iteration merges `Set-Cookie`; browsers need each cookie appended separately. */
function forwardUpstreamResponse(upstream: Response): Response {
	const out = new Headers();
	for (const [key, value] of upstream.headers) {
		if (key.toLowerCase() === 'set-cookie') continue;
		out.append(key, value);
	}
	const cookies: string[] =
		typeof upstream.headers.getSetCookie === 'function' ? upstream.headers.getSetCookie() : [];
	if (cookies.length === 0) {
		const single = upstream.headers.get('set-cookie');
		if (single) cookies.push(single);
	}
	for (const c of cookies) {
		out.append('Set-Cookie', c);
	}
	return new Response(upstream.body, {
		status: upstream.status,
		statusText: upstream.statusText,
		headers: out
	});
}

export const handle: Handle = async ({ event, resolve }) => {
	if (!import.meta.env.DEV || !event.url.pathname.startsWith('/api')) {
		return resolve(event);
	}

	const raw =
		typeof process.env.DEV_BACKEND_PROXY_TARGET === 'string'
			? process.env.DEV_BACKEND_PROXY_TARGET.trim()
			: '';
	const backendOrigin = raw || DEFAULT_DEV_BACKEND_ORIGIN;
	const targetUrl = `${backendOrigin.replace(/\/+$/, '')}${event.url.pathname}${event.url.search}`;

	const headers = new Headers(event.request.headers);
	headers.delete('host');
	headers.delete('connection');

	const init: RequestInit = {
		method: event.request.method,
		headers,
		redirect: 'manual'
	};

	if (event.request.method !== 'GET' && event.request.method !== 'HEAD') {
		init.body = await event.request.arrayBuffer();
	}

	const upstream = await fetch(targetUrl, init);
	return forwardUpstreamResponse(upstream);
};
