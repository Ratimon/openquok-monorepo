import { CONFIG_SCHEMA_BACKEND } from '$lib/config/constants/config';
import { normalizeApiBaseUrl } from '$lib/utils/path';

import { BLOG_IMAGES_BUCKET } from '$lib/blogs/constants/config';

function trimApiBase(): string {
	return normalizeApiBaseUrl(String(CONFIG_SCHEMA_BACKEND.API_BASE_URL.default ?? ''));
}

/** Encode each path segment for use in a URL path (Supabase public object URL). */
function encodeStoragePathSegments(storagePath: string): string {
	return storagePath
		.split('/')
		.map((s) => encodeURIComponent(s))
		.join('/');
}

/**
 * Builds a browser-usable `src` for an object in `blog_images` after upload.
 * Uses `VITE_PUBLIC_SUPABASE_URL` when set; otherwise falls back to the API download URL.
 */
export function buildBlogInlineImageSrc(storagePath: string): string {
	const trimmed = storagePath.replace(/^\/+/, '');
	const supabasePublic =
		typeof import.meta !== 'undefined' && import.meta.env?.VITE_PUBLIC_SUPABASE_URL
			? String(import.meta.env.VITE_PUBLIC_SUPABASE_URL).replace(/\/$/, '')
			: '';

	if (supabasePublic) {
		return `${supabasePublic}/storage/v1/object/public/${BLOG_IMAGES_BUCKET}/${encodeStoragePathSegments(trimmed)}`;
	}

	const apiBase = trimApiBase();
	return `${apiBase}/api/v1/image/download?databaseName=${BLOG_IMAGES_BUCKET}&imageUrl=${encodeURIComponent(trimmed)}`;
}

