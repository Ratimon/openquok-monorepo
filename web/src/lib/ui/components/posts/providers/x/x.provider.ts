import type {
	LaunchProviderCheckContext,
	LaunchProviderConfig,
	XLaunchProviderSettings
} from '$lib/ui/components/posts/providers/provider.types';

import {
	X_STANDARD_MAX_CHARACTERS,
	xMaxCharactersForChannel,
	xWeightedLength
} from '$lib/posts/utils/xWeightedLength';

import { readXLaunchSettings } from '$lib/ui/components/posts/providers/x/xLaunchSettings';

export const X_MAX_IMAGES = 4;
export const X_MAX_VIDEO_DURATION_SECONDS = 140;

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
	const ext = mediaExtFromPath(path);
	return ext === 'mp4' || ext === 'mov' || ext === 'm4v';
}

function isImagePath(path: string | undefined | null): boolean {
	if (!path) return false;
	return IMAGE_EXTENSIONS.has(mediaExtFromPath(path));
}

function measureVideoDurationSeconds(path: string): Promise<number> {
	return new Promise((resolve) => {
		const video = document.createElement('video');
		video.preload = 'metadata';
		video.src = path;
		video.addEventListener('loadedmetadata', () => resolve(video.duration), { once: true });
		video.addEventListener('error', () => resolve(0), { once: true });
	});
}

/** Validates X launch media rules (aligned with backend publish validation). */
export function checkXLaunchMediaValidity(
	media: { path: string }[],
	settings: XLaunchProviderSettings
): true | string {
	if (media.length > X_MAX_IMAGES) {
		return `X allows up to ${X_MAX_IMAGES} images or one video per post.`;
	}

	const hasVideo = media.some((m) => isVideoPath(m.path));
	const hasImage = media.some((m) => isImagePath(m.path));

	if (hasVideo && hasImage) {
		return 'X does not support mixing images and video in one post.';
	}
	if (hasVideo && media.length > 1) {
		return 'X allows one video per post.';
	}

	if (settings.communityUrl?.trim()) {
		const id = settings.communityUrl.match(/\/communities\/(\d+)/i)?.[1] ?? settings.communityUrl.trim();
		if (!/^\d+$/.test(id) && !settings.communityUrl.includes('communities/')) {
			return 'Community URL must be a valid X community link.';
		}
	}

	return true;
}

function xCheckContext(ctx: LaunchProviderCheckContext) {
	return {
		media: ctx.media,
		settings: readXLaunchSettings(ctx.settings)
	};
}

export const xProvider: LaunchProviderConfig = {
	id: 'x',
	maximumCharacters: X_STANDARD_MAX_CHARACTERS,
	minimumCharacters: 0,
	postComment: 'POST',
	comments: 'no-media',
	checkValidity: (ctx) => {
		const { media, settings } = xCheckContext(ctx);
		return checkXLaunchMediaValidity(media, settings);
	},
	checkValidityAsync: async (ctx) => {
		const { media, settings } = xCheckContext(ctx);
		const sync = checkXLaunchMediaValidity(media, settings);
		if (sync !== true) return sync;

		const video = media.find((m) => isVideoPath(m.path));
		if (!video?.path) return true;

		const duration = await measureVideoDurationSeconds(video.path);
		if (duration <= 0) return true;
		if (duration > X_MAX_VIDEO_DURATION_SECONDS) {
			return `X videos must be ${X_MAX_VIDEO_DURATION_SECONDS} seconds or shorter for this account.`;
		}
		return true;
	}
};

export { xMaxCharactersForChannel, xWeightedLength };
