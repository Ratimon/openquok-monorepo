import type { ToolSurfaceChannelMeta } from '$lib/content/constants/channels/tool-surfaces/shared/channelToolSurfaceMeta.types';

export const youtubeToolSurfaceMeta: ToolSurfaceChannelMeta = {
	slug: 'youtube',
	platformLabel: 'YouTube',
	docsPath: '/docs/social-integration/youtube',
	bestTime: {
		metaDescription:
			'Industry starting points for YouTube publishes: afternoon and evening audience-local windows. Free timing test plan for uploads — not YouTube Studio realtime data.',
		hubDescription: 'Afternoon and evening publish windows for long-form and Shorts tests.',
		seoIntroHeading: 'Starter publish windows to test on YouTube',
		seoIntroParagraph:
			'Typical viewing peaks vary by niche and geography. Use these slots as experiments, then read retention and traffic sources in YouTube Studio.',
		highlights: [
			{ title: 'Afternoons', subline: '2–5 PM' },
			{ title: 'Prime time', subline: '~8 PM' },
			{ title: 'Weekends', subline: 'Late morning tests' }
		],
		officialInsightsHref: 'https://support.google.com/youtube/answer/9002587',
		officialInsightsLabel: 'YouTube Help — understand Analytics reports'
	},
	photoEditor: {
		metaDescription:
			'Free YouTube photo editor. Thumbnail (1280×720), Shorts vertical, channel art, and 16:9 video frame presets — export PNG in the browser.',
		hubDescription: 'Thumbnail, Shorts 9:16, channel art, and HD frame presets.',
		heroLead:
			'Export 1280×720 thumbnails, 1080×1920 Shorts frames, and 1920×1080 HD stills from the YouTube preset group.',
		faqTitle: 'What image sizes work for YouTube thumbnails?',
		faqBodyLead:
			'YouTube recommends 1280×720 thumbnails with a 16:9 aspect ratio. The YouTube preset tab targets that export size plus Shorts and channel art formats.'
	},
	skillBuilder: {
		metaDescription:
			'Free YouTube skill builder. Video upload posts:create recipe with title, privacy, and media — preview SKILL.md for agent scheduling.',
		hubDescription: 'Video upload recipe with title and privacy settings.',
		heroLead:
			'Pre-loaded YouTube upload payload — attach video media, set title and privacy_level, then export SKILL.md for your agent.',
		faqTitle: 'How do I build a YouTube agent skill?',
		faqBodyLead:
			'Use the video upload recipe, align fields with YouTube CLI examples, connect Google OAuth in OpenQuok, and export SKILL.md.'
	}
};
