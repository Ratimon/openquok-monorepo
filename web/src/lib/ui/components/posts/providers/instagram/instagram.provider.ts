import type {
	InstagramGraduationStrategy,
	InstagramLaunchProviderSettings,
	LaunchProviderCheckContext,
	LaunchProviderConfig,
} from '$lib/ui/components/posts/providers/provider.types';

function isMp4Path(path: string | undefined | null): boolean {
	if (!path) return false;
	return path.toLowerCase().includes('mp4');
}

function mergeInstagramSettings(settings: Record<string, unknown>): InstagramLaunchProviderSettings {
	const s = (settings as { instagram?: Partial<InstagramLaunchProviderSettings> }).instagram;
	const graduation = s?.graduationStrategy;
	return {
		postType: s?.postType === 'story' ? 'story' : 'post',
		collaborators: Array.isArray(s?.collaborators) ? s!.collaborators : [],
		trialReel: s?.trialReel === true,
		graduationStrategy: graduation === 'SS_PERFORMANCE' ? 'SS_PERFORMANCE' : 'MANUAL'
	};
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
		if (settings.postType === 'story') {
			return 'Trial Reels cannot be published as Stories';
		}
		if (rest.length > 0) {
			return 'Trial Reels can only have one video';
		}
		if (!isMp4Path(first.path)) {
			return 'Trial Reels must be a video';
		}
	}

	if (settings.postType === 'story' && settings.collaborators.length > 0) {
		return 'Collaborators are not supported for Stories';
	}

	return true;
}

async function checkInstagramVideoDurations(
	media: { path: string }[],
	settings: InstagramLaunchProviderSettings
): Promise<true | string> {
	const videos = media.filter((m) => isMp4Path(m.path));
	if (videos.length === 0) return true;

	const durations = await Promise.all(videos.map((m) => measureVideoDurationSeconds(m.path)));
	for (const duration of durations) {
		if (!Number.isFinite(duration) || duration <= 0) continue;
		if (duration > 60 && settings.postType === 'story') {
			return 'Stories should be maximum 60 seconds';
		}
		if (duration > 180 && settings.postType === 'post') {
			return 'Reel should be maximum 180 seconds';
		}
	}
	return true;
}

function instagramCheckContext(ctx: LaunchProviderCheckContext) {
	const settings = mergeInstagramSettings(ctx.settings);
	return { media: ctx.media, settings };
}

export const instagramProvider: LaunchProviderConfig = {
	id: 'instagram',
	maximumCharacters: 2200,
	minimumCharacters: 0,
	postComment: 'COMMENT',
	comments: 'no-media',
	checkValidity: (ctx) => {
		const { media, settings } = instagramCheckContext(ctx);
		return checkInstagramLaunchValidity(media, settings);
	},
	checkValidityAsync: async (ctx) => {
		const { media, settings } = instagramCheckContext(ctx);
		const sync = checkInstagramLaunchValidity(media, settings);
		if (sync !== true) return sync;
		if (typeof document === 'undefined') return true;
		return checkInstagramVideoDurations(media, settings);
	}
};
