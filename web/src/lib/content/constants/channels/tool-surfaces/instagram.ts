import type { ToolSurfaceChannelMeta } from '$lib/content/constants/channels/tool-surfaces/shared/channelToolSurfaceMeta.types';

export const instagramToolSurfaceMeta: ToolSurfaceChannelMeta = {
	slug: 'instagram',
	platformLabel: 'Instagram',
	docsPath: '/docs/social-integration/instagram',
	bestTime: {
		metaDescription:
			'Industry starting points for Instagram: late-morning, lunch, and evening Reels/feed windows in audience local time. Free test plan — pair with Instagram Insights for your real peaks.',
		hubDescription: 'Late morning, lunch, and ~7 PM feed/Reel benchmark slots.',
		seoIntroHeading: 'Starter windows to test on Instagram in 2026',
		seoIntroParagraph:
			'Aggregate feed and Reels timing themes — not pulled from your Instagram Professional dashboard. Run controlled tests, then confirm winners in Insights.',
		highlights: [
			{ title: 'Late mornings', subline: 'Tue–Wed ~10–11 AM' },
			{ title: 'Lunch band', subline: '12–2 PM' },
			{ title: 'Evenings', subline: '~7 PM' }
		],
		officialInsightsHref: 'https://business.facebook.com/business/help/668895484885519',
		officialInsightsLabel: 'Meta — see when your followers are on Instagram'
	},
	photoEditor: {
		metaDescription:
			'Free Instagram photo editor. Export 1:1 feed, 4:5 portrait, 9:16 Story/Reel, landscape, and ad square presets — download PNG or save to your cloud.',
		hubDescription: 'Feed, Story/Reel, carousel, and ad canvas presets.',
		heroLead:
			'Presets include 1080×1080 feed, 1080×1350 portrait feed, 1080×1920 Story/Reel, and landscape feed — common creative sizes for Instagram.',
		faqTitle: 'What image sizes work on Instagram?',
		faqBodyLead:
			'Meta documents aspect ratios for feed posts, Stories, and Reels. OpenQuok’s Instagram preset tab exports matching PNG dimensions from the canvas.'
	},
	skillBuilder: {
		metaDescription:
			'Free Instagram skill builder. Pre-loaded feed post posts:create recipes with provider settings — preview SKILL.md and export for scheduling agents.',
		hubDescription: 'Feed image posts with post_type provider settings.',
		heroLead:
			'Pre-loaded Instagram feed post payloads with media upload and providerSettings — extend with Reels or carousel examples from CLI docs.',
		faqTitle: 'How do I build an Instagram agent skill?',
		faqBodyLead:
			'Start from the feed post recipe on this page, upload media via CLI or MCP, and export SKILL.md. Connect Instagram Business or standalone login in OpenQuok first.'
	}
};
