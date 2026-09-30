import type { ToolSurfaceChannelMeta } from '$lib/content/constants/channels/tool-surfaces/shared/channelToolSurfaceMeta.types';

export const threadsToolSurfaceMeta: ToolSurfaceChannelMeta = {
	slug: 'threads',
	platformLabel: 'Threads',
	docsPath: '/docs/social-integration/threads',
	bestTime: {
		metaDescription:
			'Industry starting points for Threads: late morning through evening slots in your audience timezone. Free timing test plan — not your personal Threads analytics.',
		hubDescription: 'Morning, lunch, and ~7 PM text-post windows for timing tests.',
		seoIntroHeading: 'Starter windows to test on Threads',
		seoIntroParagraph:
			'Conversation-style windows from aggregate studies — test and refine using your own engagement patterns.',
		highlights: [
			{ title: 'Mornings', subline: '9–11 AM' },
			{ title: 'Midday', subline: '12–2 PM' },
			{ title: 'Evenings', subline: '~7 PM' }
		],
		officialInsightsHref: 'https://www.facebook.com/business/help',
		officialInsightsLabel: 'Meta Business Help (Threads uses Meta accounts)'
	},
	photoEditor: {
		metaDescription:
			'Free Threads photo editor. Export square and portrait post images plus 9:16 vertical assets from Threads presets — PNG download free in the browser.',
		hubDescription: 'Square, portrait, and vertical post image presets.',
		heroLead:
			'Threads post images commonly use square or portrait ratios; vertical 1080×1920 matches full-screen mobile posts.',
		faqTitle: 'What image sizes work on Threads?',
		faqBodyLead:
			'Threads accepts images in feed posts and replies. Use the Threads preset group for export sizes that match typical mobile feed display.'
	},
	skillBuilder: {
		metaDescription:
			'Free Threads skill builder. Recipes for text posts, reply chains, reply-with-image, cross-account comments, and global auto-plugs — export SKILL.md for agents.',
		hubDescription: 'threads.replies, cross-account plugs, and plugs:upsert recipes.',
		heroLead:
			'Pre-loaded Threads posts:create and threads.replies examples plus plugs:upsert for global auto-replies.',
		faqTitle: 'How do I build a Threads agent skill?',
		faqBodyLead:
			'Review pre-loaded CLI payloads on this page, align with Threads publish docs, then export SKILL.md for your agent.'
	}
};
