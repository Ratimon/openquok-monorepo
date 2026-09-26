import type { LaunchProviderCheckContext, LaunchProviderConfig } from '$lib/ui/components/posts/providers/provider.types';

import { isVideoMediaPath } from '$lib/medias/utils/mediaDisplay';

/** Bluesky post text limit (matches backend `BlueskyProvider.maxLength`). */
export const BLUESKY_MAX_CHARACTERS = 300;
export const BLUESKY_MAX_IMAGES = 4;

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);

function mediaExtFromPath(path: string): string {
	const raw = path.trim();
	if (!raw) return '';
	try {
		const u = new URL(raw);
		return (u.pathname.split('.').pop() ?? '').toLowerCase();
	} catch {
		return (raw.split('?')[0]?.split('#')[0]?.split('.').pop() ?? '').toLowerCase();
	}
}

function isVideoPath(path: string | undefined | null): boolean {
	if (!path) return false;
	return mediaExtFromPath(path) === 'mp4';
}

function isImagePath(path: string | undefined | null): boolean {
	if (!path) return false;
	return IMAGE_EXTENSIONS.has(mediaExtFromPath(path));
}

export type BlueskyPreviewMediaMode = 'empty' | 'video' | 'photo';

function isVideoStorageOrPreviewPath(path: string | undefined | null): boolean {
	if (!path?.trim()) return false;
	const trimmed = path.trim();
	if (trimmed.startsWith('blob:')) return false;
	return isVideoMediaPath(trimmed) || mediaExtFromPath(trimmed) === 'mp4';
}

/** Classify preview media for Bluesky (blob URLs need storage paths for extensions). */
export function classifyBlueskyPreviewMediaMode(
	urls: readonly string[],
	storagePaths?: readonly string[]
): BlueskyPreviewMediaMode {
	if (urls.length === 0) return 'empty';
	for (let i = 0; i < urls.length; i++) {
		const storagePath = storagePaths?.[i]?.trim();
		if (storagePath && isVideoStorageOrPreviewPath(storagePath)) {
			return 'video';
		}
		if (isVideoStorageOrPreviewPath(urls[i])) {
			return 'video';
		}
	}
	return 'photo';
}

function validateBlueskyMediaPaths(media: { path: string }[]): true | string {
	if (media.length === 0) return true;

	const hasVideo = media.some((m) => isVideoPath(m.path));
	const hasImage = media.some((m) => isImagePath(m.path));

	if (hasVideo && hasImage) {
		return 'Bluesky does not support mixing images and video in one post.';
	}
	if (hasVideo && media.length > 1) {
		return 'Bluesky allows one MP4 video or up to four images per post, not multiple videos.';
	}
	if (hasVideo) return true;

	if (hasImage) {
		if (media.length > BLUESKY_MAX_IMAGES) {
			return `Bluesky allows up to ${BLUESKY_MAX_IMAGES} images or one MP4 video per post.`;
		}
		return true;
	}

	return 'Bluesky allows up to four images or one MP4 video per post.';
}

export function checkBlueskyLaunchValidity(ctx: LaunchProviderCheckContext): true | string {
	const main = validateBlueskyMediaPaths(ctx.media);
	if (main !== true) return main;

	for (const reply of ctx.threadReplies ?? []) {
		const replyCheck = validateBlueskyMediaPaths(reply.media ?? []);
		if (replyCheck !== true) return replyCheck;
	}

	return true;
}

export const blueskyProvider: LaunchProviderConfig = {
	id: 'bluesky',
	maximumCharacters: BLUESKY_MAX_CHARACTERS,
	minimumCharacters: 0,
	postComment: 'POST',
	checkValidity: checkBlueskyLaunchValidity
};
