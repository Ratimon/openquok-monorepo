import type {
	FacebookLaunchProviderSettings,
	LaunchProviderCheckContext,
	LaunchProviderConfig,
} from '$lib/ui/components/posts/providers/provider.types';

/** Facebook Page composer limits (matches backend `FacebookProvider.maxLength`). */
export const FACEBOOK_MAX_CHARACTERS = 63_206;

function isValidHttpUrl(value: string): boolean {
	try {
		const parsed = new URL(value);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
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

export function checkFacebookLaunchValidity(
	settings: FacebookLaunchProviderSettings
): true | string {
	const url = settings.url?.trim();
	if (!url) return true;
	if (!isValidHttpUrl(url)) return 'Embedded URL must be a valid http(s) URL';
	return true;
}

function facebookCheckContext(ctx: LaunchProviderCheckContext) {
	return readFacebookLaunchSettings(ctx.settings);
}

export const facebookProvider: LaunchProviderConfig = {
	id: 'facebook',
	maximumCharacters: FACEBOOK_MAX_CHARACTERS,
	minimumCharacters: 0,
	postComment: 'COMMENT',
	/** Omit `comments` — Facebook follow-up replies may include one image (unlike Instagram). */
	checkValidity: (ctx) => checkFacebookLaunchValidity(facebookCheckContext(ctx))
};
