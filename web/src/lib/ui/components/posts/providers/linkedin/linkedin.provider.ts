import type {
	LaunchProviderCheckContext,
	LaunchProviderConfig,
	LinkedInLaunchProviderSettings
} from '$lib/ui/components/posts/providers/provider.types';

/** LinkedIn composer limits (matches backend `LinkedInProvider.maxLength`). */
export const LINKEDIN_MAX_CHARACTERS = 3000;

function mergeLinkedInSettings(settings: Record<string, unknown>): LinkedInLaunchProviderSettings {
	const linkedin = (settings as { linkedin?: Partial<LinkedInLaunchProviderSettings> }).linkedin;
	const flatCarousel = settings.post_as_images_carousel ?? settings.postAsImagesCarousel;
	const flatName = settings.carousel_name ?? settings.carouselName;

	return {
		postAsImagesCarousel:
			linkedin?.postAsImagesCarousel ??
			(flatCarousel === true || flatCarousel === 'true' ? true : false),
		carouselName:
			(typeof linkedin?.carouselName === 'string' ? linkedin.carouselName.trim() : '') ||
			(typeof flatName === 'string' ? flatName.trim() : '') ||
			undefined
	};
}

function countMedia(ctx: LaunchProviderCheckContext): number {
	return ctx.media?.length ?? 0;
}

function hasVideoMedia(ctx: LaunchProviderCheckContext): boolean {
	return (ctx.media ?? []).some((m) => (m.path ?? '').toLowerCase().includes('mp4'));
}

export function checkLinkedInLaunchValidity(ctx: LaunchProviderCheckContext): true | string {
	const settings = mergeLinkedInSettings(ctx.settings);
	const mediaCount = countMedia(ctx);
	const video = hasVideoMedia(ctx);

	if (settings.postAsImagesCarousel) {
		if (mediaCount < 2) {
			return 'Image carousel requires at least two images.';
		}
		if (video) {
			return 'Image carousel cannot include video.';
		}
	}

	if (video && mediaCount > 1) {
		return 'LinkedIn allows only one attachment when posting video.';
	}

	const replyMedia = (ctx.threadReplies ?? []).some((r) => (r.media?.length ?? 0) > 0);
	if (replyMedia) {
		return 'LinkedIn follow-up comments can only contain text.';
	}

	return true;
}

export const linkedinProvider: LaunchProviderConfig = {
	id: 'linkedin',
	maximumCharacters: LINKEDIN_MAX_CHARACTERS,
	minimumCharacters: 0,
	postComment: 'COMMENT',
	checkValidity: checkLinkedInLaunchValidity
};
