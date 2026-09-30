import type {
	BlueskyLaunchProviderSettings,
	BlueskyThreadGateSetting,
	LaunchProviderCheckContext,
	LaunchProviderCheckMediaItem,
	LaunchProviderConfig
} from '$lib/ui/components/posts/providers/provider.types';

import { isVideoMediaPath } from '$lib/medias/utils/mediaDisplay';
import { BLUESKY_MAX_GRAPHEMES } from '$lib/posts/utils/composer/blueskyGraphemeLength';
import { normalizeHttpUrlInput } from '$lib/utils/normalizeHttpUrlInput';

/** Bluesky post text limit (matches backend `BlueskyProvider.maxLength`). */
export const BLUESKY_MAX_CHARACTERS = BLUESKY_MAX_GRAPHEMES;
export const BLUESKY_MAX_IMAGES = 4;
/** AT Protocol video upload cap (300 MB). */
export const BLUESKY_MAX_VIDEO_BYTES = 300 * 1024 * 1024;
/** AT Protocol video duration cap (10 minutes). */
export const BLUESKY_MAX_VIDEO_DURATION_SECONDS = 10 * 60;

export function blueskyVideoByteSizeError(byteLength: number): string | null {
	if (!Number.isFinite(byteLength) || byteLength < 0) {
		return 'Invalid Bluesky video file size.';
	}
	if (byteLength > BLUESKY_MAX_VIDEO_BYTES) {
		return 'Bluesky videos must be 300 MB or smaller.';
	}
	return null;
}

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

