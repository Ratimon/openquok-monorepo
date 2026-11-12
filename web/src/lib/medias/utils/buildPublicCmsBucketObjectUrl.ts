import { CONFIG_SCHEMA_BACKEND } from '$lib/config/constants/config';
import { normalizeApiBaseUrl } from '$lib/utils/path';

function encodeStoragePathSegments(storagePath: string): string {
	return storagePath
		.split('/')
		.filter(Boolean)
		.map((s) => encodeURIComponent(s))
		.join('/');
}

function trimApiBase(): string {
	return normalizeApiBaseUrl(String(CONFIG_SCHEMA_BACKEND.API_BASE_URL.default ?? ''));
}

function trimSupabasePublicBase(): string {
	return typeof import.meta !== 'undefined' && import.meta.env?.VITE_PUBLIC_SUPABASE_URL
		? String(import.meta.env.VITE_PUBLIC_SUPABASE_URL).replace(/\/$/, '')
		: '';
}

/**
 * Stable browser URL for a public CMS/catalog object in Supabase Storage (blog hero, directory logo, etc.).
 * Uses Supabase public objects when `VITE_PUBLIC_SUPABASE_URL` is set, then the API download proxy.
 * Workspace media on R2 uses `publicUrlForMediaStorageKey` — not this helper.
 */
export function buildPublicCmsBucketObjectUrl(bucket: string, storageKey: string): string {
	const trimmed = storageKey.trim().replace(/^\/+/, '');
	if (!trimmed) return '';
	if (/^https?:\/\//i.test(trimmed)) return trimmed;

	const supabasePublic = trimSupabasePublicBase();
	if (supabasePublic) {
		return `${supabasePublic}/storage/v1/object/public/${bucket}/${encodeStoragePathSegments(trimmed)}`;
	}

	const apiBase = trimApiBase();
	return `${apiBase}/api/v1/image/download?databaseName=${bucket}&imageUrl=${encodeURIComponent(trimmed)}`;
}
