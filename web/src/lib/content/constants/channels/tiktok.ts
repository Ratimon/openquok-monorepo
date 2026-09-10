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
	faqLink,
	faqLinkSelfHostChannelSetup,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';

const TIKTOK_DOCS_PATH = '/docs/social-integration/tiktok';
const tiktokLinks = buildChannelLandingFaqLinks('tiktok', TIKTOK_DOCS_PATH);

export const tiktokChannel = {
	slug: 'tiktok',
	platformId: 'tiktok',
	platformLabel: 'TikTok',
	icon: icons.TikTok.name,
	heroTitle: 'Schedule TikTok videos and carousels you approve',
	heroDescription:
		'Connect a TikTok account, schedule vertical videos or image carousels on the calendar, set privacy and posting method, and publish through the official TikTok APIs — from the dashboard, public API, or CLI.',
	metaTitle: 'TikTok Video & Photo Scheduler',
	metaDescription:
		'Schedule TikTok videos and photo carousels with OpenQuok. Connect your account, queue MP4 or image posts with privacy and interaction settings, and publish from one workspace.',
	hubDescription:
		'Vertical video and photo carousels — direct publish or queue to your TikTok inbox to add trending audio.',
	keywords: [
		...SHARED_CHANNEL_SEO_KEYWORDS,
		'TikTok post scheduler',
		'schedule TikTok videos',
		'TikTok content calendar',
		'TikTok API scheduler',
		'TikTok photo carousel scheduler',
		'schedule TikTok posts',
		...buildChannelMcpSeoKeywords('TikTok')
	],
	featureSections: [
		{
			subtitle: 'Bulk scheduling',
			title: 'Queue TikTok clips and carousels, batch drafts on the calendar, weeks ahead',
			description:
				'Schedule viral videos and photo carousels onto the calendar for days or weeks ahead. Review agent and human drafts on the kanban board, then move them to Scheduled when you are ready to publish.',
			bentoId: 'tiktok-bulk-scheduling',
			mediaOnRight: true
		},
		{
			subtitle: 'Post editor',
			title: 'Schedule vertical videos and photo carousels, review before publish, from one draft',
			description:
				'Attach a single MP4 or one or more images for a carousel, write your caption, and schedule onto the calendar. Review agent and human drafts on the kanban board before TikTok publishes from your connected account.',
			bentoId: 'tiktok-post-editor',
			mediaOnRight: false
		},
		{
			subtitle: 'TikTok settings',
			title: 'Set privacy, inbox upload to manually select trending audio, and AI Labeling',
			description:
				'Set privacy, comments, duet, and stitch before you schedule. Dont act like bot by useing inbox upload to queue carousels and clips then pick trending audio in the TikTok app. Flag AI-generated content so TikTok applies the right label and encourages good visibility.',
			bentoId: 'tiktok-settings',
			mediaOnRight: true
		},
		{
			subtitle: 'Insights',
			title: 'See what resonates on TikTok, track followers and engagement, and iterate',
			description:
				'Track followers, likes, video counts, and recent video engagement from connected TikTok accounts inside OpenQuok analytics — so you can schedule more of what already works.',
			bentoId: 'tiktok-insights',
			mediaOnRight: false
		}
	],
	audienceSubtitle: 'Built for TikTok creators',
	audienceTitle: 'Who schedules TikTok with OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-rose-400',
			title: 'App & SaaS Founders',
			description:
				'Ship product while TikTok runs. Queue carousels as inbox drafts and add trending audio before publish.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-lime-400',
			title: 'TikTok creators',
			description:
				'Batch a week of TikTok content, review drafts before publish, and track growth with your other channels.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-emerald-400',
			title: 'Developers & agents',
			description:
				'Pipe TikTok drafts via API, CLI, or MCP. Set privacy and posting method per video.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'TikTok scheduling, answered',
	faqDescription:
		'Common questions about connecting TikTok, scheduling videos and photo carousels, and using OpenQuok with the Content Posting API.',
	faqItems: [
		{
			title: 'How do I connect TikTok to OpenQuok?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, open a workspace, and choose Connect channel → TikTok. Complete TikTok OAuth and OpenQuok stores the connection for scheduling and analytics. OpenQuok Cloud registers the TikTok app for you. For self-hosted deployments, see the ${faqLinkSelfHostChannelSetup(TIKTOK_DOCS_PATH, 'TikTok')}.`
		},
		{
			title: 'Can I schedule TikTok posts from my desktop or phone browser?',
			description:
				'Yes. OpenQuok is cloud-based and runs in the browser — connect your TikTok account once, then use the same calendar, and kanban board on desktop, laptop, or mobile without installing a separate app.'
		},
		{
			title: 'Can I set TikTok privacy, comments, duet, and stitch before scheduling?',
			description:
				'Yes. TikTok settings in the composer let you pick privacy (public, friends, followers, or private), toggle comments, duet, and stitch, and flag branded content or AI-generated media before the post goes out. Choose direct publish or send to your TikTok inbox when you want to finish in the app.'
		},
		{
			title: 'Does OpenQuok support TikTok carousels, not just videos?',
			description:
				`Yes. Schedule a single MP4 video or one or more images (JPEG, PNG, or WEBP) as a photo carousel. Add an optional carousel title, turn on auto-add music for image posts, and queue the post on the calendar. Size carousel frames in the ${faqLink(tiktokLinks.photoEditor.toolChannel, 'TikTok photo editor')}.`
		},
		{
			title: 'Can I add trending audio when scheduling TikTok?',
			description:
				'Not through direct publish. TikTok’s API does not let third-party schedulers attach trending sounds to clips. Use the inbox upload method to queue carousels or videos to your TikTok inbox, then pick trending audio and publish inside the TikTok app in about a minute.'
		},
		{
			title: buildChannelProgrammaticSchedulingFaqTitle('TikTok posts'),
			description: buildChannelProgrammaticSchedulingFaqDescription({
				connectPhrase: 'Connect TikTok in our web dashboard',
				cliExamplesHref: publicFaqHref.cliTiktok,
				cliExamplesLabel: 'TikTok CLI examples',
				suffix:
					'Pass flat or nested tiktok provider settings for privacy, posting method, and media.'
			})
		},
		{
			title: 'Can I cross-post from TikTok to other channels eg. Facebook Reels or YouTube Shorts?',
			description:
				`Yes. Publish the same content to TikTok, Instagram, YouTube, and other connected channels from one workflow. Per-platform settings are applied separately for each destination. See ${faqLink(publicFaqHref.channels, 'Supported channels')}.`
		},
		{
			title: 'Can I repeat-schedule TikTok posts on a cadence?',
			description:
				`Yes. Set a repeat interval from one day up to one month when scheduling. After a TikTok post publishes, OpenQuok queues the next copy on that cadence so you can recycle evergreen clips and carousels without rebuilding each post. Plan timing tests with the ${faqLink(tiktokLinks.bestTimeToPost.toolChannel, 'TikTok best-time-to-post tool')}.`
		},
		{
			title: 'Can my team review TikTok drafts before they publish?',
			description:
				'Yes. Save TikTok posts as drafts, review them on the kanban board, and move them to Scheduled when you are ready. Workspaces keep each brand’s TikTok account and content separate when you manage multiple clients.'
		},
		{
			title: 'What TikTok analytics does OpenQuok track?',
			description:
				`OpenQuok pulls account-level TikTok metrics — followers, likes, and video count — plus aggregated views, likes, comments, and shares from your recent videos. Per-post analytics return views, likes, comments, and shares once the row is linked to a TikTok video id (posts:connect after inbox uploads). See the ${faqLink(publicFaqHref.cliAnalytics, 'analytics CLI')}.`
		},
		{
			title: 'Is there a free trial for TikTok scheduling?',
			description: buildChannelFreeTrialFaqDescription({
				connectPhrase: 'Connect TikTok in our web dashboard'
			})
		}
	],
	docsPath: TIKTOK_DOCS_PATH,
	available: true
} satisfies PublicChannelLandingPageViewModel;
