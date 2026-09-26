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

const TIKTOK_DOCS_PATH = '/docs/social-integration/tiktok';
const tiktokLinks = buildChannelLandingFaqLinks('tiktok', TIKTOK_DOCS_PATH);

export const tiktokChannel = {
	slug: 'tiktok',
	platformId: 'tiktok',
	platformLabel: 'TikTok',
	icon: icons.TikTok.name,
	heroTitle: 'Schedule TikTok videos and carousels',
	heroDescription:
		'Connect a TikTok account. Schedule vertical videos or image carousels on the calendar. Set privacy and posting method. Publish through the official TikTok APIs from the dashboard, public API, or CLI.',
	metaTitle: 'TikTok Video & Photo Scheduler',
	metaDescription:
		'Schedule TikTok videos and photo carousels with OpenQuok. Connect your account. Queue MP4 or image posts with privacy and interaction settings. Publish from one workspace.',
	hubDescription:
		'Vertical video and photo carousels. Direct publish or queue to your TikTok inbox so you can add trending audio.',
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
				'Schedule viral videos and photo carousels onto the calendar for days or weeks ahead. Review agent and human drafts on the kanban board. Move them to Scheduled when you are ready to publish.',
			bentoId: 'tiktok-bulk-scheduling',
			mediaOnRight: true
		},
		{
			subtitle: 'Post editor',
			title: 'Schedule vertical videos and photo carousels, review before publish, from one draft',
			description:
				'Attach a single MP4 or one or more images for a carousel. Write your caption. Schedule onto the calendar. Review agent and human drafts on the kanban board before TikTok publishes from your connected account.',
			bentoId: 'tiktok-post-editor',
			mediaOnRight: false
		},
		{
			subtitle: 'TikTok settings',
			title: 'Set privacy, inbox upload to manually select trending audio, and AI Labeling',
			description:
				'Set privacy, comments, duet, and stitch before you schedule. Queue clips and carousels to your TikTok inbox. Pick trending audio in the TikTok app. Flag AI-generated content so TikTok can apply the right label.',
			bentoId: 'tiktok-settings',
			mediaOnRight: true
		},
		{
			subtitle: 'Insights',
			title: 'See what resonates on TikTok, track followers and engagement, and iterate',
			description:
				'TikTok analytics—Trends summary totals and per-account followers, likes, videos, and recent engagement. Then schedule more of what already works.',
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
				'Ship product while TikTok runs. Queue carousels as inbox drafts. Add trending audio before publish.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-lime-400',
			title: 'TikTok creators',
			description:
				'Batch a week of TikTok content. Review drafts before publish. Track growth with your other channels.',
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
				`Yes. OpenQuok runs in your browser. Connect TikTok once, then use the same calendar and kanban on desktop, laptop, or mobile. You do not need a separate app. See the ${faqLink(publicFaqHref.docsCalendar, 'calendar guide')} and ${faqLink(publicFaqHref.docsKanban, 'kanban board guide')}.`
		},
		{
			title: 'Can I set TikTok privacy, comments, duet, and stitch before scheduling?',
			description:
				`Yes. TikTok settings in the composer let you pick privacy, toggle comments, duet, and stitch, and flag branded or AI-generated content. Choose direct publish or inbox upload when you want to finish in the TikTok app. See ${faqLink(faqHrefDocs('platforms/per-channel-settings'), 'TikTok per-channel settings')} and ${faqLink(faqHrefDocs('public-api-providers/tiktok'), 'TikTok API settings')}.`
		},
		{
			title: 'Does OpenQuok support TikTok carousels, not just videos?',
			description:
				`Yes. Schedule a single MP4 video or one or more images (JPEG, PNG, or WEBP) as a photo carousel. Add an optional carousel title, turn on auto-add music for image posts, and queue the post on the calendar. Size carousel frames in the ${faqLink(tiktokLinks.photoEditor.toolChannel, 'TikTok photo editor')}.`
		},
		{
			title: 'Can I add trending audio when scheduling TikTok?',
			description:
				`Not through direct publish. TikTok's API does not let third-party schedulers attach trending sounds. Use inbox upload to send the clip to your TikTok inbox. Open the TikTok app, pick trending audio, and publish in about a minute. See ${faqLink(faqHrefDocs('platforms/per-channel-settings'), 'TikTok per-channel settings')}, the ${faqLink(publicFaqHref.docsKanban, 'kanban board guide')}, and ${faqLink(faqHrefDocs('cli-examples/tiktok'), 'TikTok CLI examples')}.`
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
				`Yes. Save TikTok posts as drafts, review them on the kanban board, and move them to Scheduled when you are ready. Workspaces keep each brand's TikTok account and content separate when you manage multiple clients. See the ${faqLink(publicFaqHref.docsKanban, 'kanban board guide')} and ${faqLink(faqHrefDocs('settings/team'), 'team workspaces guide')}.`
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
