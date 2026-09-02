import { icons } from '$data/icons';

import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/types';
import {
	buildChannelLandingFaqLinks,
	SHARED_CHANNEL_SEO_KEYWORDS
} from '$lib/content/constants/channels/shared';
import { faqLink, faqLinkSelfHostChannelSetup, publicFaqHref } from '$lib/content/utils/publicFaqLinks';

const TIKTOK_BUSINESS_DOCS_PATH = '/docs/social-integration/tiktok-business';
const tiktokBusinessLinks = buildChannelLandingFaqLinks('tiktok-business', TIKTOK_BUSINESS_DOCS_PATH);

export const tiktokBusinessChannel = {
	slug: 'tiktok-business',
	platformId: 'tiktok-business',
	platformLabel: 'TikTok (Business)',
	icon: icons.TikTok.name,
	heroTitle: 'Schedule TikTok Business clips with a cover you choose',
	heroDescription:
		'Connect a Business or Creator TikTok account, queue vertical videos or photo carousels, pick a custom cover or a frame from the clip, and attach commercial audio on direct posts — then approve before anything goes live.',
	metaTitle: 'TikTok Business Video Scheduler',
	metaDescription:
		'Schedule TikTok Business videos and photo carousels with OpenQuok. Choose a custom cover image or a frame timestamp, attach commercial audio on direct posts, and publish from one workspace.',
	hubDescription:
		'Business or Creator accounts — custom video covers, commercial audio on direct posts, and inbox drafts.',
	keywords: [
		...SHARED_CHANNEL_SEO_KEYWORDS,
		'TikTok Business scheduler',
		'schedule TikTok Business videos',
		'TikTok custom thumbnail',
		'TikTok Business content calendar',
		'TikTok Marketing API scheduler',
		'schedule TikTok Business posts'
	],
	featureSections: [
		{
			subtitle: 'Bulk scheduling',
			title: 'Queue Business clips and carousels, batch drafts on the calendar, weeks ahead',
			description:
				'Schedule vertical videos and photo carousels onto the calendar for days or weeks ahead. Review agent and human drafts on the kanban board, then move them to Scheduled when you are ready to publish.',
			bentoId: 'tiktok-business-bulk-scheduling',
			mediaOnRight: true
		},
		{
			subtitle: 'Trending audio',
			title: 'Attach commercial audio, pin a location, publish direct or to inbox',
			description:
				'Direct posts can carry a commercial sound id and a location pin so you do not rebuild the clip in the TikTok app. Queue the rest to your inbox when you still want to finish there. You keep approval in the dashboard either way.',
			bentoId: 'tiktok-business-compose-settings',
			mediaOnRight: false
		},
		{
			subtitle: 'Custom covers',
			title: 'Set a stored poster image, fall back to a frame timestamp, skip a default first frame',
			description:
				'A first-frame cover often undersells the clip. Save a poster in Media details and OpenQuok sends that public image as the video cover. If you only pick a frame, OpenQuok sends that timestamp instead.',
			bentoId: 'tiktok-business-video-covers',
			mediaOnRight: true
		}
	],
	audienceSubtitle: 'Built for TikTok Business & Creator accounts',
	audienceTitle: 'Who schedules TikTok (Business) with OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-rose-400',
			title: 'Brands & shops',
			description:
				'Queue product clips with a cover that matches the campaign, attach commercial audio on direct posts, and keep review in the workspace before anything goes live.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-lime-400',
			title: 'Creator teams',
			description:
				'Batch a week of Business-account content in one sitting. Use inbox upload when you still want to finish in the TikTok app, or direct post when the cover and audio are already set.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-emerald-400',
			title: 'Developers & agents',
			description:
				'Pipe TikTok Business drafts from your backend via the public API or CLI — including posting method, interaction toggles, and optional sound or location ids — while you keep approval in the dashboard.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'TikTok Business scheduling, answered',
	faqDescription:
		'Common questions about connecting TikTok (Business), custom video covers, commercial audio, and using OpenQuok with the Marketing API.',
	faqItems: [
		{
			title: 'How is TikTok (Business) different from TikTok in OpenQuok?',
			description:
				`TikTok is the Content Posting API channel. TikTok (Business) is a second connect option for Business or Creator accounts. You connect each one separately. Business can send a custom cover image. Content API TikTok uses a frame timestamp on direct posts instead. See the ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide')}.`
		},
		{
			title: 'How do I connect TikTok (Business) to OpenQuok?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, open a workspace, and choose Connect channel → TikTok (Business). Complete OAuth and OpenQuok stores the connection for scheduling. OpenQuok Cloud registers the Business app for you. For self-hosted deployments, see the ${faqLinkSelfHostChannelSetup(TIKTOK_BUSINESS_DOCS_PATH, 'TikTok (Business)')}.`
		},
		{
			title: 'Can I set a custom video cover on TikTok (Business)?',
			description:
				`Yes. Open Media details on the video, create a poster, and save it. OpenQuok sends that public image as the cover. If you only pick a frame, OpenQuok sends that timestamp instead. Size stills in the ${faqLink(tiktokBusinessLinks.photoEditor.toolChannel, 'TikTok (Business) photo editor')}.`
		},
		{
			title: 'Can I attach trending or commercial audio when scheduling?',
			description:
				'Yes on direct posts. Paste a sound id in Settings while TikTok (Business) is focused. Inbox upload still lets you pick audio in the TikTok app. Video privacy follows the account default on this channel — OpenQuok does not send a privacy level on Business videos.'
		},
		{
			title: 'Does OpenQuok support TikTok Business carousels, not just videos?',
			description:
				'Yes. Schedule a single MP4 video or one or more images (JPEG, PNG, or WEBP) as a photo carousel. Photo posts can set privacy on direct publish. Do not mix photos and video in one post.'
		},
		{
			title: 'Can I schedule TikTok (Business) posts from an AI agent or script?',
			description:
				`Yes. After connecting TikTok (Business), use the ${faqLink(publicFaqHref.publicApi, 'Public API')} or ${faqLink(publicFaqHref.cliGettingStarted, 'openquok CLI')} with your workspace token. Pass video or image media and flat or nested tiktok-business provider settings. Agents on ${faqLink(publicFaqHref.agents, 'agent hosts')} can draft; you keep approval in the dashboard.`
		},
		{
			title: 'Can I cross-post from TikTok (Business) to other channels?',
			description:
				`Yes. Publish the same content to TikTok (Business), Instagram, YouTube, and other connected channels from one workflow. Per-platform settings apply separately for each destination. See ${faqLink(publicFaqHref.channels, 'Supported channels')}.`
		},
		{
			title: 'Can I repeat-schedule TikTok (Business) posts on a cadence?',
			description:
				`Yes. Set a repeat interval from one day up to one month when scheduling. After a post publishes, OpenQuok queues the next copy on that cadence. Plan timing tests with the ${faqLink(tiktokBusinessLinks.bestTimeToPost.toolChannel, 'TikTok (Business) best-time-to-post tool')}.`
		},
		{
			title: 'Can my team review TikTok (Business) drafts before they publish?',
			description:
				'Yes. Save posts as drafts, review them on the kanban board, and move them to Scheduled when you are ready. Workspaces keep each brand account and content separate when you manage multiple clients.'
		},
		{
			title: 'Is there a free trial for TikTok (Business) scheduling?',
			description:
				`Yes. New workspaces can start on OpenQuok’s free trial, connect TikTok (Business), and schedule posts during the trial period before choosing a paid plan. Plan limits are on ${faqLink(publicFaqHref.pricing, 'Pricing')}.`
		}
	],
	docsPath: TIKTOK_BUSINESS_DOCS_PATH,
	available: true
} satisfies PublicChannelLandingPageViewModel;
