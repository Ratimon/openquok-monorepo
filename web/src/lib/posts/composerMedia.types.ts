import { buildBlogInlineImageSrc } from '$lib/blog/utils/buildBlogInlineImageSrc';

import { publicUrlForMediaStorageKey } from '$lib/media/utils/publicMediaObjectUrl';

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

/**
 * Browser URL for one media item (public R2 / same-origin `/uploads` — matches backend `publicUrlForObjectKey`).
 */
export function buildComposerMediaItemSrc(item: SocialPostMediaItem): string {
	const bucket: ComposerMediaBucket = item.bucket ?? 'blog_images';
	if (bucket === 'blog_images') {
		return buildBlogInlineImageSrc(item.path);
	}
	return publicUrlForMediaStorageKey(item.path);
}

export function mediaItemsToPreviewUrls(items: SocialPostMediaItem[]): string[] {
	return items.map((m) => buildComposerMediaItemSrc(m));
}

/** @deprecated Prefer {@link mediaItemsToPreviewUrls} with full items (bucket-aware). */
export function mediaStoragePathsToPreviewUrls(paths: string[]): string[] {
	return paths.map((p) => buildComposerMediaItemSrc({ id: '', path: p, bucket: 'social_media' }));
}
