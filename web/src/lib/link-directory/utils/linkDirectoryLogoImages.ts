import { CONFIG_SCHEMA_BACKEND } from '$lib/config/constants/config';
import { normalizeApiBaseUrl } from '$lib/utils/path';

export const LINK_DIRECTORY_LOGOS_BUCKET = 'link_directory_logos' as const;

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

const PUBLIC_OBJECT_MARKER = `/object/public/${LINK_DIRECTORY_LOGOS_BUCKET}/`;

/**
 * Derives the storage object key for `link_directory_logos` from an image URL
 * (full public object URL, API download query, or bare key).
 */
export function extractLinkDirectoryLogoStoragePathFromImageSrc(src: string): string | null {
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
		if (u.searchParams.get('databaseName') === LINK_DIRECTORY_LOGOS_BUCKET) {
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

	if (trimmed.includes(`databaseName=${LINK_DIRECTORY_LOGOS_BUCKET}`)) {
		try {
			const q = trimmed.includes('?') ? trimmed.split('?')[1] ?? '' : '';
			const params = new URLSearchParams(q);
			if (params.get('databaseName') === LINK_DIRECTORY_LOGOS_BUCKET) {
				const imageUrl = params.get('imageUrl');
				if (imageUrl) return decodeURIComponent(imageUrl);
			}
		} catch {
			/* ignore */
		}
	}

	if (!trimmed.includes('/') && !trimmed.includes('\\')) {
		const key = trimmed.split(/[?#]/)[0]?.trim();
		if (key && /\.(webp|png|jpe?g)$/i.test(key)) return decodeURIComponent(key);
	}

	return null;
}

/**
 * Normalizes logo fields and storage paths to a bare `link_directory_logos` object key
 * (e.g. `authUid-random.jpg`), accepting legacy full public URLs or bucket prefixes.
 */
export function resolveLinkDirectoryLogoStorageKey(raw: string): string | null {
	const trimmed = raw.trim();
	if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null;

	const fromUrl = extractLinkDirectoryLogoStoragePathFromImageSrc(trimmed);
	if (fromUrl) return fromUrl.replace(/^\/+/, '');

	let key = trimmed.replace(/^\/+/, '');
	if (key.startsWith(`${LINK_DIRECTORY_LOGOS_BUCKET}/`)) {
		key = key.slice(LINK_DIRECTORY_LOGOS_BUCKET.length + 1);
	}
	if (key.includes('://')) return null;
	if (!key) return null;
	return key;
}

/**
 * Builds a browser-usable URL for an object in `link_directory_logos` after upload.
 * Uses `VITE_PUBLIC_SUPABASE_URL` when set; otherwise falls back to the API download URL.
 */
export function buildLinkDirectoryLogoPublicUrl(storagePath: string): string {
	const key = resolveLinkDirectoryLogoStorageKey(storagePath);
	if (!key) return '';

	const trimmed = key;
	const supabasePublic =
		typeof import.meta !== 'undefined' && import.meta.env?.VITE_PUBLIC_SUPABASE_URL
			? String(import.meta.env.VITE_PUBLIC_SUPABASE_URL).replace(/\/$/, '')
			: '';

	if (supabasePublic) {
		return `${supabasePublic}/storage/v1/object/public/${LINK_DIRECTORY_LOGOS_BUCKET}/${encodeStoragePathSegments(trimmed)}`;
	}

	const apiBase = trimApiBase();
	return `${apiBase}/api/v1/image/download?databaseName=${LINK_DIRECTORY_LOGOS_BUCKET}&imageUrl=${encodeURIComponent(trimmed)}`;
}
