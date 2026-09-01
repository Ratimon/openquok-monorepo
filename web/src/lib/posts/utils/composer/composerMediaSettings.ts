import type { MediaLibraryItemViewModel } from '$lib/medias/GetMedia.presenter.svelte';
import type { GetMediaPresenter } from '$lib/medias/GetMedia.presenter.svelte';
import type { PostMediaProgrammerModel } from '$lib/posts/Post.repository.svelte';

import { isImageMediaPath, isVideoMediaPath } from '$lib/medias/utils/mediaDisplay';
import { publicUrlForMediaStorageKey } from '$lib/medias/utils/mediaUrls';

function fileNameFromPath(path: string): string {
	const segment = path.split('/').pop() ?? path;
	return segment || 'media';
}

function mediaKindFromPath(path: string): MediaLibraryItemViewModel['kind'] {
	if (isVideoMediaPath(path)) return 'video';
	if (isImageMediaPath(path)) return 'image';
	return 'other';
}

export function postMediaToLibraryItemVm(item: PostMediaProgrammerModel): MediaLibraryItemViewModel {
	const path = item.path.trim();
	return {
		id: item.id,
		path: item.path,
		name: fileNameFromPath(path),
		size: 0,
		lastModified: null,
		publicUrl: item.localPreviewUrl?.trim() || publicUrlForMediaStorageKey(path),
		kind: mediaKindFromPath(path),
		alt: item.alt ?? null,
		thumbnail: item.thumbnail ?? null,
		thumbnailPublicUrl: item.thumbnailPublicUrl ?? null,
		thumbnailTimestamp: item.thumbnailTimestamp ?? null
	};
}

export function mergeLibraryVmIntoPostMedia(
	item: PostMediaProgrammerModel,
	lib: MediaLibraryItemViewModel
): PostMediaProgrammerModel {
	return {
		...item,
		id: lib.id,
		alt: lib.alt ?? null,
		thumbnail: lib.thumbnail ?? null,
		thumbnailPublicUrl: lib.thumbnailPublicUrl ?? null,
		thumbnailTimestamp: lib.thumbnailTimestamp ?? null
	};
}

/** Resolve workspace library row by storage path (legacy drafts may carry a random attachment id). */
export async function resolveComposerMediaLibraryItemVm(
	organizationId: string,
	item: PostMediaProgrammerModel,
	getMediaPresenter: GetMediaPresenter
): Promise<MediaLibraryItemViewModel> {
	const base = postMediaToLibraryItemVm(item);
	const orgId = organizationId.trim();
	if (!orgId || item.localPreviewUrl?.trim()) return base;

	const browse = await getMediaPresenter.loadMediaPickerBrowseVm(orgId);
	const match = browse.images.find((row) => row.path === item.path);
	if (!match) return base;

	return {
		...base,
		...match,
		id: match.id
	};
}

export function composerMediaItemSupportsSettings(item: PostMediaProgrammerModel): boolean {
	if (item.localPreviewUrl?.trim()) return false;
	const path = item.path.trim();
	return isImageMediaPath(path) || isVideoMediaPath(path);
}
