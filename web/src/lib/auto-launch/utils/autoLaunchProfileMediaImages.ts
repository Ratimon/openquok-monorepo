import { CONFIG_SCHEMA_BACKEND } from '$lib/config/constants/config';
import { normalizeApiBaseUrl } from '$lib/utils/path';

import { AUTO_LAUNCH_PROFILE_MEDIA_BUCKET } from '$lib/auto-launch/constants/config';

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

const PUBLIC_OBJECT_MARKER = `/object/public/${AUTO_LAUNCH_PROFILE_MEDIA_BUCKET}/`;

/**
 * Derives the storage object key for `auto_launch_profile_media` from an image URL
 * (full public object URL, API download query, or bare key).
 */
export function extractAutoLaunchProfileMediaStoragePathFromImageSrc(src: string): string | null {
	const trimmed = src.trim();
	if (!trimmed || trimmed.startsWith('blob:')) return null;

	let i = trimmed.indexOf(PUBLIC_OBJECT_MARKER);
	if (i !== -1) {
		const rest = trimmed.slice(i + PUBLIC_OBJECT_MARKER.length).split(/[?#]/)[0];
		return rest ? decodeURIComponent(rest) : null;
	}

	try {
		const base = typeof window !== 'undefined' ? window.location.origin : 'https://example.com';
		const u = new URL(trimmed, base);
		if (u.searchParams.get('databaseName') === AUTO_LAUNCH_PROFILE_MEDIA_BUCKET) {
			const imageUrl = u.searchParams.get('imageUrl');
			if (imageUrl) return decodeURIComponent(imageUrl);
		}
		const path = u.pathname;
		i = path.indexOf(PUBLIC_OBJECT_MARKER);
		if (i !== -1) {
			const rest = path.slice(i + PUBLIC_OBJECT_MARKER.length).split(/[?#]/)[0];
			return rest ? decodeURIComponent(rest) : null;
		}
	} catch {
		/* ignore */
	}

	if (trimmed.includes(`databaseName=${AUTO_LAUNCH_PROFILE_MEDIA_BUCKET}`)) {
		try {
			const q = trimmed.includes('?') ? trimmed.split('?')[1] ?? '' : '';
			const params = new URLSearchParams(q);
			if (params.get('databaseName') === AUTO_LAUNCH_PROFILE_MEDIA_BUCKET) {
				const imageUrl = params.get('imageUrl');
				if (imageUrl) return decodeURIComponent(imageUrl);
			}
		} catch {
			/* ignore */
		}
	}

	return null;
}

/**
 * Normalizes logo/gallery fields to a bare `auto_launch_profile_media` object key
 * (e.g. `{organizationId}/{profileId}/0.123.webp`), accepting legacy public URLs or bucket prefixes.
 */
export function resolveAutoLaunchProfileMediaStorageKey(raw: string): string | null {
	const trimmed = raw.trim();
	if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null;

	const fromUrl = extractAutoLaunchProfileMediaStoragePathFromImageSrc(trimmed);
	if (fromUrl) return fromUrl.replace(/^\/+/, '');

	let key = trimmed.replace(/^\/+/, '');
	if (key.startsWith(`${AUTO_LAUNCH_PROFILE_MEDIA_BUCKET}/`)) {
		key = key.slice(AUTO_LAUNCH_PROFILE_MEDIA_BUCKET.length + 1);
	}
	if (key.includes('://')) return null;
	if (!key) return null;
	return key;
}

/**
 * Builds a browser-usable URL for an object in `auto_launch_profile_media` after upload.
 * Uses `VITE_PUBLIC_SUPABASE_URL` when set; otherwise falls back to the API download URL.
 */
export function buildAutoLaunchProfileMediaPublicUrl(storagePath: string): string {
	const key = resolveAutoLaunchProfileMediaStorageKey(storagePath);
	if (!key) return '';

	const trimmed = key;
	const supabasePublic =
		typeof import.meta !== 'undefined' && import.meta.env?.VITE_PUBLIC_SUPABASE_URL
			? String(import.meta.env.VITE_PUBLIC_SUPABASE_URL).replace(/\/$/, '')
			: '';

	if (supabasePublic) {
		return `${supabasePublic}/storage/v1/object/public/${AUTO_LAUNCH_PROFILE_MEDIA_BUCKET}/${encodeStoragePathSegments(trimmed)}`;
	}

	const apiBase = trimApiBase();
	return `${apiBase}/api/v1/image/download?databaseName=${AUTO_LAUNCH_PROFILE_MEDIA_BUCKET}&imageUrl=${encodeURIComponent(trimmed)}`;
}

/** Preview URL for a stored profile logo or gallery path; passes through absolute `http(s)` URLs. */
export function resolveAutoLaunchProfileImageUrl(
	logoOrGalleryPath: string | null | undefined
): string | null {
	const trimmed = logoOrGalleryPath?.trim();
	if (!trimmed) return null;
	if (/^https?:\/\//i.test(trimmed)) return trimmed;
	const built = buildAutoLaunchProfileMediaPublicUrl(trimmed);
	return built.trim() ? built : null;
}
