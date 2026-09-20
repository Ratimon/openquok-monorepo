import { PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM } from '$lib/content/constants/apis/formatExamples';
import { buildPublicApiPlatformPage, SHARED_PUBLIC_API_SEO_KEYWORDS } from '$lib/content/constants/apis/shared';
import type { PublicApiPlatformPageViewModel } from '$lib/content/constants/apis/types';

const SLUG = 'tiktok' as const;

const KEYWORDS = [
	...SHARED_PUBLIC_API_SEO_KEYWORDS,
	'TikTok posting API',
	'TikTok scheduling API',
	'TikTok Content Posting API',
	'schedule TikTok via API'
];

export const tiktokPublicApiPostingPlatform: PublicApiPlatformPageViewModel = buildPublicApiPlatformPage({
	slug: SLUG,
	capability: 'posting',
	formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].posting,
	heroDescription:
		'Publish vertical videos and image carousels with privacy, inbox upload, and interaction settings through POST /public/posts.',
	metaTitle: 'TikTok Posting API',
	metaDescription:
		'Post TikTok videos and photo carousels with OpenQuok POST /public/posts. Direct publish or inbox upload, privacy toggles, and structured API responses.',
	keywords: KEYWORDS
});

export const tiktokPublicApiSchedulingPlatform: PublicApiPlatformPageViewModel = buildPublicApiPlatformPage({
	slug: SLUG,
	capability: 'scheduling',
	formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].scheduling,
	heroDescription:
		'Queue TikTok videos and carousels for a future publish time. Set scheduledAt in UTC and tune privacy or inbox upload before the worker publishes.',
	metaTitle: 'TikTok Scheduling API',
	metaDescription:
		'Schedule TikTok videos and photo carousels with OpenQuok POST /public/posts. Set scheduledAt in UTC, privacy levels, and inbox upload from one JSON payload.',
	keywords: KEYWORDS
});
