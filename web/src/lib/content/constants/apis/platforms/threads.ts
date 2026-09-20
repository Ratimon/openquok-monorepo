import { PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM } from '$lib/content/constants/apis/formatExamples';
import { buildPublicApiPlatformPage, SHARED_PUBLIC_API_SEO_KEYWORDS } from '$lib/content/constants/apis/shared';
import type { PublicApiPlatformPageViewModel } from '$lib/content/constants/apis/types';

const SLUG = 'threads' as const;

const KEYWORDS = [
	...SHARED_PUBLIC_API_SEO_KEYWORDS,
	'Threads posting API',
	'Threads scheduling API',
	'Meta Threads API',
	'schedule Threads via API'
];

export const threadsPublicApiPostingPlatform: PublicApiPlatformPageViewModel =
	buildPublicApiPlatformPage({
		slug: SLUG,
		capability: 'posting',
		formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].posting,
		heroDescription:
			'Publish Threads posts with media, follow-up replies, internal plugs, and cross-account comments through POST /public/posts.',
		metaTitle: 'Threads Posting API',
		metaDescription:
			'Post to Threads with OpenQuok POST /public/posts. Text, media carousels, thread replies, and cross-account plugs from one JSON payload.',
		keywords: KEYWORDS
	});

export const threadsPublicApiSchedulingPlatform: PublicApiPlatformPageViewModel =
	buildPublicApiPlatformPage({
		slug: SLUG,
		capability: 'scheduling',
		formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].scheduling,
		heroDescription:
			'Queue Threads posts and reply chains for a future publish time. Set scheduledAt in UTC with threads.replies and plug settings.',
		metaTitle: 'Threads Scheduling API',
		metaDescription:
			'Schedule Threads posts with OpenQuok POST /public/posts. Queue text, media, thread replies, and cross-account plugs for a future UTC time.',
		keywords: KEYWORDS
	});
