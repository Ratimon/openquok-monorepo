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
