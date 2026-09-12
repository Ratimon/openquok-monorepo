import type { MediaLibraryItemViewModel } from '$lib/medias/GetMedia.presenter.svelte';
import type { GetMediaPresenter } from '$lib/medias/GetMedia.presenter.svelte';
import type { PostMediaProgrammerModel } from '$lib/posts/Post.repository.svelte';

import { isImageMediaPath, isVideoMediaPath } from '$lib/medias/utils/mediaDisplay';
import { publicUrlForMediaStorageKey } from '$lib/medias/utils/mediaUrls';
import { revokeLocalMediaPreviewUrl } from '$lib/posts/utils/composer/mediaDrop';

export type ComposerMediaDetailsSavePatch = {
	alt: string | null;
	thumbnail: string | null;
	thumbnailPublicUrl: string | null;
	thumbnailLocalPreviewUrl: string | null;
	thumbnailTimestamp: number | null;
};

function fileNameFromPath(path: string): string {
	const segment = path.split('/').pop() ?? path;
	return segment || 'media';
}

function mediaKindFromPath(path: string): MediaLibraryItemViewModel['kind'] {
	if (isVideoMediaPath(path)) return 'video';
	if (isImageMediaPath(path)) return 'image';
	return 'other';
}

/** URL that plays in-browser during compose (blob first — storage URLs may 404 on localhost). */
export function composerMediaPlaybackUrl(item: PostMediaProgrammerModel): string {
	const local = item.localPreviewUrl?.trim();
	if (local) return local;
	const apiPublic = item.publicUrl?.trim();
	if (apiPublic) return apiPublic;
	return publicUrlForMediaStorageKey(item.path.trim());
}

export function postMediaToLibraryItemVm(item: PostMediaProgrammerModel): MediaLibraryItemViewModel {
	const path = item.path.trim();
	return {
		id: item.id,
		path: item.path,
		name: fileNameFromPath(path),
		size: 0,
		lastModified: null,
		publicUrl: composerMediaPlaybackUrl(item),
		kind: mediaKindFromPath(path),
		alt: item.alt ?? null,
		thumbnail: item.thumbnail ?? null,
		thumbnailPublicUrl: item.thumbnailPublicUrl ?? null,
		thumbnailLocalPreviewUrl: item.thumbnailLocalPreviewUrl ?? null,
		thumbnailTimestamp: item.thumbnailTimestamp ?? null
	};
}

export function applyComposerMediaDetailsSave(
	item: PostMediaProgrammerModel,
	patch: ComposerMediaDetailsSavePatch
): PostMediaProgrammerModel {
	if (
		item.thumbnailLocalPreviewUrl?.trim() &&
		item.thumbnailLocalPreviewUrl !== patch.thumbnailLocalPreviewUrl
	) {
		revokeLocalMediaPreviewUrl(item.thumbnailLocalPreviewUrl);
	}

	return {
		...item,
		alt: patch.alt,
		thumbnail: patch.thumbnail,
		thumbnailTimestamp: patch.thumbnailTimestamp,
		thumbnailPublicUrl: patch.thumbnailPublicUrl,
		thumbnailLocalPreviewUrl: patch.thumbnailLocalPreviewUrl
	};
}

export function mergeLibraryVmIntoPostMedia(
	item: PostMediaProgrammerModel,
	lib: MediaLibraryItemViewModel
): PostMediaProgrammerModel {
	const thumbnailPublicUrl =
		lib.thumbnailPublicUrl?.trim() || item.thumbnailPublicUrl?.trim() || null;

	return {
		...item,
		id: lib.id,
		alt: lib.alt ?? item.alt ?? null,
		thumbnail: lib.thumbnail ?? item.thumbnail ?? null,
		thumbnailPublicUrl,
		thumbnailTimestamp: lib.thumbnailTimestamp ?? item.thumbnailTimestamp ?? null,
		thumbnailLocalPreviewUrl: item.thumbnailLocalPreviewUrl ?? null,
		...(lib.publicUrl?.trim() && !lib.publicUrl.trim().startsWith('blob:')
			? { publicUrl: lib.publicUrl.trim() }
			: {})
	};
}

/** Guest-only attachment: local blob preview with no workspace storage key yet. */
export function isGuestOnlyComposerMedia(item: PostMediaProgrammerModel): boolean {
	if (!item.localPreviewUrl?.trim()) return false;
	const path = item.path.trim();
	if (path.includes('/')) return false;
	return !item.publicUrl?.trim();
}

/** Resolve workspace library row by storage path (legacy drafts may carry a random attachment id). */
export async function resolveComposerMediaLibraryItemVm(
	organizationId: string,
	item: PostMediaProgrammerModel,
	getMediaPresenter: GetMediaPresenter
): Promise<MediaLibraryItemViewModel> {
	const base = postMediaToLibraryItemVm(item);
	const orgId = organizationId.trim();
	if (!orgId || isGuestOnlyComposerMedia(item)) return base;

	const browse = await getMediaPresenter.loadMediaPickerBrowseVm(orgId);
	const match = browse.images.find((row) => row.path === item.path);
	if (!match) return base;

	const playbackUrl = composerMediaPlaybackUrl(item);
	return {
		...base,
		...match,
		id: match.id,
		// Library browse may return a storage URL that does not load on localhost; keep compose playback.
		publicUrl: playbackUrl.startsWith('blob:') ? playbackUrl : match.publicUrl?.trim() || playbackUrl
	};
}

export function composerMediaItemSupportsSettings(item: PostMediaProgrammerModel): boolean {
	if (isGuestOnlyComposerMedia(item)) return false;
	const path = item.path.trim();
	return isImageMediaPath(path) || isVideoMediaPath(path);
}
