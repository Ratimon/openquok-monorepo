import { PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM } from '$lib/content/constants/channels/api/_shared/formatExamples';
import { buildPublicApiPlatformPage, SHARED_PUBLIC_API_SEO_KEYWORDS } from '$lib/content/constants/channels/api/_shared/shared';
import type { PublicApiPlatformPageViewModel } from '$lib/content/constants/channels/api/_shared/types';

const SLUG = 'youtube' as const;

const KEYWORDS = [
	...SHARED_PUBLIC_API_SEO_KEYWORDS,
	'YouTube posting API',
	'YouTube scheduling API',
	'YouTube upload API',
	'schedule YouTube via API'
];

export const youtubePublicApiSchedulingPlatform: PublicApiPlatformPageViewModel =
	buildPublicApiPlatformPage({
		slug: SLUG,
		capability: 'scheduling',
		formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].scheduling,
		heroDescription:
			'Queue YouTube uploads for a future publish time. Set scheduledAt in UTC with title, privacy, tags, and thumbnail settings.',
		metaTitle: 'YouTube Scheduling API',
		metaDescription:
			'Schedule YouTube videos with OpenQuok POST /public/posts. Set scheduledAt in UTC with title, privacy, tags, and custom thumbnails.',
		keywords: KEYWORDS
	});
