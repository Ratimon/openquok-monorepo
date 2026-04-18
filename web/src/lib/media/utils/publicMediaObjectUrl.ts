import { CONFIG_SCHEMA_BACKEND } from '$lib/config/constants/config';
import { normalizeApiBaseUrl } from '$lib/utils/path';

function encodeStoragePathSegments(storagePath: string): string {
	return storagePath
		.split('/')
		.filter(Boolean)
		.map((s) => encodeURIComponent(s))
		.join('/');
}

/**
 * Public browser URL for a user-media object key (R2 public origin or local `/uploads`).
 * Matches backend `publicUrlForObjectKey` — list responses also expose `publicUrl` when configured.
 */
export function publicUrlForMediaStorageKey(storageKey: string): string {
	const trimmed = storageKey.trim().replace(/^\/+/, '');
	if (!trimmed) return '';
	if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;

	const publicR2 =
		typeof import.meta !== 'undefined' && import.meta.env?.VITE_STORAGE_R2_PUBLIC_BASE_URL
			? String(import.meta.env.VITE_STORAGE_R2_PUBLIC_BASE_URL).replace(/\/$/, '')
			: '';
	if (publicR2) {
		return `${publicR2}/${encodeStoragePathSegments(trimmed)}`;
	}

	if (typeof window !== 'undefined' && window.location?.origin) {
		return `${window.location.origin}/uploads/${encodeStoragePathSegments(trimmed)}`;
	}

	const apiBase = normalizeApiBaseUrl(String(CONFIG_SCHEMA_BACKEND.API_BASE_URL.default ?? ''));
	return `${apiBase.replace(/\/$/, '')}/uploads/${encodeStoragePathSegments(trimmed)}`;
}
