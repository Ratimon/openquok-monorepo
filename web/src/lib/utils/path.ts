import { base } from '$app/paths';

/**
 * Trim and remove trailing slashes from an API origin (e.g. `VITE_API_BASE_URL`) so
 * joining with paths like `/api/v1/...` never produces `//` (which can redirect and break CORS preflight).
 */
export function normalizeApiBaseUrl(baseUrl: string): string {
	return baseUrl.trim().replace(/\/+$/, '');
}

/**
 * Build absolute URL for a path (client-side only; on server returns path as-is).
 */
export function absoluteUrl(path: string): string {
	if (typeof window === 'undefined') {
		return path.startsWith('/') ? path : `/${path}`;
	}
	const base = window.location.origin;
	const p = path.startsWith('/') ? path : `/${path}`;
	return `${base}${p}`;
}

/** Path for static assets (respects SvelteKit base path). */
export function url(p: string): string {
	const path = p.startsWith('/') ? p : `/${p}`;
	return `${base}${path}`;
}

/** Normalize path for comparison (ensure leading slash, no trailing except root). */
export function route(p: string): string {
	if (!p || p === '/') return '/';
	return p.startsWith('/') ? p : `/${p}`;
}

export function isSameRoute(a: string, b: string): boolean {
	return a === b || a === route(b) || route(a) === route(b);
}

export function isParentRoute(a: string, b: string): boolean {
	const r = route(b);
	if (r === '/') return true;
	return a.startsWith(r) || route(a).startsWith(r);
}
