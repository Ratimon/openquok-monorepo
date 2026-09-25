import { CONFIG_SCHEMA_BACKEND } from '$lib/config/constants/config';
import { normalizeApiBaseUrl } from '$lib/utils/path';

function configuredApiBaseUrl(): string {
	return normalizeApiBaseUrl(String(CONFIG_SCHEMA_BACKEND.API_BASE_URL.default ?? ''));
}

/** Configured `VITE_API_BASE_URL` when set (empty string otherwise). */
export function readConfiguredApiBaseUrl(): string {
	return configuredApiBaseUrl();
}

/** API origin for docs examples and playground (`VITE_API_BASE_URL` when set, else the page origin). */
export function resolveDocsApiOrigin(pageOrigin: string): string {
	const configured = configuredApiBaseUrl();
	if (configured) return configured;
	return pageOrigin.replace(/\/$/, '');
}

/** Absolute API base (handles relative `servers[0].url` like `/api/v1`). */
export function resolveApiBaseUrl(origin: string, serverUrl: string): string {
	const s = serverUrl.trim();
	if (/^https?:\/\//i.test(s)) return s.replace(/\/$/, '');
	const path = s.startsWith('/') ? s : `/${s}`;
	return `${resolveDocsApiOrigin(origin)}${path}`;
}

/** Placeholder values for curl samples (readable, copy-paste friendly). */
export function fillPathExample(path: string): string {
	return path.replace(/\{([^}]+)\}/g, (_, raw: string) => {
		const name = String(raw).toLowerCase();
		if (name.includes('integration') || name === 'id') return 'twitter';
		return 'example';
	});
}

/** Replace `{name}` segments with encoded values; missing keys leave `{name}` unchanged. */
export function substitutePathParams(pathPattern: string, values: Record<string, string>): string {
	return pathPattern.replace(/\{([^}]+)\}/g, (_, raw: string) => {
		const key = String(raw).trim();
		const v = values[key];
		if (v !== undefined && v.trim() !== '') return encodeURIComponent(v.trim());
		return `{${key}}`;
	});
}

export function buildQueryString(query: Record<string, string>): string {
	const p = new URLSearchParams();
	for (const [k, v] of Object.entries(query)) {
		if (v.trim() !== '') p.set(k, v.trim());
	}
	const s = p.toString();
	return s ? `?${s}` : '';
}
