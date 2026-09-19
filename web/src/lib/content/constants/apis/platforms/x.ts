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
	heroTitle: 'X posting API for tweets, threads, and media',
	heroDescription:
		'Publish tweets, thread replies, and media attachments with reply audience and cross-account repost settings through POST /public/posts.',
	metaTitle: 'X Posting API',
	metaDescription:
		'Post to X with OpenQuok POST /public/posts. Tweets, scheduled thread replies, media, and cross-account reposts from one JSON payload.',
	keywords: KEYWORDS
});

export const xPublicApiSchedulingPlatform: PublicApiPlatformPageViewModel = buildPublicApiPlatformPage({
	slug: SLUG,
	capability: 'scheduling',
	formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].scheduling,
	heroTitle: 'X scheduling API for tweets, threads, and media',
	heroDescription:
		'Queue tweets and thread chains for a future instant. Set scheduledAt in UTC and chain follow-up replies with delaySeconds.',
	metaTitle: 'X Scheduling API',
	metaDescription:
		'Schedule X posts with OpenQuok POST /public/posts. Queue tweets, thread replies, and media for a future publish time in UTC.',
	keywords: KEYWORDS
});
