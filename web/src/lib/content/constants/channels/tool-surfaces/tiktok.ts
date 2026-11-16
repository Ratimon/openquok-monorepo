import type { ToolSurfaceChannelMeta } from '$lib/content/constants/channels/tool-surfaces/shared/channelToolSurfaceMeta.types';
import {
	buildChannelFaqLinks,
	buildToolChannelFaqLinks,
	faqLink,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';

const TIKTOK_DOCS_PATH = '/docs/social-integration/tiktok';
const tiktokChannelLinks = buildChannelFaqLinks('tiktok', TIKTOK_DOCS_PATH);
const tiktokPhotoEditorLinks = buildToolChannelFaqLinks('photo-editor', 'tiktok');
const tiktokHumanizerLinks = buildToolChannelFaqLinks('humanizer', 'tiktok');

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
		seoIntroHeading: 'Free TikTok photo editor for carousels and cover art',
		seoIntroParagraph:
			'Design Photo Mode carousel frames and vertical cover images without leaving the browser. TikTok presets include 9:16 video, square and portrait stills, and landscape exports — download PNG free.',
		seoIntroHighlights: [
			{ title: 'Vertical', subline: '9:16 · 1080×1920' },
			{ title: 'Carousel', subline: '1:1 and 4:5 stills' },
			{ title: 'Landscape', subline: '16:9 cover' }
		],
		seoIntroClosingHtml: `Polish captions in the ${faqLink(tiktokHumanizerLinks.toolChannel, 'TikTok Humanizer')}, then ${faqLink(publicFaqHref.signUp, 'sign up')} to queue carousels and video on ${faqLink(tiktokChannelLinks.channelLanding, 'TikTok in OpenQuok')}.`,
		extraFaqItems: [
			{
				title: 'Is there a free TikTok photo editor?',
				description: `Yes. This ${faqLink(tiktokPhotoEditorLinks.toolChannel, 'TikTok photo editor')} exports carousel stills and vertical cover PNGs from Photo Mode presets — no sign up to download. Rewrite captions on the ${faqLink(tiktokHumanizerLinks.toolChannel, 'TikTok Humanizer')}, then schedule from ${faqLink(tiktokChannelLinks.channelLanding, 'TikTok in OpenQuok')}.`
			}
		],
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
