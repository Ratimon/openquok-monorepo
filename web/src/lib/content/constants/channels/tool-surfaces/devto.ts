import type { ToolSurfaceChannelMeta } from '$lib/content/constants/channels/tool-surfaces/shared/channelToolSurfaceMeta.types';

export const devtoToolSurfaceMeta: ToolSurfaceChannelMeta = {
	slug: 'devto',
	platformLabel: 'Dev.to',
	docsPath: '/docs/social-integration/devto',
	bestTime: {
		metaDescription:
			'Industry starting points for Dev.to: weekday morning, lunch, and early-evening publishes in audience local time. Free timing test plan for article drops.',
		hubDescription: 'Weekday 9 AM, noon, and ~5 PM article publish windows.',
		seoIntroHeading: 'Starter publish windows for Dev.to',
		seoIntroParagraph:
			'Developer communities often read during workday breaks — test against your article stats on DEV.',
		highlights: [
			{ title: 'Mornings', subline: '9 AM weekdays' },
			{ title: 'Lunch', subline: '12 PM' },
			{ title: 'Evenings', subline: '~5 PM' }
		],
		officialInsightsHref: 'https://dev.to/dashboard',
		officialInsightsLabel: 'DEV dashboard — article stats'
	},
	photoEditor: {
		metaDescription:
			'Free Dev.to cover image editor. Export 1000×420 article covers from the Dev.to preset — PNG download in the browser.',
		hubDescription: '1000×420 article cover preset.',
		heroLead: 'Dev.to cover preset exports 1000×420 PNG — the standard cover ratio on DEV.',
		faqTitle: 'What size is a Dev.to cover image?',
		faqBodyLead:
			'Dev.to article covers use a 1000×420 canvas. The Dev.to preset tab exports that size from the photo editor on this page.'
	},
	skillBuilder: {
		metaDescription:
			'Free Dev.to skill builder. Article recipes with title, tags, series, canonical URL, and organization cover — export SKILL.md for agents.',
		hubDescription: 'Markdown articles with tags, series, and canonical syndication.',
		heroLead:
			'Pre-loaded Dev.to article payloads — title, tags, series, canonical URL, and organization posts with cover images.',
		faqTitle: 'How do I build a Dev.to agent skill?',
		faqBodyLead:
			'Use article recipes on this page, add your DEV API key in OpenQuok, and export SKILL.md aligned with Dev.to CLI examples.'
	}
};
