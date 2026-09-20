import type { PublicApiHubPageViewModel } from '$lib/content/constants/apis/types';
import { PUBLIC_API_SCHEDULING_HUB_STATIC_EXAMPLE } from '$lib/content/constants/apis/hubExamples';
import { PUBLIC_API_SCHEDULING_HUB_FAQ } from '$lib/content/constants/apis/publicApiCapabilityHubFaqConfig';
import { SHARED_PUBLIC_API_SEO_KEYWORDS } from '$lib/content/constants/apis/shared';
import { buildPublicApiHubHeroTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';

export const publicApiSchedulingHubPage: PublicApiHubPageViewModel = {
	capability: 'scheduling',
	heroTitle: buildPublicApiHubHeroTitle('scheduling'),
	heroDescription:
		'Schedule posts across TikTok, Instagram, X, LinkedIn, Facebook, Threads, and YouTube with one API. Set scheduledAt in UTC, optional repeatInterval, and per-channel provider settings — OpenQuok publishes through the same POST /api/v1/public/posts endpoint.',
	metaTitle: 'Social Media Scheduling API',
	metaDescription:
		'Schedule TikTok, Instagram, X, LinkedIn, Facebook, Threads, and YouTube posts with OpenQuok POST /public/posts. Set scheduledAt in UTC, explore platform examples, and connect channels on a paid workspace plan.',
	keywords: [
		...SHARED_PUBLIC_API_SEO_KEYWORDS,
		'social media scheduling API',
		'schedule posts API',
		'scheduledAt public API',
		'cron social media API'
	],
	hubDescription:
		'Set scheduledAt in UTC, optionally repeat on a cadence, and return structured post rows for every channel.',
	staticExample: PUBLIC_API_SCHEDULING_HUB_STATIC_EXAMPLE,
	...PUBLIC_API_SCHEDULING_HUB_FAQ
};
