import type {
	LaunchProviderCheckContext,
	LaunchProviderConfig,
	TiktokContentPostingMethod,
	TiktokLaunchProviderSettings,
	TiktokPrivacyLevel
} from '$lib/ui/components/posts/providers/provider.types';

/** TikTok caption limit (matches backend `TiktokProvider.maxLength`). */
export const TIKTOK_MAX_CHARACTERS = 2000;

export const TIKTOK_PHOTO_TITLE_MAX = 90;
export const TIKTOK_PHOTO_CAROUSEL_MAX_ITEMS = 35;

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);

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

function isMp4Path(path: string | undefined | null): boolean {
	if (!path) return false;
	return mediaExtFromPath(path) === 'mp4';
}

function isImagePath(path: string | undefined | null): boolean {
	if (!path) return false;
	return IMAGE_EXTENSIONS.has(mediaExtFromPath(path));
}

function readPrivacyLevel(source: Record<string, unknown>): TiktokPrivacyLevel {
	const raw = source.privacy_level ?? source.privacyLevel;
	if (
		raw === 'PUBLIC_TO_EVERYONE' ||
		raw === 'MUTUAL_FOLLOW_FRIENDS' ||
		raw === 'FOLLOWER_OF_CREATOR' ||
		raw === 'SELF_ONLY'
	) {
		return raw;
	}
	return 'PUBLIC_TO_EVERYONE';
}

function readPostingMethod(source: Record<string, unknown>): TiktokContentPostingMethod {
	const raw = source.content_posting_method ?? source.contentPostingMethod;
	if (raw === 'UPLOAD' || raw === 'MEDIA_UPLOAD') return 'UPLOAD';
	if (raw === 'DIRECT_POST') return 'DIRECT_POST';
	return 'DIRECT_POST';
}

function readBool(source: Record<string, unknown>, ...keys: string[]): boolean {
	for (const key of keys) {
		const raw = source[key];
		if (raw === true || raw === 'true' || raw === 'yes' || raw === 1 || raw === '1') return true;
		if (raw === false || raw === 'false' || raw === 'no' || raw === 0 || raw === '0') return false;
	}
	return false;
}

function readAllowToggle(
	source: Record<string, unknown>,
	allowKey: string,
	disableKey: string,
	defaultAllow: boolean
): boolean {
	if (allowKey in source) return readBool(source, allowKey);
	if (disableKey in source) return !readBool(source, disableKey);
	return defaultAllow;
}

/** Reads TikTok settings from per-integration provider settings (flat CLI + nested bucket). */
export function readTiktokLaunchSettings(
	settings: Record<string, unknown>
): TiktokLaunchProviderSettings {
	const bucket = (settings as { tiktok?: Partial<TiktokLaunchProviderSettings> }).tiktok;
	const source: Record<string, unknown> = {
		...settings,
		...(bucket && typeof bucket === 'object' ? bucket : {})
	};

	const nestedTitle = typeof bucket?.title === 'string' ? bucket.title.trim() : '';
	const flatTitle = typeof settings.title === 'string' ? settings.title.trim() : '';
	const title = (nestedTitle || flatTitle).slice(0, TIKTOK_PHOTO_TITLE_MAX);

	return {
		privacy_level: readPrivacyLevel(source),
		content_posting_method: readPostingMethod(source),
		title,
		duet: readAllowToggle(source, 'duet', 'disable_duet', true),
		stitch: readAllowToggle(source, 'stitch', 'disable_stitch', true),
		comment: readAllowToggle(source, 'comment', 'disable_comment', true),
		autoAddMusic: readBool(source, 'autoAddMusic', 'auto_add_music'),
		brand_content_toggle: readBool(source, 'brand_content_toggle', 'brandContentToggle'),
		brand_organic_toggle: readBool(source, 'brand_organic_toggle', 'brandOrganicToggle'),
		video_made_with_ai: readBool(source, 'video_made_with_ai', 'videoMadeWithAi')
	};
}

function classifyTiktokMedia(media: { path: string }[]): 'video' | 'photo' | null {
	if (media.length === 0) return null;
	const hasVideo = media.some((m) => isMp4Path(m.path));
	const hasImage = media.some((m) => isImagePath(m.path));
	if (hasVideo && hasImage) return null;
	if (hasVideo) return media.length === 1 ? 'video' : null;
	if (hasImage) return 'photo';
	return null;
}

/** Validates TikTok launch content (media rules aligned with backend publish validation). */
export function checkTiktokLaunchValidity(
	media: { path: string }[],
	settings: TiktokLaunchProviderSettings
): true | string {
	if (!media?.length) {
		return 'TikTok requires one video or one or more images';
	}

	const kind = classifyTiktokMedia(media);
	if (!kind) {
		if (media.length > 1 && media.some((m) => isMp4Path(m.path))) {
			return 'TikTok does not support mixing video and images in one post';
		}
		if (media.length > 1 && media.every((m) => isMp4Path(m.path))) {
			return 'TikTok requires exactly one MP4 video';
		}
		return 'TikTok media type is not supported';
	}

	if (kind === 'video') {
		if (!isMp4Path(media[0]?.path)) {
			return 'TikTok requires an MP4 video attachment';
		}
	} else {
		for (const item of media) {
			if (!isImagePath(item.path)) {
				return 'TikTok photo posts require JPEG, PNG, or WEBP images';
			}
		}
		if (media.length > TIKTOK_PHOTO_CAROUSEL_MAX_ITEMS) {
			return `TikTok photo posts support at most ${TIKTOK_PHOTO_CAROUSEL_MAX_ITEMS} images`;
		}
		const titleLen = settings.title.trim().length;
		if (titleLen > TIKTOK_PHOTO_TITLE_MAX) {
			return `TikTok photo title must be at most ${TIKTOK_PHOTO_TITLE_MAX} characters`;
		}
	}

	return true;
}

function tiktokCheckContext(ctx: LaunchProviderCheckContext) {
	return {
		media: ctx.media,
		settings: readTiktokLaunchSettings(ctx.settings)
	};
}

export const tiktokProvider: LaunchProviderConfig = {
	id: 'tiktok',
	maximumCharacters: TIKTOK_MAX_CHARACTERS,
	minimumCharacters: 0,
	postComment: 'COMMENT',
	comments: false,
	checkValidity: (ctx) => {
		const { media, settings } = tiktokCheckContext(ctx);
		return checkTiktokLaunchValidity(media, settings);
	}
};
