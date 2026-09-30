import { BENCHMARK_SLOTS_LAST_REVIEWED } from '$lib/best-time-to-post/constants/benchmarkSlots';
import { BENCHMARK_SLOTS_SOURCE_HREF } from '$lib/best-time-to-post/constants/benchmarkSlotsPublicSource';
import type { ToolSurfaceChannelMeta } from '$lib/content/constants/channels/tool-surfaces/shared/channelToolSurfaceMeta.types';
import { faqLink } from '$lib/content/utils/publicFaqLinks';

const benchmarkSourceLink = faqLink(
	BENCHMARK_SLOTS_SOURCE_HREF,
	'benchmarkSlots.ts on GitHub'
);

export const blueskyToolSurfaceMeta: ToolSurfaceChannelMeta = {
	slug: 'bluesky',
	platformLabel: 'Bluesky',
	docsPath: '/docs/social-integration/bluesky',
	bestTime: {
		metaDescription:
			'Industry starting points for Bluesky: Tue–Wed 9–11 AM, weekday evenings around 6–8 PM, and Saturday near 5 PM in your audience timezone. Generate a free timing test plan with our calculator — not a personal peak-hour prediction.',
		hubDescription: 'Weekday 9 AM, noon, and 6 PM windows plus weekend evening slots for timing tests.',
		seoIntroHeading: 'Starter windows to test in 2026',
		seoIntroParagraph:
			'These hours come from public timing research that OpenQuok editors summarized — not from your Bluesky account. The same table lives in our open-source app code (see the FAQ below). Test for one to two weeks, then keep what works.',
		highlights: [
			{ title: 'Weekday mornings', subline: 'Tue–Wed 9–11 AM' },
			{ title: 'Evenings', subline: 'About 6–8 PM' },
			{ title: 'Weekend', subline: 'Saturday ~5 PM' }
		]
	},
	extraBestTimeFaqItems: [
		{
			title: 'What does the internet say is the best time to post on Bluesky?',
			description:
				'Bluesky does not publish an official “best hour.” Third-party timing guides (2025–2026) often overlap on weekday mornings (about 9–11 AM audience local time), a lunch band (about noon–2 PM), and evenings (about 6–8 PM). Tuesday and Wednesday show up often. Weekend advice varies a lot — some guides favor late morning, others favor Saturday evening. OpenQuok’s table follows those themes; it is a starting plan, not a ranking from Bluesky.'
		},
		{
			title: 'How does the Bluesky feed work — does timing matter?',
			description:
				`Your Following tab is mostly chronological: newer posts from people you follow appear first, so posting when followers are online helps before the feed scrolls on. Bluesky also offers Discover and other ${faqLink('https://docs.bsky.app/docs/starter-templates/custom-feeds', 'custom feeds')} — each can rank posts differently, and users can swap feeds. There is no public rule that says “post at 9 AM to beat the algorithm.” Early replies and reposts still help visibility in any feed. See ${faqLink('https://docs.bsky.app/docs/tutorials/viewing-feeds', 'Bluesky’s feed docs')} for how timelines and custom feeds work.`
		},
		{
			title: 'How did OpenQuok choose these Bluesky times?',
			description:
				`We do not download data from Bluesky and we do not read your account on this page. Our team reviewed public social-timing reports (about 2025–2026) and picked common Bluesky patterns: weekday morning, lunch, and early evening in the audience’s local time. We entered those hours into a fixed timetable in our product (last reviewed ${BENCHMARK_SLOTS_LAST_REVIEWED}). The calculator and the table above read that file. Surveys disagree on weekends — treat every row as a test. You can audit the exact hours in ${benchmarkSourceLink}.`
		}
	],
	photoEditor: {
		metaDescription:
			'Free Bluesky photo editor in your browser. Export 1:1, 4:5, and 16:9 PNGs (1080×1080, 1080×1350, and 1200×675) from the Bluesky preset tab — download free, or save to your cloud when signed in. No sign up required.',
		hubDescription: '1:1, 4:5, and 16:9 canvas presets (common ratios — Bluesky has no fixed size requirement).',
		heroLead:
			'Canvas presets pre-selected: 1080×1080 (1:1), 1080×1350 (4:5), and 1200×675 (16:9). Bluesky accepts many aspect ratios; these match OpenQuok’s export defaults.',
		faqTitle: 'What image sizes work on Bluesky?',
		faqBodyLead:
			'Bluesky does not publish required pixel dimensions — posts can use varied aspect ratios (up to four images or one MP4 per post). OpenQuok’s photo editor exports 1080×1080, 1080×1350, and 1200×675 when you pick the matching presets on this page.'
	},
	skillBuilder: {
		metaDescription:
			'Free Bluesky skill builder in your browser. Compose posts:create recipes with pre-loaded openquok CLI steps, preview SKILL.md, and export for your agent — text posts, up to four images per post, and follow-up replies. No sign up required.',
		hubDescription: 'SKILL.md export with posts:create, multi-image posts, and reply recipes.',
		heroLead:
			'Pre-loaded Bluesky posts:create recipes — text posts, up to four images on one post, and follow-up replies. Preview SKILL.md and export for your agent, or open Bluesky CLI examples from the link below.',
		faqTitle: 'How do I build a Bluesky agent skill?',
		faqBodyLead:
			'Open this Bluesky Skill Builder page. Review the pre-loaded posts:create steps for text, images, and bluesky.replies. Preview SKILL.md, edit frontmatter and steps, then download the file for your agent host.'
	}
};
