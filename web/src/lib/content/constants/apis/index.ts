import type {
	PublicApiCapability,
	PublicApiHubPageViewModel,
	PublicApiPlatformHubCard,
	PublicApiPlatformPageViewModel,
	PublicApiPlatformSlug
} from '$lib/content/constants/apis/types';
import { publicApiPostingHubPage } from '$lib/content/constants/apis/posting';
import { publicApiSchedulingHubPage } from '$lib/content/constants/apis/scheduling';
import { buildPublicApiPlatformHubCard } from '$lib/content/constants/apis/shared';
import {
	facebookPublicApiPostingPlatform,
	facebookPublicApiSchedulingPlatform,
	instagramPublicApiPostingPlatform,
	instagramPublicApiSchedulingPlatform,
	linkedinPublicApiPostingPlatform,
	linkedinPublicApiSchedulingPlatform,
	threadsPublicApiPostingPlatform,
	threadsPublicApiSchedulingPlatform,
	tiktokPublicApiPostingPlatform,
	tiktokPublicApiSchedulingPlatform,
	xPublicApiPostingPlatform,
	xPublicApiSchedulingPlatform,
	youtubePublicApiPostingPlatform,
	youtubePublicApiSchedulingPlatform
} from '$lib/content/constants/apis/platforms/index';

export * from '$lib/content/constants/apis/types';
export { publicApiPostingHubPage } from '$lib/content/constants/apis/posting';
export { publicApiSchedulingHubPage } from '$lib/content/constants/apis/scheduling';
export {
	PUBLIC_API_POSTING_HUB_FAQ,
	PUBLIC_API_SCHEDULING_HUB_FAQ,
	getPublicApiCapabilityHubFaq
} from '$lib/content/constants/apis/publicApiCapabilityHubFaqConfig';
export {
	PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM
} from '$lib/content/constants/apis/formatExamples';
export {
	PUBLIC_API_POSTING_HUB_STATIC_EXAMPLE,
	PUBLIC_API_SCHEDULING_HUB_STATIC_EXAMPLE
} from '$lib/content/constants/apis/hubExamples';
export {
	PUBLIC_API_POSTING_HUB_SETUP_STEPS,
	PUBLIC_API_SCHEDULING_HUB_SETUP_STEPS,
	getPublicApiHubSetupStepsSection,
	getPublicApiPlatformSetupStepsSection
} from '$lib/content/constants/apis/publicApiCapabilityHubSetupStepsConfig';
export {
	getPublicApiHubAudienceSection,
	getPublicApiPlatformAudienceSection
} from '$lib/content/constants/apis/publicApiCapabilityAudienceConfig';
export {
	SHARED_PUBLIC_API_SEO_KEYWORDS,
	PUBLIC_API_CREATE_POST_ENDPOINT,
	PUBLIC_API_CLOUD_PUBLIC_BASE_URL,
	PUBLIC_API_PROGRAMMATIC_AUTH_CURL_HEADER,
	buildPublicApiCreatePostResponseExample,
	buildPublicApiCreatePostTerminalCode,
	buildPublicApiFormatExample,
	buildPublicApiIntegrationsListTerminalCode,
	buildPublicApiPlatformHubCard,
	getPublicApiProviderIdentifier
} from '$lib/content/constants/apis/shared';

export const PUBLIC_API_POSTING_PLATFORM_SLUGS: readonly PublicApiPlatformSlug[] = [
	'tiktok',
	'x',
	'instagram',
	'youtube',
	'facebook',
	'threads',
	'linkedin'
];

export const PUBLIC_API_SCHEDULING_PLATFORM_SLUGS: readonly PublicApiPlatformSlug[] = [
	...PUBLIC_API_POSTING_PLATFORM_SLUGS
];

const postingPlatformBySlug = new Map<PublicApiPlatformSlug, PublicApiPlatformPageViewModel>([
	['tiktok', tiktokPublicApiPostingPlatform],
	['x', xPublicApiPostingPlatform],
	['instagram', instagramPublicApiPostingPlatform],
	['youtube', youtubePublicApiPostingPlatform],
	['facebook', facebookPublicApiPostingPlatform],
	['threads', threadsPublicApiPostingPlatform],
	['linkedin', linkedinPublicApiPostingPlatform]
]);

const schedulingPlatformBySlug = new Map<PublicApiPlatformSlug, PublicApiPlatformPageViewModel>([
	['tiktok', tiktokPublicApiSchedulingPlatform],
	['x', xPublicApiSchedulingPlatform],
	['instagram', instagramPublicApiSchedulingPlatform],
	['youtube', youtubePublicApiSchedulingPlatform],
	['facebook', facebookPublicApiSchedulingPlatform],
	['threads', threadsPublicApiSchedulingPlatform],
	['linkedin', linkedinPublicApiSchedulingPlatform]
]);

export function isPublicApiPlatformSlug(value: string): value is PublicApiPlatformSlug {
	const key = value.trim().toLowerCase();
	return (PUBLIC_API_POSTING_PLATFORM_SLUGS as readonly string[]).includes(key);
}

export function getPublicApiPostingHubPage(): PublicApiHubPageViewModel {
	return publicApiPostingHubPage;
}

export function getPublicApiSchedulingHubPage(): PublicApiHubPageViewModel {
	return publicApiSchedulingHubPage;
}

export function getPublicApiPostingPlatformBySlug(
	slug: string
): PublicApiPlatformPageViewModel | undefined {
	const key = slug.trim().toLowerCase();
	if (!isPublicApiPlatformSlug(key)) {
		return undefined;
	}
	return postingPlatformBySlug.get(key);
}

export function getPublicApiSchedulingPlatformBySlug(
	slug: string
): PublicApiPlatformPageViewModel | undefined {
	const key = slug.trim().toLowerCase();
	if (!isPublicApiPlatformSlug(key)) {
		return undefined;
	}
	return schedulingPlatformBySlug.get(key);
}

export function getPublicApiPlatformBySlug(
	capability: PublicApiCapability,
	slug: string
): PublicApiPlatformPageViewModel | undefined {
	return capability === 'posting'
		? getPublicApiPostingPlatformBySlug(slug)
		: getPublicApiSchedulingPlatformBySlug(slug);
}

export function listPublicApiPostingPlatformsForHub(): PublicApiPlatformHubCard[] {
	return PUBLIC_API_POSTING_PLATFORM_SLUGS.map((slug) => buildPublicApiPlatformHubCard(slug));
}

export function listPublicApiSchedulingPlatformsForHub(): PublicApiPlatformHubCard[] {
	return PUBLIC_API_SCHEDULING_PLATFORM_SLUGS.map((slug) => buildPublicApiPlatformHubCard(slug));
}

/** Footer “Popular APIs” row — matches PostPeer’s top posting API slugs. */
export const PUBLIC_API_FOOTER_POPULAR_POSTING_SLUGS: readonly PublicApiPlatformSlug[] = [
	'tiktok',
	'youtube',
	'x',
	'instagram',
	'linkedin'
];
