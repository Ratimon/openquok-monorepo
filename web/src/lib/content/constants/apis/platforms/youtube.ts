import { PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM } from '$lib/content/constants/apis/formatExamples';
import { buildPublicApiPlatformPage, SHARED_PUBLIC_API_SEO_KEYWORDS } from '$lib/content/constants/apis/shared';
import type { PublicApiPlatformPageViewModel } from '$lib/content/constants/apis/types';

const SLUG = 'youtube' as const;

const KEYWORDS = [
	...SHARED_PUBLIC_API_SEO_KEYWORDS,
	'YouTube posting API',
	'YouTube scheduling API',
	'YouTube upload API',
	'schedule YouTube via API'
];

export const youtubePublicApiPostingPlatform: PublicApiPlatformPageViewModel = buildPublicApiPlatformPage({
	slug: SLUG,
	capability: 'posting',
	formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].posting,
	heroDescription:
		'Publish videos with title, privacy, tags, made-for-kids, and custom thumbnail settings through POST /public/posts.',
	metaTitle: 'YouTube Posting API',
	metaDescription:
		'Upload and publish YouTube videos with OpenQuok POST /public/posts. Title, privacy, tags, and thumbnail settings in one JSON payload.',
	keywords: KEYWORDS
});

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
