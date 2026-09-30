import type { ToolSurfaceChannelMeta } from '$lib/content/constants/channels/tool-surfaces/shared/channelToolSurfaceMeta.types';

export const linkedinToolSurfaceMeta: ToolSurfaceChannelMeta = {
	slug: 'linkedin',
	platformLabel: 'LinkedIn',
	docsPath: '/docs/social-integration/linkedin',
	bestTime: {
		metaDescription:
			'Industry B2B starting points for LinkedIn: weekday mornings and lunch in audience local time. Free timing test plan — not LinkedIn Page analytics.',
		hubDescription: 'Weekday 8–11 AM and lunch B2B benchmark slots.',
		seoIntroHeading: 'Starter windows to test on LinkedIn',
		seoIntroParagraph:
			'B2B aggregate patterns favor Tue–Thu mid-mornings — validate with your Page or profile analytics.',
		highlights: [
			{ title: 'Mornings', subline: '8–11 AM Tue–Thu' },
			{ title: 'Lunch', subline: '12–1 PM' },
			{ title: 'Weekends', subline: 'Light morning tests only' }
		],
		officialInsightsHref: 'https://www.linkedin.com/help/linkedin/answer/a550555',
		officialInsightsLabel: 'LinkedIn Help — post analytics'
	},
	photoEditor: {
		metaDescription:
			'Free LinkedIn photo editor. Link share 1200×627, square posts, and profile banner presets — export PNG for feed and document posts.',
		hubDescription: 'Link preview, square post, and banner canvas presets.',
		heroLead:
			'Export 1200×627 link images, 1080×1080 square posts, and 1584×396 banners from LinkedIn presets.',
		faqTitle: 'What image sizes work on LinkedIn?',
		faqBodyLead:
			'LinkedIn recommends specific image ratios for link posts and banners. Use the LinkedIn preset group for those export dimensions.'
	},
	skillBuilder: {
		metaDescription:
			'Free LinkedIn skill builder. Text posts and Page global auto-comment plugs:upsert recipes — preview SKILL.md for agents.',
		hubDescription: 'Profile/Page text posts and Page plugs:upsert recipes.',
		heroLead:
			'Pre-loaded LinkedIn text post payloads plus Page-only global auto-comment plugs — export SKILL.md when ready.',
		faqTitle: 'How do I build a LinkedIn agent skill?',
		faqBodyLead:
			'Pick text or plugs recipes, connect LinkedIn or LinkedIn Page in OpenQuok, and export SKILL.md aligned with CLI examples.'
	}
};
