import { buildBlogInlineImageSrc } from '$lib/blog/utils/buildBlogInlineImageSrc';
import { CONFIG_SCHEMA_BACKEND } from '$lib/config/constants/config';
import { normalizeApiBaseUrl } from '$lib/utils/path';

export type ComposerMediaBucket = 'blog_images' | 'social_media';

/** One image attached to a social post. */
export type SocialPostMediaItem = {
	id: string;
	path: string;
	/** Storage target; omit only for legacy rows created before R2 composer uploads. */
	bucket?: ComposerMediaBucket;
};

export const POST_MEDIA_JSON_VERSION = 1 as const;

export type PostMediaColumnPayload = {
	v: typeof POST_MEDIA_JSON_VERSION;
	items: SocialPostMediaItem[];
};

export function serializePostMediaColumn(items: SocialPostMediaItem[]): string | null {
	if (!items.length) return null;
	const payload: PostMediaColumnPayload = { v: POST_MEDIA_JSON_VERSION, items };
	return JSON.stringify(payload);
}

export function parsePostMediaColumn(raw: string | null | undefined): SocialPostMediaItem[] {
	if (raw == null || raw === '') return [];
	const trimmed = raw.trim();
	if (!trimmed.startsWith('{')) return [];
	try {
		const parsed = JSON.parse(trimmed) as unknown;
		if (
			parsed &&
			typeof parsed === 'object' &&
			'items' in parsed &&
			Array.isArray((parsed as PostMediaColumnPayload).items)
		) {
			return (parsed as PostMediaColumnPayload).items.filter(
				(x): x is SocialPostMediaItem =>
					!!x &&
					typeof x === 'object' &&
					typeof (x as SocialPostMediaItem).id === 'string' &&
					typeof (x as SocialPostMediaItem).path === 'string'
			);
		}
	} catch {
		return [];
	}
	return [];
}

function encodeStoragePathSegments(storagePath: string): string {
	return storagePath
		.split('/')
		.map((s) => encodeURIComponent(s))
		.join('/');
}

/**
 * Browser URL for one media item (public R2 origin when set; otherwise API download URL — use
 * `resolveMediaPreviewUrl` / `BlobOrHrefImg` for previews because the API requires Bearer).
 */
export function buildComposerMediaItemSrc(item: SocialPostMediaItem): string {
	const bucket: ComposerMediaBucket = item.bucket ?? 'blog_images';
	if (bucket === 'blog_images') {
		return buildBlogInlineImageSrc(item.path);
	}
	const trimmed = item.path.replace(/^\/+/, '');
	const publicR2 =
		typeof import.meta !== 'undefined' && import.meta.env?.VITE_STORAGE_R2_PUBLIC_BASE_URL
			? String(import.meta.env.VITE_STORAGE_R2_PUBLIC_BASE_URL).replace(/\/$/, '')
			: '';
	if (publicR2) {
		return `${publicR2}/${encodeStoragePathSegments(trimmed)}`;
	}
	const apiBase = normalizeApiBaseUrl(String(CONFIG_SCHEMA_BACKEND.API_BASE_URL.default ?? ''));
	return `${apiBase}/api/v1/media/download?path=${encodeURIComponent(trimmed)}`;
}

export function mediaItemsToPreviewUrls(items: SocialPostMediaItem[]): string[] {
	return items.map((m) => buildComposerMediaItemSrc(m));
}

/** @deprecated Prefer {@link mediaItemsToPreviewUrls} with full items (bucket-aware). */
export function mediaStoragePathsToPreviewUrls(paths: string[]): string[] {
	return paths.map((p) => buildComposerMediaItemSrc({ id: '', path: p, bucket: 'social_media' }));
}
