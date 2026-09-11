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

const X_DOCS_PATH = '/docs/social-integration/x';
const xLinks = buildChannelLandingFaqLinks('x', X_DOCS_PATH);

export const xChannel = {
	slug: 'x',
	platformId: 'x',
	platformLabel: 'X',
	icon: icons.X.name,
	heroTitle: 'Schedule X tweets and media you approve before they go live',
	heroDescription:
		'Connect an X profile with OAuth, queue tweets and thread replies on the calendar, tune who can reply and community settings per post, and publish from the dashboard, public API, or CLI.',
	metaTitle: 'X Post Scheduler',
	metaDescription:
		'Schedule X posts with OpenQuok. Connect X with OAuth, queue text and media, chain thread replies, and publish from the dashboard, API, or CLI.',
	hubDescription:
		'Weighted 280-character tweets (4000 for Verified), up to four images or one video, and scheduled thread replies.',
	keywords: [
		...SHARED_CHANNEL_SEO_KEYWORDS,
		'X post scheduler',
		'Twitter scheduler',
		'schedule X posts',
		'X content calendar',
		'X thread scheduler',
		'X API scheduler',
		...buildChannelMcpSeoKeywords('X')
	],
	featureSections: [
		{
			subtitle: 'Bulk scheduling',
			title: 'Schedule X posts, batch drafts on the calendar, weeks ahead',
			description:
				'Schedule tweets and media onto the calendar for days or weeks ahead. Review agent and human drafts on the kanban board, then move them to Scheduled when you are ready to publish.',
			bentoId: 'x-bulk-scheduling',
			mediaOnRight: true
		},
		{
			subtitle: 'Post editor',
			title: 'Schedule thread replies on X, keep the conversation, on schedule',
			description:
				'A strong tweet deserves a conversation — not another tab open on X. Add follow-up replies in the composer with delays, preview text and media before you schedule, and chain the full thread from one draft.',
			bentoId: 'x-post-editor',
			mediaOnRight: false
		},
		{
			subtitle: 'Reply rules & Cross-posting',
			title: 'Set reply rules per tweet, close threads with a finisher, repost from other profiles',
			description:
				'In custom mode, open the Settings accordion. Choose who can reply, enable Thread finisher for a closing line after your replies, and turn on Add re-posters to pick other connected profiles and a delay. OpenQuok publishes the main thread first, then reposts from each account.',
			bentoId: 'x-settings',
			mediaOnRight: true
		},
		{
			subtitle: 'Insights',
			title: 'See what resonates on X, track impressions and engagement, and iterate',
			description:
				'Track likes, replies, reposts, quotes, and impressions from connected X profiles inside OpenQuok analytics — so you can schedule more of what already works.',
			bentoId: 'x-insights',
			mediaOnRight: false
		}
	],
	audienceSubtitle: 'Built for X',
	audienceTitle: 'Who schedules X with OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-rose-400',
			title: 'Creators & founders',
			description:
				'Stay visible on X without living in the app. Ask your agent to schedule tweets and threads while you ship product.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-lime-400',
			title: 'Social managers',
			description:
				'Batch a week of X posts, control reply settings per tweet, and track engagement with your other channels.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-emerald-400',
			title: 'Developers & agents',
			description:
				'Pipe X drafts from your backend via the public API, CLI, or MCP. Configure thread replies and reply settings per post.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'X scheduling, answered',
	faqDescription: 'Setup, scheduling, media, threads, and automation questions for X on OpenQuok.',
	faqItems: [
		{
			title: 'How do I connect X to OpenQuok?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, open a workspace, and choose Connect channel → X. Complete OAuth in the browser and OpenQuok stores the connection for scheduling and analytics. OpenQuok Cloud registers the X app for you. For self-hosted deployments, see the ${faqLinkSelfHostChannelSetup(X_DOCS_PATH, 'X')}.`
		},
		{
			title: 'Can I schedule X posts with images or video?',
			description:
				'Yes. Attach up to four images or one video when composing an X post in OpenQuok. The post editpr validates media rules before publish — one video or up to four images per tweet, not both.'
		},
		{
			title: 'Does OpenQuok respect X character limits?',
			description:
				`Yes. The post editor uses weighted character counting (280 for standard accounts, 4000 when Verified is enabled on the channel). Check the preview before scheduling. Tighten copy in the ${faqLink(xLinks.humanizer.toolChannel, 'X humanizer tool')} when you cross-post from longer networks.`
		},
		{
			title: 'Which X settings can I control before publishing?',
			description:
				'For each scheduled tweet you can choose who can reply (everyone, followers, mentioned accounts, subscribers, or verified users), post into an X community by URL, and flag Made with AI or Paid partnership. Set these in the composer or pass x.whoCanReplyPost, x.communityUrl, and label flags via the API.'
		},
		{
			title: 'Can I schedule thread replies in advance?',
			description:
				`Yes. Add follow-up replies in the composer (or pass x.replies via the API or CLI). Each reply publishes as a quote-less reply after the delay you set once the root tweet goes live. See ${faqLink(publicFaqHref.cliX, 'X CLI examples')}.`
		},
		{
			title: 'Can another X account repost my scheduled post?',
			description:
				`Yes. Open channel Settings on the publishing X account, enable Add re-posters, select other connected X profiles in your workspace, and set a delay. OpenQuok publishes the root tweet first, then reposts from each acting account. X cross-account plugs repost — they do not post reply comments from another account. See ${faqLink(faqHrefDocs('automations/cross-account-plugs'), 'Cross-account plugs')} or ${faqLink(publicFaqHref.cliX, 'X CLI examples')} for crossAccountPlugs.`
		},
		{
			title: 'Can I cross-post from X to other channels?',
			description:
				`Yes. Compose once in OpenQuok and publish tailored versions to X, Threads, LinkedIn, Instagram, and other connected channels from one workflow. Per-platform captions, media rules, and character limits apply separately for each destination. Browse ${faqLink(publicFaqHref.channels, 'Supported channels')}.`
		},
		{
			title: 'Can OpenQuok auto-repost or plug high-performing X posts?',
			description:
				'Yes. Open channel Plugs and set a like threshold. Choose auto-repost or auto-plug with your promo reply text. OpenQuok checks published tweets automatically and reposts or replies when likes reach your threshold. You can also pick other connected X accounts to repost right after publish. Use recurring schedule slots to recycle evergreen tweets.'
		},
		{
			title: 'What X analytics does OpenQuok track?',
			description:
				`OpenQuok pulls per-tweet metrics from the X API — impressions, likes, replies, reposts, quotes, and bookmarks — and aggregates account-level analytics for connected profiles. Per-post metrics appear once the post row is linked to a published tweet id. Use the ${faqLink(publicFaqHref.cliAnalytics, 'analytics CLI')} or workspace dashboard.`
		},
		{
			title: buildChannelProgrammaticSchedulingFaqTitle('X posts'),
			description: buildChannelProgrammaticSchedulingFaqDescription({
				connectPhrase: 'Connect X in our web dashboard',
				cliExamplesHref: publicFaqHref.cliX,
				cliExamplesLabel: 'X CLI examples',
				suffix:
					'Thread replies and X-specific settings can also be configured by asking agent in chat.'
			})
		},
		{
			title: 'Is X scheduling included in the free trial?',
			description: buildChannelFreeTrialFaqDescription({
				connectPhrase: 'Connect X in our web dashboard'
			})
		}
	],
	docsPath: X_DOCS_PATH,
	available: true
} satisfies PublicChannelLandingPageViewModel;
