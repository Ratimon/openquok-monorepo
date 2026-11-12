import { AUTO_LAUNCH_PROFILE_MEDIA_BUCKET } from '$lib/auto-launch/constants/config';
import { buildPublicCmsBucketObjectUrl } from '$lib/medias/utils/buildPublicCmsBucketObjectUrl';

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
 * Prefers `VITE_STORAGE_R2_PUBLIC_BASE_URL`, then Supabase public objects, then the API download URL.
 */
export function buildAutoLaunchProfileMediaPublicUrl(storagePath: string): string {
	const key = resolveAutoLaunchProfileMediaStorageKey(storagePath);
	if (!key) return '';
	return buildPublicCmsBucketObjectUrl(AUTO_LAUNCH_PROFILE_MEDIA_BUCKET, key);
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
