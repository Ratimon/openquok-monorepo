import type {
	PublicApiHubPageViewModel,
	PublicApiPlatformHubCard,
	PublicApiPlatformPageViewModel,
	PublicApiPlatformSlug
} from '$lib/content/constants/channels/api/_shared/types';
import { buildPublicApiPlatformHubCard } from '$lib/content/constants/channels/api/_shared/shared';
import { PUBLIC_API_POSTING_PLATFORM_SLUGS } from '$lib/content/constants/channels/api/posting/index';
import {
	blueskyPublicApiSchedulingPlatform,
	facebookPublicApiSchedulingPlatform,
	instagramPublicApiSchedulingPlatform,
	linkedinPublicApiSchedulingPlatform,
	threadsPublicApiSchedulingPlatform,
	tiktokPublicApiSchedulingPlatform,
	xPublicApiSchedulingPlatform,
	youtubePublicApiSchedulingPlatform
} from '$lib/content/constants/channels/api/posting/platforms/index';
import { publicApiSchedulingHubPage } from '$lib/content/constants/channels/api/scheduling/general';

export { publicApiSchedulingHubPage } from '$lib/content/constants/channels/api/scheduling/general';

export const PUBLIC_API_SCHEDULING_PLATFORM_SLUGS: readonly PublicApiPlatformSlug[] = [
	...PUBLIC_API_POSTING_PLATFORM_SLUGS
];

const schedulingPlatformBySlug = new Map<PublicApiPlatformSlug, PublicApiPlatformPageViewModel>([
	['tiktok', tiktokPublicApiSchedulingPlatform],
	['x', xPublicApiSchedulingPlatform],
	['instagram', instagramPublicApiSchedulingPlatform],
	['youtube', youtubePublicApiSchedulingPlatform],
	['facebook', facebookPublicApiSchedulingPlatform],
	['threads', threadsPublicApiSchedulingPlatform],
	['linkedin', linkedinPublicApiSchedulingPlatform],
	['bluesky', blueskyPublicApiSchedulingPlatform]
]);

export function getPublicApiSchedulingHubPage(): PublicApiHubPageViewModel {
	return publicApiSchedulingHubPage;
}

export function getPublicApiSchedulingPlatformBySlug(
	slug: string
): PublicApiPlatformPageViewModel | undefined {
	const key = slug.trim().toLowerCase();
	if (!(PUBLIC_API_SCHEDULING_PLATFORM_SLUGS as readonly string[]).includes(key)) {
		return undefined;
	}
	return schedulingPlatformBySlug.get(key as PublicApiPlatformSlug);
}

export function listPublicApiSchedulingPlatformsForHub(): PublicApiPlatformHubCard[] {
	return PUBLIC_API_SCHEDULING_PLATFORM_SLUGS.map((slug) => buildPublicApiPlatformHubCard(slug));
}
