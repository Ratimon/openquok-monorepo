import type { ToolSurfaceChannelMeta } from '$lib/content/constants/channels/tool-surfaces/shared/channelToolSurfaceMeta.types';

export const tiktokToolSurfaceMeta: ToolSurfaceChannelMeta = {
	slug: 'tiktok',
	platformLabel: 'TikTok',
	docsPath: '/docs/social-integration/tiktok',
	bestTime: {
		metaDescription:
			'Industry starting points for TikTok: morning scroll, lunch, and evening prime (7–9 PM local). Free timing test plan — not TikTok Analytics personal peaks.',
		hubDescription: '7 AM, noon, and evening short-video windows.',
		seoIntroHeading: 'Starter windows to test on TikTok',
		seoIntroParagraph:
			'Short-form surveys often highlight commute, lunch, and evening leisure — test against your Creator Center metrics.',
		highlights: [
			{ title: 'Morning', subline: '~7 AM' },
			{ title: 'Lunch', subline: 'Noon' },
			{ title: 'Evening', subline: '7–9 PM' }
		],
		officialInsightsHref: 'https://www.tiktok.com/creators/creator-portal/en-us/',
		officialInsightsLabel: 'TikTok Creator Portal'
	},
	photoEditor: {
		metaDescription:
			'Free TikTok photo editor. Vertical 9:16, Photo Mode carousel (1:1, 4:5, 2:3), and 16:9 landscape presets — export PNG for carousels and covers.',
		hubDescription: '9:16 video, Photo Mode carousel, and landscape presets.',
		heroLead:
			'TikTok presets: 1080×1920 vertical, 1080×1080 and 1080×1350 photo carousels, plus 1920×1080 landscape — matches Photo Mode and in-feed video exports.',
		faqTitle: 'What sizes work for TikTok photo carousels?',
		faqBodyLead:
			'TikTok Photo Mode supports multiple aspect ratios; vertical 9:16 is primary for video while carousels often use square or portrait stills. Export from the TikTok preset tab on this page.'
	},
	skillBuilder: {
		metaDescription:
			'Free TikTok skill builder. Direct video post recipe with privacy_level and TikTok direct-post settings — export SKILL.md for agents.',
		hubDescription: 'Direct video post with privacy and creator settings.',
		heroLead:
			'Pre-loaded TikTok direct-post video payload — set privacy_level and publish settings, then export SKILL.md.',
		faqTitle: 'How do I build a TikTok agent skill?',
		faqBodyLead:
			'Review the direct video recipe and TikTok CLI examples, complete TikTok OAuth in OpenQuok, and export SKILL.md for your agent host.'
	}
};
