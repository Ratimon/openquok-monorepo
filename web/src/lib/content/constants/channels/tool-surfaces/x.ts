import type { ToolSurfaceChannelMeta } from '$lib/content/constants/channels/tool-surfaces/shared/channelToolSurfaceMeta.types';

export const xToolSurfaceMeta: ToolSurfaceChannelMeta = {
	slug: 'x',
	platformLabel: 'X',
	docsPath: '/docs/social-integration/x',
	bestTime: {
		metaDescription:
			'Industry starting points for X: morning, lunch, and late-afternoon conversation windows in audience local time. Free timing test plan — not X Analytics peaks.',
		hubDescription: 'Morning, lunch, and ~5 PM post windows for timing tests.',
		seoIntroHeading: 'Starter windows to test on X',
		seoIntroParagraph:
			'News and conversation feeds often spike during commute and lunch — test against your own impression analytics.',
		highlights: [
			{ title: 'Mornings', subline: '9–10 AM' },
			{ title: 'Midday', subline: '12–1 PM' },
			{ title: 'Afternoons', subline: '~5 PM' }
		],
		officialInsightsHref: 'https://help.x.com/en/using-x/analytics',
		officialInsightsLabel: 'X Help — analytics'
	},
	photoEditor: {
		metaDescription:
			'Free X photo editor. Post images at 16:9, 1:1, and header banner presets — export PNG for posts and profile assets.',
		hubDescription: 'Post 16:9, square, and header banner presets.',
		heroLead:
			'Presets include 1600×900 and 1200×675 post images, 1080×1080 square, and 1500×500 header exports.',
		faqTitle: 'What image sizes work on X?',
		faqBodyLead:
			'X displays multiple aspect ratios in the timeline. Use the X preset tab for common post and header export sizes.'
	},
	skillBuilder: {
		metaDescription:
			'Free X skill builder. Text posts, reply chains, cross-account reposts, and global plugs — export SKILL.md for agents.',
		hubDescription: 'x.replies, cross-account reposts, and plugs:upsert recipes.',
		heroLead:
			'Pre-loaded X posts:create and x.replies payloads plus plugs:upsert for auto-repost and auto-reply rules.',
		faqTitle: 'How do I build an X agent skill?',
		faqBodyLead:
			'Review recipes on this page, connect X OAuth in OpenQuok, and export SKILL.md matching CLI examples.'
	}
};