function isValidHttpUrl(value: string): boolean {
	try {
		const parsed = new URL(value);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

const BSKY_APP_POST_URL =
	/^https:\/\/bsky\.app\/profile\/([^/?#]+)\/post\/([^/?#]+)(?:[/?#]|$)/i;

function isBlueskyQuoteTarget(value: string): boolean {
	const trimmed = value.trim();
	if (!trimmed) return false;
	if (trimmed.startsWith('at://')) return true;
	return BSKY_APP_POST_URL.test(trimmed);
}

const THREAD_GATE_VALUES: BlueskyThreadGateSetting[] = [
	'everyone',
	'mentioned',
	'following',
	'followers',
	'nobody'
];

function readThreadGate(settings: Record<string, unknown>): BlueskyThreadGateSetting {
	const bucket = (settings as { bluesky?: Partial<BlueskyLaunchProviderSettings> }).bluesky;
	const raw = bucket?.threadGate ?? settings.threadGate ?? settings.thread_gate;
	if (typeof raw === 'string') {
		const normalized = raw.trim().toLowerCase();
		if (THREAD_GATE_VALUES.includes(normalized as BlueskyThreadGateSetting)) {
			return normalized as BlueskyThreadGateSetting;
		}
	}
	return 'everyone';
}

/** Reads Bluesky compose settings from per-integration provider settings. */
export function readBlueskyLaunchSettings(
	settings: Record<string, unknown>
): BlueskyLaunchProviderSettings {
	const bucket = (settings as { bluesky?: Partial<BlueskyLaunchProviderSettings> }).bluesky;

	const pickString = (...candidates: unknown[]): string | undefined => {
		for (const candidate of candidates) {
			if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
		}
		return undefined;
	};

	const linkUrlRaw = pickString(bucket?.linkUrl, settings.linkUrl, settings.link_url);
	const linkUrl = linkUrlRaw ? normalizeHttpUrlInput(linkUrlRaw) : undefined;
	const linkTitle = pickString(bucket?.linkTitle, settings.linkTitle, settings.link_title);
	const linkDescription = pickString(
		bucket?.linkDescription,
		settings.linkDescription,
		settings.link_description
	);
	const quoteUrl = pickString(bucket?.quoteUrl, settings.quoteUrl, settings.quote_url);

	return {
		...(linkUrl ? { linkUrl } : {}),
		...(linkTitle ? { linkTitle } : {}),
		...(linkDescription ? { linkDescription } : {}),
		...(quoteUrl ? { quoteUrl } : {}),
		threadGate: readThreadGate(settings)
	};
}

function checkBlueskySettingsValidity(
	settings: BlueskyLaunchProviderSettings,
	media: { path: string }[]
): true | string {
	const hasMedia = media.length > 0;
	const linkUrl = settings.linkUrl?.trim();
	const quoteUrl = settings.quoteUrl?.trim();

	if (linkUrl && !isValidHttpUrl(linkUrl)) {
		return 'Link card URL must be a valid http(s) URL';
	}
	if (quoteUrl && !isBlueskyQuoteTarget(quoteUrl)) {
		return 'Quote URL must be a bsky.app post link or an AT Protocol URI';
	}
	if (linkUrl && quoteUrl) {
		return 'Bluesky posts cannot include both a link card and a quote';
	}
	if (hasMedia && linkUrl) {
		return 'Link cards are only supported on text-only posts without media';
	}
	if (hasMedia && quoteUrl) {
		return 'Quote posts cannot include image or video attachments';
	}
	return true;
}

function videoPlaybackUrlForValidation(item: LaunchProviderCheckMediaItem): string {
	const local = item.localPreviewUrl?.trim();
	if (local) return local;
	const publicUrl = item.publicUrl?.trim();
	if (publicUrl) return publicUrl;
	return item.path.trim();
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

async function resolveComposerVideoByteSize(
	item: LaunchProviderCheckMediaItem
): Promise<number | null> {
	if (typeof item.byteSize === 'number' && Number.isFinite(item.byteSize) && item.byteSize >= 0) {
		return item.byteSize;
	}
	const blobUrl = item.localPreviewUrl?.trim();
	if (blobUrl?.startsWith('blob:')) {
		try {
			const res = await fetch(blobUrl);
			const blob = await res.blob();
			return blob.size;
		} catch {
			return null;
		}
	}
	const url = item.publicUrl?.trim();
	if (url) {
		try {
			const res = await fetch(url, { method: 'HEAD' });
			const length = res.headers.get('content-length');
			if (length) {
				const parsed = Number.parseInt(length, 10);
				if (Number.isFinite(parsed) && parsed >= 0) return parsed;
			}
		} catch {
			return null;
		}
	}
	return null;
}

function checkBlueskyVideoByteSizeSync(media: LaunchProviderCheckMediaItem[]): true | string {
	for (const item of media) {
		if (!isVideoPath(item.path)) continue;
		if (typeof item.byteSize !== 'number') continue;
		const sizeError = blueskyVideoByteSizeError(item.byteSize);
		if (sizeError) return sizeError;
	}
	return true;
}

async function checkBlueskyVideoLimitsAsync(
	media: LaunchProviderCheckMediaItem[]
): Promise<true | string> {
	for (const item of media) {
		if (!isVideoPath(item.path)) continue;

		const bytes = await resolveComposerVideoByteSize(item);
		if (bytes !== null) {
			const sizeError = blueskyVideoByteSizeError(bytes);
			if (sizeError) return sizeError;
		}

		const duration = await measureVideoDurationSeconds(videoPlaybackUrlForValidation(item));
		if (duration <= 0) continue;
		if (duration > BLUESKY_MAX_VIDEO_DURATION_SECONDS) {
			return `Bluesky videos must be ${BLUESKY_MAX_VIDEO_DURATION_SECONDS / 60} minutes or shorter.`;
		}
	}
	return true;
}

function validateBlueskyMediaPaths(media: LaunchProviderCheckMediaItem[]): true | string {
	if (media.length === 0) return true;

	const hasVideo = media.some((m) => isVideoPath(m.path));
	const hasImage = media.some((m) => isImagePath(m.path));

	if (hasVideo && hasImage) {
		return 'Bluesky does not support mixing images and video in one post.';
	}
	if (hasVideo && media.length > 1) {
		return 'Bluesky allows one MP4 video or up to four images per post, not multiple videos.';
	}
	if (hasVideo) {
		const sizeCheck = checkBlueskyVideoByteSizeSync(media);
		if (sizeCheck !== true) return sizeCheck;
		return true;
	}

	if (hasImage) {
		if (media.length > BLUESKY_MAX_IMAGES) {
			return `Bluesky allows up to ${BLUESKY_MAX_IMAGES} images or one MP4 video per post.`;
		}
		return true;
	}

	return 'Bluesky allows up to four images or one MP4 video per post.';
}

export function checkBlueskyLaunchValidity(ctx: LaunchProviderCheckContext): true | string {
	const settings = readBlueskyLaunchSettings(ctx.settings);
	const settingsCheck = checkBlueskySettingsValidity(settings, ctx.media ?? []);
	if (settingsCheck !== true) return settingsCheck;

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
	checkValidity: checkBlueskyLaunchValidity,
	checkValidityAsync: async (ctx) => {
		const sync = checkBlueskyLaunchValidity(ctx);
		if (sync !== true) return sync;
		if (typeof document === 'undefined') return true;

		const main = await checkBlueskyVideoLimitsAsync(ctx.media ?? []);
		if (main !== true) return main;

		for (const reply of ctx.threadReplies ?? []) {
			const replyCheck = await checkBlueskyVideoLimitsAsync(reply.media ?? []);
			if (replyCheck !== true) return replyCheck;
		}

		return true;
	}
};
