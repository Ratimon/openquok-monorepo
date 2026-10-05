import { icons } from '$data/icons';

import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/catalog/types';
import {
	buildChannelLandingFaqLinks,
	buildChannelMcpSeoKeywords,
	SHARED_CHANNEL_SEO_KEYWORDS
} from '$lib/content/constants/channels/catalog/shared';
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
	heroTitle: 'Schedule Bluesky posts, links, media, and replies',
	heroDescription:
		'Connect Bluesky with an app password. Schedule posts and media on your calendar. @mentions and links in your caption work when the post goes live. Turn on link previews in post Settings for text-only posts. Add follow-up replies and approve each post before it publishes.',
	metaTitle: 'Bluesky Post Scheduler — Text, Media, Links, and Replies',
	metaDescription:
		'Schedule Bluesky posts with OpenQuok. App-password connect (custom PDS supported). Queue 300-grapheme text, optional link cards and quotes, @mentions, up to four images or one MP4 (300 MB, 10 min), follow-up replies, and analytics. Dashboard, public API, CLI, or MCP.',
	hubDescription:
		'300-grapheme posts with @mentions, optional link cards, and up to four images or one MP4. Same-account reply chains and workspace analytics.',
	keywords: [
		...SHARED_CHANNEL_SEO_KEYWORDS,
		'Bluesky scheduler',
		'schedule Bluesky posts',
		'Bluesky content calendar',
		'Bluesky app password',
		'AT Protocol scheduler',
		'Bluesky follow-up replies',
		'Bluesky image post',
		'Bluesky link preview',
		'Bluesky mentions',
		'Bluesky custom PDS',
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
			subtitle: 'Compose & links',
			title: 'Write 300 graphemes, add @mentions, optional link cards, preview before you queue',
			description:
				'Stay inside the 300-grapheme limit. URLs in the caption become clickable facets; add an optional link-card embed in Settings when the post has no media. Use @handle autocomplete. Attach up to four images or one MP4 — never mixed. Preview letterboxed media before you queue the slot.',
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
		},
		{
			subtitle: 'Insights',
			title: 'See what resonates on Bluesky, track likes and reposts, and iterate',
			description:
				'Bluesky analytics — Trends summary totals and per-post likes, replies, reposts, and quotes from the public App View feed (7, 30, or 90 days). Then schedule more of what already works.',
			bentoId: 'bluesky-insights',
			mediaOnRight: false
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
			title: 'Team & Social managers',
			description:
				'Review drafts on kanban as a team. Schedule link posts, images, video, and threaded follow-ups in one workflow.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.Code.name,
			iconClass: 'text-emerald-400',
			title: 'Developers',
			description:
				'Pipe Bluesky drafts from your backend via the public API or CLI. Mention people with @handle autocomplete.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.Rocket.name,
			iconClass: 'text-violet-400',
			title: 'Agent operators',
			description:
				'Schedule Bluesky posts and reply chains from your agent through MCP. Review drafts on kanban before publish.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	audienceTailoredCard: {
		iconName: icons.Globe.name,
		iconClass: 'text-sky-400',
		title: 'Federated & custom-PDS users',
		description:
			'Stay on bsky.social or run your own PDS. OpenQuok resolves your service URL at connect and schedules through your home server with an app password — not your main account password.',
		containerClass: 'h-full min-h-[18rem]'
	},
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Bluesky scheduling, media, and replies',
	faqDescription:
		'App-password connect, PDS service URL, character limits, links and mentions, media rules, follow-up replies, and automation — what OpenQuok supports for Bluesky today.',
	faqItems: [
		{
			title: 'How do I connect Bluesky to OpenQuok?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, open a workspace, and choose Add Channel → Bluesky. Enter your PDS service URL (default https://bsky.social for most accounts), handle or email, and an app password from Bluesky settings. OpenQuok encrypts those credentials on the server; connect APIs never return them. See the ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide')}. For self-hosted deployments, see the ${faqLinkSelfHostChannelSetup(BLUESKY_DOCS_PATH, 'Bluesky')}.`
		},
		{
			title: 'Do links and @mentions work in scheduled Bluesky posts?',
			description:
				`Yes. URLs in your caption become rich-text facets (clickable links) at publish. For a large preview card, set <strong>Link card URL</strong> in composer Settings on a text-only post — not combined with images, video, or a quote post. Type @handle in the composer and pick a match from autocomplete; facets apply on the main post and on follow-up reply rows.`
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
				`Yes. Open workspace ${faqLink(faqHrefDocs('insights/workspace-analytics'), 'Analytics')} to see likes, replies, reposts, and quotes summed by day for your connected account. Open ${faqLink(faqHrefDocs('insights/per-post-metrics'), 'Statistics')} on a published post for per-post engagement from the public App View API.`
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
