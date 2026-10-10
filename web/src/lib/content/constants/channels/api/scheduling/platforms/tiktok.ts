import { PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM } from '$lib/content/constants/channels/api/_shared/formatExamples';
import { buildPublicApiPlatformPage, SHARED_PUBLIC_API_SEO_KEYWORDS } from '$lib/content/constants/channels/api/_shared/shared';
import type { PublicApiPlatformPageViewModel } from '$lib/content/constants/channels/api/_shared/types';

const SLUG = 'tiktok' as const;

const KEYWORDS = [
	...SHARED_PUBLIC_API_SEO_KEYWORDS,
	'TikTok posting API',
	'TikTok scheduling API',
	'TikTok Content Posting API',
	'schedule TikTok via API'
];

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
