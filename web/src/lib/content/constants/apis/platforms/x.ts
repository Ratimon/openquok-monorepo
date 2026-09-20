import { PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM } from '$lib/content/constants/apis/formatExamples';
import { buildPublicApiPlatformPage, SHARED_PUBLIC_API_SEO_KEYWORDS } from '$lib/content/constants/apis/shared';
import type { PublicApiPlatformPageViewModel } from '$lib/content/constants/apis/types';

const SLUG = 'x' as const;

const KEYWORDS = [
	...SHARED_PUBLIC_API_SEO_KEYWORDS,
	'X posting API',
	'Twitter posting API',
	'X scheduling API',
	'schedule tweets API'
];

export const xPublicApiPostingPlatform: PublicApiPlatformPageViewModel = buildPublicApiPlatformPage({
	slug: SLUG,
	capability: 'posting',
	formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].posting,
	heroPlatformLabel: 'Twitter / X',
	heroDescription:
		'Publish to Twitter/X through one simple API for apps, automations, and AI workflows. Post tweets, thread replies, and media with reply audience and cross-account repost settings.',
	metaTitle: 'X Posting API',
	metaDescription:
		'Post to X with OpenQuok POST /public/posts. Tweets, scheduled thread replies, media, and cross-account reposts from one JSON payload.',
	keywords: KEYWORDS
});

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
