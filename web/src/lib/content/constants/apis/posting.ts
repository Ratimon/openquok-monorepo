import type { PublicApiHubPageViewModel } from '$lib/content/constants/apis/types';
import { PUBLIC_API_POSTING_HUB_STATIC_EXAMPLE } from '$lib/content/constants/apis/hubExamples';
import { PUBLIC_API_POSTING_HUB_FAQ } from '$lib/content/constants/apis/publicApiCapabilityHubFaqConfig';
import { SHARED_PUBLIC_API_SEO_KEYWORDS } from '$lib/content/constants/apis/shared';
import { buildPublicApiHubHeroTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';

export const publicApiPostingHubPage: PublicApiHubPageViewModel = {
	capability: 'posting',
	heroTitle: buildPublicApiHubHeroTitle('posting'),
	heroDescription:
		'Post across TikTok, Instagram, X, LinkedIn, Facebook, Threads, and YouTube with one API. One POST /api/v1/public/posts call returns a post group id and per-channel rows you can track with the public API, SDK, CLI, or MCP.',
	metaTitle: 'Social Media Posting API',
	metaDescription:
		'Publish to TikTok, Instagram, X, LinkedIn, Facebook, Threads, and YouTube with one OpenQuok POST /public/posts request. Explore platform examples, copy JSON from the Payload Wizard, and connect channels on a paid workspace plan.',
	keywords: [
		...SHARED_PUBLIC_API_SEO_KEYWORDS,
		'unified social media posting API',
		'multi-platform post API',
		'POST /public/posts',
		'social media API for developers'
	],
	hubDescription:
		'One JSON payload publishes to every connected channel — with per-network provider settings and a structured success response.',
	staticExample: PUBLIC_API_POSTING_HUB_STATIC_EXAMPLE,
	...PUBLIC_API_POSTING_HUB_FAQ
};
