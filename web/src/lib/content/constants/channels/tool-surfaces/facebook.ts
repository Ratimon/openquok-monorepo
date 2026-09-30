import type { ToolSurfaceChannelMeta } from '$lib/content/constants/channels/tool-surfaces/shared/channelToolSurfaceMeta.types';

export const facebookToolSurfaceMeta: ToolSurfaceChannelMeta = {
	slug: 'facebook',
	platformLabel: 'Facebook',
	docsPath: '/docs/social-integration/facebook',
	bestTime: {
		metaDescription:
			'Industry starting points for Facebook Pages: late morning, lunch, and early-evening slots in your audience timezone. Generate a free timing test plan — not personal peak hours from Meta Insights.',
		hubDescription: 'Late-morning, lunch, and ~7 PM windows for Page post timing tests.',
		seoIntroHeading: 'Starter windows to test on Facebook',
		seoIntroParagraph:
			'Typical Page feed windows from public timing research — not pulled from your Meta Insights. Test for one to two weeks, then compare with when your followers are online in Meta Business Suite.',
		highlights: [
			{ title: 'Weekdays', subline: '9–11 AM and ~1 PM' },
			{ title: 'Evenings', subline: 'Around 7 PM' },
			{ title: 'Weekend', subline: 'Late morning + evening' }
		],
		officialInsightsHref: 'https://www.facebook.com/business/help/898752960195806',
		officialInsightsLabel: 'Meta Business Help — when your audience is online'
	},
	photoEditor: {
		metaDescription:
			'Free Facebook photo editor in your browser. Export feed landscape (1200×630), square posts, Stories (9:16), and cover sizes from the Facebook preset tab — download PNG free or save when signed in.',
		hubDescription: 'Feed landscape, square, Story, and Page cover canvas presets.',
		heroLead:
			'Canvas presets include 1200×630 link previews, 1080×1080 square feed, 1080×1920 Stories, and 851×315 cover — aligned with common Meta creative guidance.',
		faqTitle: 'What image sizes work on Facebook?',
		faqBodyLead:
			'Meta publishes recommended dimensions for feed images, Stories, and cover photos. OpenQuok’s photo editor maps those to export presets on this page.'
	},
	skillBuilder: {
		metaDescription:
			'Free Facebook skill builder. Pre-loaded posts:create recipes for Page text, link previews, multi-photo posts, Reels, and follow-up comments — preview SKILL.md and export for your agent.',
		hubDescription: 'SKILL.md with Page posts, carousels, Reels, and facebook.replies recipes.',
		heroLead:
			'Pre-loaded Facebook Page recipes — text, link cards, multi-photo posts, MP4 Reels, and follow-up comments. Match command shapes to our CLI examples, then export SKILL.md for your agent.',
		faqTitle: 'How do I build a Facebook Page agent skill?',
		faqBodyLead:
			'Open this Skill Builder page, review posts:create and facebook.replies steps, preview SKILL.md, and download for your agent host.'
	}
};
