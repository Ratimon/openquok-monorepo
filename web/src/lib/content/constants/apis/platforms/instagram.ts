import { PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM } from '$lib/content/constants/apis/formatExamples';
import { buildPublicApiPlatformPage, SHARED_PUBLIC_API_SEO_KEYWORDS } from '$lib/content/constants/apis/shared';
import type { PublicApiPlatformPageViewModel } from '$lib/content/constants/apis/types';

const SLUG = 'instagram' as const;

const KEYWORDS = [
	...SHARED_PUBLIC_API_SEO_KEYWORDS,
	'Instagram posting API',
	'Instagram scheduling API',
	'Instagram Reels API',
	'schedule Instagram via API'
];

export const instagramPublicApiPostingPlatform: PublicApiPlatformPageViewModel =
	buildPublicApiPlatformPage({
		slug: SLUG,
		capability: 'posting',
		formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].posting,
		heroTitle: 'Instagram posting API for feed, Reels, carousels, and Stories',
		heroDescription:
			'Publish feed posts, Reels, carousels, and Stories with post type and collaborator settings through POST /public/posts.',
		metaTitle: 'Instagram Posting API',
		metaDescription:
			'Post to Instagram with OpenQuok POST /public/posts. Feed, Reels, carousels, and Stories with provider settings from one JSON payload.',
		keywords: KEYWORDS
	});

export const instagramPublicApiSchedulingPlatform: PublicApiPlatformPageViewModel =
	buildPublicApiPlatformPage({
		slug: SLUG,
		capability: 'scheduling',
		formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].scheduling,
		heroTitle: 'Instagram scheduling API for feed, Reels, carousels, and Stories',
		heroDescription:
			'Queue Instagram content for a future publish time. Set scheduledAt in UTC and choose post type, trial reels, or collaborators before publish.',
		metaTitle: 'Instagram Scheduling API',
		metaDescription:
			'Schedule Instagram posts with OpenQuok POST /public/posts. Queue feed, Reels, carousels, and Stories for a future UTC publish time.',
		keywords: KEYWORDS
	});
