import { icons } from '$data/icons';

import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/types';
import {
	buildChannelLandingFaqLinks,
	buildChannelMcpSeoKeywords,
	SHARED_CHANNEL_SEO_KEYWORDS
} from '$lib/content/constants/channels/shared';
import {
	buildChannelFreeTrialFaqDescription,
	buildChannelProgrammaticSchedulingFaqDescription,
	buildChannelProgrammaticSchedulingFaqTitle,
	faqHrefDocs,
	faqLink,
	faqLinkSelfHostChannelSetup,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';

const BLUESKY_DOCS_PATH = '/docs/social-integration/bluesky';
const blueskyLinks = buildChannelLandingFaqLinks('bluesky', BLUESKY_DOCS_PATH);

export const blueskyChannel = {
	slug: 'bluesky',
	platformId: 'bluesky',
	platformLabel: 'Bluesky',
	icon: icons.BlueskyGlyph.name,
	heroTitle: 'Schedule Bluesky posts, images, and replies',
	heroDescription:
		'Connect with your handle and an app password. Queue text and media on the calendar. Chain follow-up replies before anything goes live. Approve on the kanban board before OpenQuok publishes.',
	metaTitle: 'Bluesky Post Scheduler — Text, Media, and Replies',
	metaDescription:
		'Schedule Bluesky posts with OpenQuok. Connect with an app password. Queue text, up to four images or one video, and follow-up replies. Publish from the dashboard, public API, or CLI.',
	hubDescription:
		'300-character posts with up to four images or one MP4. Scheduled replies on the same account.',
	keywords: [
		...SHARED_CHANNEL_SEO_KEYWORDS,
		'Bluesky scheduler',
		'schedule Bluesky posts',
		'Bluesky content calendar',
		'Bluesky app password',
		'AT Protocol scheduler',
		'Bluesky follow-up replies',
		'Bluesky image post',
		...buildChannelMcpSeoKeywords('Bluesky')
	],
	featureSections: [
		{
			subtitle: 'Bulk scheduling',
			title: 'Queue Bluesky posts, batch drafts on the calendar, weeks ahead',
			description:
				'Consistency on Bluesky is hard when you write in the moment only. Put posts on the OpenQuok calendar for days or weeks ahead. Review agent and human drafts on the kanban board. Move them to Scheduled when you are ready.',
			bentoId: 'bluesky-bulk-scheduling',
			mediaOnRight: true
		},
		{
			subtitle: 'Media posts',
			title: 'Attach images or one video, preview the feed card, before you schedule',
			description:
				'Compose within the 300-character limit. Attach up to four images or one MP4 — never mixed in one post. Preview letterboxed photos and video in the composer before you queue the slot.',
			bentoId: 'bluesky-media',
			mediaOnRight: false
		},
		{
			subtitle: 'Follow-up replies',
			title: 'Chain Bluesky replies on the same post, set delays, keep the thread',
			description:
				'Add follow-up rows in the composer with delays and optional media. OpenQuok publishes the main post first. Then it posts each reply on your connected account.',
			bentoId: 'bluesky-threads',
			mediaOnRight: true
		}
	],
	audienceSubtitle: 'Built for the open social web',
	audienceTitle: 'Who schedules Bluesky with OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-rose-400',
			title: 'Creators & founders',
			description:
				'Stay visible on Bluesky without living in the app. Batch posts and reply chains from the calendar.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-lime-400',
			title: 'Community managers',
			description:
				'Review agent drafts on kanban. Schedule images, video, and threaded follow-ups in one workflow.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-emerald-400',
			title: 'Developers & agents',
			description:
				'Pipe Bluesky drafts from your backend via the public API, CLI, or MCP. Mention people with @handle autocomplete.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Bluesky scheduling, media, and replies',
	faqDescription:
		'App-password connect, character limits, media rules, follow-up replies, and automation — what OpenQuok supports for Bluesky today.',
	faqItems: [
		{
			title: 'How do I connect Bluesky to OpenQuok?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, open a workspace, and choose Add Channel → Bluesky. Enter your PDS service URL (default https://bsky.social), handle or email, and an app password from Bluesky settings. OpenQuok encrypts those credentials on the server; connect APIs never return them. See the ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide')}. For self-hosted deployments, see the ${faqLinkSelfHostChannelSetup(BLUESKY_DOCS_PATH, 'Bluesky')}.`
		},
		{
			title: 'Do I need to turn off two-factor authentication?',
			description:
				'No. Create an app password in Bluesky settings while two-factor authentication stays on. Paste that password into Add Channel — not your main account password.'
		},
		{
			title: 'What media can I attach to a scheduled Bluesky post?',
			description:
				`Up to four images or one MP4 video per post — not both in the same post. Text-only posts are valid. Alt text comes from media details when you set it. See ${faqLink(faqHrefDocs('platforms/media-rules'), 'media rules by platform')} and the ${faqLink(blueskyLinks.photoEditor.toolChannel, 'Bluesky photo editor')}.`
		},
		{
			title: 'Can I schedule follow-up replies on Bluesky?',
			description:
				`Yes. Add follow-up rows in the composer with delays and optional media. OpenQuok publishes the main post first, then each reply on the same account. See ${faqLink(faqHrefDocs('creating-posts/threads-and-comments'), 'threads and follow-up comments')} and ${faqLink(faqHrefDocs('cli-examples/bluesky'), 'Bluesky CLI examples')}.`
		},
		{
			title: buildChannelProgrammaticSchedulingFaqTitle('Bluesky posts'),
			description: buildChannelProgrammaticSchedulingFaqDescription({
				connectPhrase: 'Connect Bluesky in our web dashboard with an app password',
				cliExamplesHref: faqHrefDocs('cli-examples/bluesky'),
				cliExamplesLabel: 'Bluesky CLI examples',
				suffix: 'Pass follow-up replies in bluesky.replies when you schedule from the API or CLI.'
			})
		},
		{
			title: 'Does OpenQuok show Bluesky analytics?',
			description:
				`Not today. You can schedule and publish Bluesky posts, images, video, and follow-up replies from OpenQuok. Workspace analytics and post statistics do not include Bluesky yet.`
		},
		{
			title: 'Is there a free trial for Bluesky scheduling?',
			description: buildChannelFreeTrialFaqDescription({
				connectPhrase: 'Connect Bluesky in our web dashboard with an app password',
				activityPhrase: 'schedule posts, and explore API access'
			})
		}
	],
	docsPath: BLUESKY_DOCS_PATH,
	available: true
} satisfies PublicChannelLandingPageViewModel;
