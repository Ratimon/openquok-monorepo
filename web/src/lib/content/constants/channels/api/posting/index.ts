import type {
	PublicApiHubPageViewModel,
	PublicApiPlatformHubCard,
	PublicApiPlatformPageViewModel,
	PublicApiPlatformSlug
} from '$lib/content/constants/channels/api/_shared/types';
import { buildPublicApiPlatformHubCard } from '$lib/content/constants/channels/api/_shared/shared';
import { publicApiPostingHubPage } from '$lib/content/constants/channels/api/posting/general';
import {
	blueskyPublicApiPostingPlatform,
	devtoPublicApiPostingPlatform,
	skoolPublicApiPostingPlatform,
	facebookPublicApiPostingPlatform,
	instagramPublicApiPostingPlatform,
	linkedinPublicApiPostingPlatform,
	threadsPublicApiPostingPlatform,
	tiktokPublicApiPostingPlatform,
	xPublicApiPostingPlatform,
	youtubePublicApiPostingPlatform
} from '$lib/content/constants/channels/api/posting/platforms/index';

export { publicApiPostingHubPage } from '$lib/content/constants/channels/api/posting/general';

export const PUBLIC_API_POSTING_PLATFORM_SLUGS: readonly PublicApiPlatformSlug[] = [
	'tiktok',
	'x',
	'instagram',
	'youtube',
	'facebook',
	'threads',
	'linkedin',
	'bluesky',
	'devto',
	'skool'
];

const postingPlatformBySlug = new Map<PublicApiPlatformSlug, PublicApiPlatformPageViewModel>([
	['tiktok', tiktokPublicApiPostingPlatform],
	['x', xPublicApiPostingPlatform],
	['instagram', instagramPublicApiPostingPlatform],
	['youtube', youtubePublicApiPostingPlatform],
	['facebook', facebookPublicApiPostingPlatform],
	['threads', threadsPublicApiPostingPlatform],
	['linkedin', linkedinPublicApiPostingPlatform],
	['bluesky', blueskyPublicApiPostingPlatform],
	['devto', devtoPublicApiPostingPlatform],
	['skool', skoolPublicApiPostingPlatform]
]);

export function getPublicApiPostingHubPage(): PublicApiHubPageViewModel {
	return publicApiPostingHubPage;
}

export function getPublicApiPostingPlatformBySlug(
	slug: string
): PublicApiPlatformPageViewModel | undefined {
	const key = slug.trim().toLowerCase();
	if (!(PUBLIC_API_POSTING_PLATFORM_SLUGS as readonly string[]).includes(key)) {
		return undefined;
	}
	return postingPlatformBySlug.get(key as PublicApiPlatformSlug);
}

export function listPublicApiPostingPlatformsForHub(): PublicApiPlatformHubCard[] {
	return PUBLIC_API_POSTING_PLATFORM_SLUGS.map((slug) => buildPublicApiPlatformHubCard(slug));
}

/** Footer “Popular APIs” row — matches PostPeer’s top posting API slugs. */
export const PUBLIC_API_FOOTER_POPULAR_POSTING_SLUGS: readonly PublicApiPlatformSlug[] = [
	'tiktok',
	'youtube',
	'x',
	'instagram',
	'linkedin'
];
