import type {
	FacebookLaunchProviderSettings,
	LaunchProviderCheckContext,
	LaunchProviderConfig,
} from '$lib/ui/components/posts/providers/provider.types';

/** Facebook Page composer limits (matches backend `FacebookProvider.maxLength`). */
export const FACEBOOK_MAX_CHARACTERS = 63_206;

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);

function isValidHttpUrl(value: string): boolean {
	try {
		const parsed = new URL(value);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

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

/** Reads Facebook link settings from per-integration provider settings. */
export function readFacebookLaunchSettings(
	settings: Record<string, unknown>
): FacebookLaunchProviderSettings {
	const bucket = (settings as { facebook?: Partial<FacebookLaunchProviderSettings> }).facebook;
	const nestedUrl = typeof bucket?.url === 'string' ? bucket.url.trim() : '';
	if (nestedUrl) return { url: nestedUrl };

	const flatUrl = typeof settings.url === 'string' ? settings.url.trim() : '';
	return flatUrl ? { url: flatUrl } : {};
}

export function checkFacebookLinkSettingsValidity(
	settings: FacebookLaunchProviderSettings
): true | string {
	const url = settings.url?.trim();
	if (!url) return true;
	if (!isValidHttpUrl(url)) return 'Embedded URL must be a valid http(s) URL';
	return true;
}

export function checkFacebookLaunchValidity(ctx: LaunchProviderCheckContext): true | string {
	const linkCheck = checkFacebookLinkSettingsValidity(readFacebookLaunchSettings(ctx.settings));
	if (linkCheck !== true) return linkCheck;

	for (const reply of ctx.threadReplies ?? []) {
		const media = reply.media ?? [];
		if (media.length === 0) continue;
		if (media.length > 1) {
			return 'Facebook follow-up comments support at most one image.';
		}
		const item = media[0];
		if (isVideoPath(item?.path)) {
			return 'Facebook follow-up comments do not support video.';
		}
		if (!isImagePath(item?.path)) {
			return 'Facebook follow-up comments only support a single image attachment.';
		}
	}

	return true;
}

export const facebookProvider: LaunchProviderConfig = {
	id: 'facebook',
	maximumCharacters: FACEBOOK_MAX_CHARACTERS,
	minimumCharacters: 0,
	postComment: 'COMMENT',
	/** Omit `comments` — Facebook follow-up replies may include one image (unlike Instagram). */
	checkValidity: checkFacebookLaunchValidity
};
