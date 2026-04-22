import type {
	InstagramLaunchProviderSettings,
	LaunchProviderConfig,
} from '$lib/ui/components/posts/providers/provider.types';

function isMp4Path(path: string | undefined | null): boolean {
	if (!path) return false;
	return path.toLowerCase().includes('mp4');
}

/** Validates Instagram launch content (media required; story and trial-reel rules). */
export function checkInstagramLaunchValidity(
	media: { path: string }[],
	settings: InstagramLaunchProviderSettings
): true | string {
	if (!media?.length) {
		return 'Should have at least one media';
	}
	const [first, ...rest] = media;
	if (!first) {
		return 'Should have at least one media';
	}

	if (settings.trialReel) {
		if (rest.length > 0) {
			return 'Trial Reels can only have one video';
		}
		if (!isMp4Path(first.path)) {
			return 'Trial Reels must be a video';
		}
	}

	if (settings.postType === 'story' && media.length !== 1) {
		return 'Instagram story should have exactly one attachment';
	}
	return true;
}

export const instagramProvider: LaunchProviderConfig = {
	id: 'instagram',
	maximumCharacters: 2200,
	minimumCharacters: 0,
	postComment: 'ALL',
	comments: 'no-media',
	checkValidity: ({ media, settings }) => {
		const s = (settings as { instagram?: Partial<InstagramLaunchProviderSettings> }).instagram;
		const merged: InstagramLaunchProviderSettings = {
			postType: s?.postType === 'story' ? 'story' : 'post',
			collaborators: Array.isArray(s?.collaborators) ? s!.collaborators : [],
			trialReel: s?.trialReel === true
		};
		return checkInstagramLaunchValidity(media, merged);
	}
};

