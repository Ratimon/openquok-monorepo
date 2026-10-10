import { PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM } from '$lib/content/constants/channels/api/_shared/formatExamples';
import { buildPublicApiPlatformPage, SHARED_PUBLIC_API_SEO_KEYWORDS } from '$lib/content/constants/channels/api/_shared/shared';
import type { PublicApiPlatformPageViewModel } from '$lib/content/constants/channels/api/_shared/types';

const SLUG = 'x' as const;

const KEYWORDS = [
	...SHARED_PUBLIC_API_SEO_KEYWORDS,
	'X posting API',
	'Twitter posting API',
	'X scheduling API',
	'schedule tweets API'
];

export const xPublicApiSchedulingPlatform: PublicApiPlatformPageViewModel = buildPublicApiPlatformPage({
	slug: SLUG,
	capability: 'scheduling',
	formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].scheduling,
	heroPlatformLabel: 'Twitter / X',
	heroDescription:
		'Schedule Twitter/X posts through one simple API. Queue tweets and thread chains for a future instant with scheduledAt in UTC and chained follow-up replies.',
	metaTitle: 'X Scheduling API',
	metaDescription:
		'Schedule X posts with OpenQuok POST /public/posts. Queue tweets, thread replies, and media for a future publish time in UTC.',
	keywords: KEYWORDS
});
