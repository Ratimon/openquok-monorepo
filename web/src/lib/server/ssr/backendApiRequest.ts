import { normalizeApiBaseUrl } from '$lib/utils/path';

export function resolveExplicitApiOrigin(): string | null {
	const fromMeta =
		typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL !== undefined
			? String(import.meta.env.VITE_API_BASE_URL).trim()
			: '';
	const fromProcess =
		typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL !== undefined
			? String(process.env.VITE_API_BASE_URL).trim()
			: '';
	const explicit = fromMeta || fromProcess;
	if (!explicit) return null;
	try {
		return new URL(normalizeApiBaseUrl(explicit)).origin;
	} catch {
		return null;
	}
}

export function isSsrBackendApiRequest(url: URL): boolean {
	if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/')) {
		return true;
	}
	const apiOrigin = resolveExplicitApiOrigin();
	return apiOrigin !== null && url.origin === apiOrigin;
}
