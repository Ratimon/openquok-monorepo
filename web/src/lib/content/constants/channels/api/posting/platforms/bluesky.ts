import { PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM } from '$lib/content/constants/channels/api/_shared/formatExamples';
import { buildPublicApiPlatformPage, SHARED_PUBLIC_API_SEO_KEYWORDS } from '$lib/content/constants/channels/api/_shared/shared';
import type { PublicApiPlatformPageViewModel } from '$lib/content/constants/channels/api/_shared/types';

const SLUG = 'bluesky' as const;

const KEYWORDS = [
	...SHARED_PUBLIC_API_SEO_KEYWORDS,
	'Bluesky posting API',
	'Bluesky scheduling API',
	'AT Protocol posting API',
	'schedule Bluesky via API'
];

export const blueskyPublicApiPostingPlatform: PublicApiPlatformPageViewModel =
	buildPublicApiPlatformPage({
		slug: SLUG,
		capability: 'posting',
		formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].posting,
		heroDescription:
			'Publish Bluesky posts with text, images, video, link cards, and follow-up replies through POST /public/posts.',
		metaTitle: 'Bluesky Posting API',
		metaDescription:
			'Post to Bluesky with OpenQuok POST /public/posts. Text, media, mentions, and threaded follow-ups from one JSON payload.',
		keywords: KEYWORDS
	});

export const blueskyPublicApiSchedulingPlatform: PublicApiPlatformPageViewModel =
	buildPublicApiPlatformPage({
		slug: SLUG,
		capability: 'scheduling',
		formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].scheduling,
		heroDescription:
			'Schedule Bluesky posts for a future publish time. Send scheduledAt in UTC, queue media and reply chains, and let OpenQuok publish through your PDS.',
		metaTitle: 'Bluesky Scheduling API — Queue Posts with POST /public/posts',
		metaDescription:
			'Schedule Bluesky posts with OpenQuok POST /public/posts. Queue text, images, video, and follow-up replies with scheduledAt in UTC.',
		faqDescription:
			'Connect Bluesky with an app password, set scheduledAt in UTC, and schedule text, media, and follow-up replies from your app or agent.',
		keywords: KEYWORDS
	});
