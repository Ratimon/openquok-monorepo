import type { PostMediaProgrammerModel } from '$lib/posts/Post.repository.svelte';

/** Wire shape for create/update post `media` items (no client-only preview fields). */
export type PostMediaApiItem = {
	id: string;
	path: string;
	bucket?: 'social_media';
	alt?: string | null;
	thumbnail?: string | null;
	thumbnailTimestamp?: number | null;
};

export function serializePostMediaItemForApi(item: PostMediaProgrammerModel): PostMediaApiItem {
	const out: PostMediaApiItem = { id: item.id, path: item.path };
	if (item.bucket) out.bucket = item.bucket;

	if ('alt' in item) {
		const alt = typeof item.alt === 'string' ? item.alt.trim() : item.alt;
		if (alt !== undefined) out.alt = alt && alt.length > 0 ? alt.slice(0, 2000) : null;
	}
	if ('thumbnail' in item) {
		const thumbnail = typeof item.thumbnail === 'string' ? item.thumbnail.trim() : item.thumbnail;
		if (thumbnail !== undefined) {
			out.thumbnail = thumbnail && thumbnail.length > 0 ? thumbnail : null;
		}
	}
	if ('thumbnailTimestamp' in item) {
		const ts = item.thumbnailTimestamp;
		if (ts === null) {
			out.thumbnailTimestamp = null;
		} else if (typeof ts === 'number' && Number.isFinite(ts) && ts >= 0) {
			out.thumbnailTimestamp = ts;
		}
	}

	return out;
}

export function serializePostMediaListForApi(
	items: PostMediaProgrammerModel[] | undefined
): PostMediaApiItem[] | undefined {
	if (!items?.length) return items;
	return items.map(serializePostMediaItemForApi);
}

export function serializePostMediaByIntegrationForApi(
	mediaByIntegrationId: Record<string, PostMediaProgrammerModel[]> | undefined
): Record<string, PostMediaApiItem[]> | undefined {
	if (!mediaByIntegrationId) return mediaByIntegrationId;
	return Object.fromEntries(
		Object.entries(mediaByIntegrationId).map(([integrationId, items]) => [
			integrationId,
			items.map(serializePostMediaItemForApi)
		])
	);
}
