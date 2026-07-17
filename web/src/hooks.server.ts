import type { Handle } from '@sveltejs/kit';

/**
 * Forward `/api/*` (and local `/uploads/*`) to the backend when:
 * - `OPENQUOK_API_PROXY_TARGET` is set (Docker self-host: `http://api:3000`), or
 * - Vite dev (`import.meta.env.DEV`) with optional `DEV_BACKEND_PROXY_TARGET`.
 *
 * Same-origin relative API paths then work in the browser and in SSR (`event.fetch`).
 */
const DEFAULT_DEV_BACKEND_ORIGIN = 'http://localhost:3000';

function shouldProxyPathname(pathname: string): boolean {
	return pathname.startsWith('/api') || pathname.startsWith('/uploads');
}

function resolveBackendProxyOrigin(): string | null {
	const composeTarget =
		typeof process.env.OPENQUOK_API_PROXY_TARGET === 'string'
			? process.env.OPENQUOK_API_PROXY_TARGET.trim()
			: '';
	if (composeTarget) {
		return composeTarget.replace(/\/+$/, '');
	}
	if (import.meta.env.DEV) {
		const devTarget =
			typeof process.env.DEV_BACKEND_PROXY_TARGET === 'string'
				? process.env.DEV_BACKEND_PROXY_TARGET.trim()
				: '';
		return (devTarget || DEFAULT_DEV_BACKEND_ORIGIN).replace(/\/+$/, '');
	}
	return null;
}

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
	const backendOrigin = resolveBackendProxyOrigin();
	if (!backendOrigin || !shouldProxyPathname(event.url.pathname)) {
		return resolve(event);
	}

	const targetUrl = `${backendOrigin}${event.url.pathname}${event.url.search}`;

	const headers = new Headers(event.request.headers);
	headers.delete('host');
	headers.delete('connection');

	const clientAddress = event.getClientAddress();
	if (clientAddress) {
		const prior = event.request.headers.get('x-forwarded-for');
		headers.set(
			'x-forwarded-for',
			prior?.trim() ? `${prior}, ${clientAddress}` : clientAddress
		);
	}

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
