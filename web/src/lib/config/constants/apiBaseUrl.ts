import { normalizeApiBaseUrl } from '$lib/utils/path';

/**
 * Resolved API origin for HttpGateway and CONFIG_SCHEMA_BACKEND.
 * Kept in a leaf module so `$lib/core/index` does not import the full `config.ts` graph
 * (avoids SSR circular init when `area-public` → `blogs` → `core` loads before config finishes).
 */
export function getApiBaseUrl(): string {
	const fromMeta =
		typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL !== undefined
			? String(import.meta.env.VITE_API_BASE_URL)
			: undefined;
	const fromProcess =
		typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL !== undefined
			? String(process.env.VITE_API_BASE_URL)
			: undefined;
	const explicit = fromMeta ?? fromProcess;
	if (explicit !== undefined) {
		return normalizeApiBaseUrl(explicit);
	}
	// Dev + Vite proxy: empty base → relative `/api/...` on the web origin so cookies stay same-site with HTTPS dev.
	if (typeof import.meta !== 'undefined' && import.meta.env.DEV) {
		return '';
	}
	// Production default: use same-origin relative API paths (deploy behind a reverse proxy).
	// If your backend is on a different host, you must set VITE_API_BASE_URL explicitly.
	return '';
}
