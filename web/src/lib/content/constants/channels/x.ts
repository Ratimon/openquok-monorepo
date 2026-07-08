import { icons } from '$data/icons';

import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/types';
import { SHARED_CHANNEL_SEO_KEYWORDS } from '$lib/content/constants/channels/shared';

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
		'X API scheduler'
	],
	featureSections: [
		{
			subtitle: 'Bulk scheduling',
			title: 'Queue X posts, batch drafts on the calendar, weeks ahead',
			description:
				'Schedule tweets and media onto the calendar for days or weeks ahead. Review agent and human drafts on the kanban board, then move them to Scheduled when you are ready to publish.',
			bentoId: 'x-bulk-scheduling',
			mediaOnRight: true
		},
		{
			subtitle: 'Thread momentum',
			title: 'Set who can reply, queue thread replies, widen reach with plugs',
			description:
				'A strong tweet deserves a conversation — not another tab open on X. Set reply rules and disclosure labels when you schedule, queue timed thread replies before the post goes live, and use internal plugs so your other connected X accounts repost automatically and more followers see the thread.',
			bentoId: 'x-compose-settings',
			mediaOnRight: false
		},
		{
			subtitle: 'Insights',
			title: 'See what resonates on X, track impressions and engagement, and iterate',
			description:
				'Track likes, replies, reposts, quotes, and impressions from connected X profiles inside OpenQuok analytics — so you can schedule more of what already works.',
			bentoId: 'x-insights',
			mediaOnRight: true
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
				'Stay visible on X without living in the app. Queue tweets, images, and thread chains on the calendar while you ship product.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-lime-400',
			title: 'Social managers',
			description:
				'Batch a week of posts in one sitting, control reply settings per tweet, and track engagement alongside your other channels.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-emerald-400',
			title: 'Developers & agents',
			description:
				'Pipe X drafts from your backend via the public API or CLI — including thread replies under providerSettings — while you keep approval control in the dashboard.',
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
				'After your workspace admin configures an X developer app and backend API keys (see the setup guide), open a workspace, choose Connect channel → X, and complete OAuth in the browser. OpenQuok stores the connection for scheduling and analytics.'
		},
		{
			title: 'Can I schedule X posts with images or video?',
			description:
				'Yes. Attach up to four images or one video when composing an X post in OpenQuok. The post editpr validates media rules before publish — one video or up to four images per tweet, not both.'
		},
		{
			title: 'Does OpenQuok respect X character limits?',
			description:
				'Yes. The post editor uses weighted character counting (280 for standard accounts, 4000 when Verified is enabled on the channel). Check the preview before scheduling.'
		},
		{
			title: 'Which X settings can I control before publishing?',
			description:
				'For each scheduled tweet you can choose who can reply (everyone, followers, mentioned accounts, subscribers, or verified users), post into an X community by URL, and flag Made with AI or Paid partnership. Set these in the composer or pass x.whoCanReplyPost, x.communityUrl, and label flags via the API.'
		},
		{
			title: 'Can I schedule thread replies in advance?',
			description:
				'Yes. Add follow-up replies in the composer (or pass x.replies via the API or CLI). Each reply publishes as a quote-less reply after the delay you set once the root tweet goes live.'
		},
		{
			title: 'Can I cross-post from X to other channels?',
			description:
				'Yes. Compose once in OpenQuok and publish tailored versions to X, Threads, LinkedIn, Instagram, and other connected channels from one workflow. Per-platform captions, media rules, and character limits apply separately for each destination.'
		},
		{
			title: 'Can OpenQuok auto-repost or plug high-performing X posts?',
			description:
				'Yes. X channels support auto-repost and auto-plug: when a tweet hits a like threshold you set, OpenQuok can repost it or reply with a promo message (up to three times every six hours). You can also pick other connected X accounts to repost after publish. Configure plugs on the channel; recurring schedule slots help recycle evergreen tweets on a cadence.'
		},
		{
			title: 'What X analytics does OpenQuok track?',
			description:
				'OpenQuok pulls per-tweet metrics from the X API — impressions, likes, replies, reposts, quotes, and bookmarks — and aggregates account-level analytics for connected profiles. Per-post metrics appear once the post row is linked to a published tweet id.'
		},
		{
			title: 'Can I schedule X from the API, CLI, or an AI agent?',
			description:
				'Yes. After connecting X, use the public API or openquok CLI with integration UUIDs from your workspace. Thread replies and compose settings go under providerSettingsByIntegrationId when needed. Agents can draft and queue posts; keep human approval in the dashboard when content represents your brand.'
		},
		{
			title: 'Is X scheduling included in the free trial?',
			description:
				'Yes. New workspaces get a 7-day free trial — connect X, schedule posts, and explore API access before choosing a paid plan that matches your channel and workspace limits.'
		}
	],
	docsPath: '/docs/social-integration/x',
	available: true
} satisfies PublicChannelLandingPageViewModel;
