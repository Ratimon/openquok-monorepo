import type {
	LaunchProviderCheckContext,
	LaunchProviderConfig,
	YoutubeLaunchProviderSettings
} from '$lib/ui/components/posts/providers/provider.types';

/** YouTube description limit (matches backend `YoutubeProvider.maxLength`). */
export const YOUTUBE_MAX_CHARACTERS = 5000;

function isMp4Path(path: string | undefined | null): boolean {
	if (!path) return false;
	return path.toLowerCase().includes('mp4');
}

/** Reads YouTube settings from per-integration provider settings (flat CLI + nested bucket). */
export function readYoutubeLaunchSettings(
	settings: Record<string, unknown>
): YoutubeLaunchProviderSettings {
	const bucket = (settings as { youtube?: Partial<YoutubeLaunchProviderSettings> }).youtube;
	const nestedTitle = typeof bucket?.title === 'string' ? bucket.title.trim() : '';
	const flatTitle = typeof settings.title === 'string' ? settings.title.trim() : '';
	const title = nestedTitle || flatTitle;

	const nestedType = bucket?.type;
	const flatType = settings.type;
	const type =
		nestedType === 'private' || nestedType === 'unlisted' || nestedType === 'public'
			? nestedType
			: flatType === 'private' || flatType === 'unlisted' || flatType === 'public'
				? flatType
				: 'public';

	const nestedKids = bucket?.selfDeclaredMadeForKids;
	const flatKids = settings.selfDeclaredMadeForKids;
	const selfDeclaredMadeForKids =
		nestedKids === 'yes' || nestedKids === 'no'
			? nestedKids
			: flatKids === 'yes' || flatKids === 'no'
				? flatKids
				: 'no';

	const nestedTags = Array.isArray(bucket?.tags) ? bucket!.tags : [];
	const flatTags = Array.isArray(settings.tags) ? settings.tags : [];
	const tags = (nestedTags.length > 0 ? nestedTags : flatTags).filter(
		(t): t is { value: string; label: string } =>
			!!t &&
			typeof t === 'object' &&
			typeof (t as { value?: unknown }).value === 'string' &&
			typeof (t as { label?: unknown }).label === 'string'
	);

	const nestedThumb = bucket?.thumbnail;
	const flatThumb = settings.thumbnail;
	const thumbnail =
		nestedThumb && typeof nestedThumb === 'object' && typeof nestedThumb.path === 'string'
			? { path: nestedThumb.path }
			: flatThumb && typeof flatThumb === 'object' && typeof flatThumb.path === 'string'
				? { path: flatThumb.path }
				: undefined;

	return {
		title,
		type,
		selfDeclaredMadeForKids,
		tags,
		thumbnail
	};
}

export function checkYoutubeLaunchValidity(
	media: { path: string }[],
	settings: YoutubeLaunchProviderSettings
): true | string {
	if (!media?.length) {
		return 'YouTube requires one video attachment';
	}
	if (media.length > 1) {
		return 'YouTube requires exactly one video attachment';
	}
	if (!isMp4Path(media[0]?.path)) {
		return 'YouTube requires an MP4 video attachment';
	}

	const titleLen = settings.title.trim().length;
	if (titleLen < 2) {
		return 'YouTube title must be at least 2 characters';
	}
	if (titleLen > 100) {
		return 'YouTube title must be at most 100 characters';
	}

	return true;
}

function youtubeCheckContext(ctx: LaunchProviderCheckContext) {
	return {
		media: ctx.media,
		settings: readYoutubeLaunchSettings(ctx.settings)
	};
}

export const youtubeProvider: LaunchProviderConfig = {
	id: 'youtube',
	maximumCharacters: YOUTUBE_MAX_CHARACTERS,
	minimumCharacters: 0,
	postComment: 'COMMENT',
	comments: false,
	checkValidity: (ctx) => {
		const { media, settings } = youtubeCheckContext(ctx);
		return checkYoutubeLaunchValidity(media, settings);
	}
};
