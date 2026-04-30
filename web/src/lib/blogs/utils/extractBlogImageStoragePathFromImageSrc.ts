import { BLOG_IMAGES_BUCKET } from '$lib/blogs/constants/config';

const PUBLIC_OBJECT_MARKER = `/object/public/${BLOG_IMAGES_BUCKET}/`;

/**
 * Derives the storage object key for `blog_images` from an `<img src>` value (full URL, relative, or download query).
 */
export function extractBlogImageStoragePathFromImageSrc(src: string): string | null {
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
		if (u.searchParams.get('databaseName') === BLOG_IMAGES_BUCKET) {
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

	if (trimmed.includes('databaseName=blog_images')) {
		try {
			const q = trimmed.includes('?') ? trimmed.split('?')[1] ?? '' : '';
			const params = new URLSearchParams(q);
			if (params.get('databaseName') === BLOG_IMAGES_BUCKET) {
				const imageUrl = params.get('imageUrl');
				if (imageUrl) return decodeURIComponent(imageUrl);
			}
		} catch {
			/* ignore */
		}
	}

	// Bare object key (no slashes) — e.g. `uuid-random.webp` from our uploader
	if (!trimmed.includes('/') && !trimmed.includes('\\')) {
		const key = trimmed.split(/[?#]/)[0]?.trim();
		if (key && /\.(webp|png|jpe?g|gif|svg)$/i.test(key)) return decodeURIComponent(key);
	}

	return null;
}

