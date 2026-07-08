import { icons } from '$data/icons';

import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/types';
import { SHARED_CHANNEL_SEO_KEYWORDS } from '$lib/content/constants/channels/shared';

export const youtubeChannel = {
	slug: 'youtube',
	platformId: 'youtube',
	platformLabel: 'YouTube',
	comparePlatformLabels: ['YouTube Shorts'],
	icon: icons.YouTubeGlyph.name,
	heroTitle: 'Schedule YouTube videos and Shorts you approve',
	heroDescription:
		'Connect a YouTube channel you manage, queue MP4 videos and Shorts on the calendar, set title, privacy, tags, and thumbnail in the composer, and publish through the official Google APIs — from the dashboard, public API, or CLI.',
	metaTitle: 'YouTube Video & Short Upload Scheduler',
	metaDescription:
		'Schedule YouTube videos and Shorts with OpenQuok. Connect your channel, queue MP4 uploads with title, privacy, tags, and optional thumbnail, cross-post to other channels, and track analytics from one workspace.',
	hubDescription:
		'Long-form MP4 uploads and vertical Shorts — title, privacy, tags, and custom thumbnail per video.',
	keywords: [
		...SHARED_CHANNEL_SEO_KEYWORDS,
		'YouTube video scheduler',
		'YouTube Shorts scheduler',
		'schedule YouTube uploads',
		'schedule YouTube Shorts',
		'YouTube content calendar',
		'YouTube API scheduler',
		'YouTube upload automation',
		'YouTube channel scheduling',
		'faceless YouTube scheduler'
	],
	featureSections: [
		{
			subtitle: 'Bulk scheduling',
			title: 'Queue YouTube videos and Shorts, batch MP4 uploads, weeks ahead',
			description:
				'Schedule long-form videos and vertical Shorts onto the calendar for days or weeks ahead. Review agent and human drafts on the kanban board, then move them to Scheduled when you are ready to publish.',
			bentoId: 'youtube-bulk-scheduling',
			mediaOnRight: true
		},
		{
			subtitle: 'Video settings',
			title: 'Setup & Automate, title, privacy, tags, and thumbnail for every upload, in one place',
			description:
				'Attach a single MP4 — long-form or Short — write the video description as your post body, and tune YouTube-specific settings: title, public or unlisted privacy, made-for-kids, tags, and an optional custom thumbnail before publish.',
			bentoId: 'youtube-video-settings',
			mediaOnRight: false
		},
		{
			subtitle: 'Insights',
			title: 'See what resonates on your channel, track views and watch time, and iterate',
			description:
				'Track views, watch time, average view duration, subscribers gained, and likes from connected YouTube channels inside OpenQuok analytics — so you can schedule more of what already works.',
			bentoId: 'youtube-insights',
			mediaOnRight: true
		}
	],
	audienceSubtitle: 'Built for YouTube channels',
	audienceTitle: 'Who schedules YouTube with OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-rose-400',
			title: 'Creators & educators',
			description:
				'Queue long-form uploads, Shorts, and tutorials on a calendar instead of manual YouTube Studio publishing. Set privacy and tags per video before it goes live.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-lime-400',
			title: 'Marketing teams',
			description:
				'Batch product demos, launch videos, and Shorts ahead of time. Review drafts, attach thumbnails, and keep one workflow consistent across the team.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-emerald-400',
			title: 'Agencies & developers',
			description:
				'Manage client YouTube channels in separate workspaces. Schedule uploads from the dashboard or pipe drafts via the public API while you keep approval control.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnClapperboard.name,
			iconClass: 'text-violet-400',
			title: 'Faceless channels',
			description:
				'Batch voiceover, and footage on a calendar. Pipe finished videos through the public API, set title and tags per upload, and publish without opening YouTube Studio.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'YouTube scheduling, answered',
	faqDescription:
		'Common questions about connecting a YouTube channel, scheduling MP4 videos and Shorts, and using OpenQuok with Google APIs.',
	faqItems: [
		{
			title: 'How do I connect my YouTube channel to OpenQuok?',
			description:
				'Sign in to YouTube and OpenQuok in your browser, then open a workspace and choose Connect channel → YouTube. Complete Google OAuth, pick the channel you manage, and OpenQuok stores the connection for scheduling and analytics.'
		},
		{
			title: 'What video format does OpenQuok require for YouTube?',
			description:
				'Each scheduled YouTube post needs exactly one MP4 attachment. Our video editor validates format before publish; attach your video file from the media library or upload via the API.'
		},
		{
			title: 'Can I schedule YouTube Shorts with OpenQuok?',
			description:
				'Yes. Upload a vertical MP4 with the same one-video workflow as long-form uploads — add your title, description, tags, and optional thumbnail, then queue it on the calendar. YouTube classifies qualifying vertical uploads as Shorts on its side; OpenQuok uses the standard video upload API, not a separate Shorts publish mode.'
		},
		{
			title: 'Can I set the video title, privacy, and tags in OpenQuok?',
			description:
				'Yes. Use YouTube settings in our video editor (or pass flat keys or a youtube bucket via providerSettings in the API). Title, privacy (public, unlisted, or private), made-for-kids, tags, and an optional custom thumbnail are supported.'
		},
		{
			title: 'Does the post body become the YouTube description?',
			description:
				'Yes. The main post text maps to the video description on upload. Keep copy within the 5,000-character limit shown in our video editor.'
		},
		{
			title: 'Can I schedule YouTube uploads from an AI agent or script?',
			description:
				'Yes. After connecting a channel, use the public API or CLI with your workspace token to create scheduled posts with one MP4 and YouTube provider settings. Agents can draft titles and descriptions; you keep approval control in the dashboard.'
		},
		{
			title: 'Can I cross-post from YouTube to other channels?',
			description:
				'Yes. Compose once in OpenQuok and publish the same idea to YouTube, Instagram, Threads, Facebook, and other connected channels from one workflow. Per-platform settings — such as YouTube title and privacy — are applied separately for each destination.'
		},
		{
			title: 'Does OpenQuok support YouTube playlists or community posts?',
			description:
				'Not today. OpenQuok schedules MP4 video uploads to channels you manage — not playlist placement, community posts, or YouTube-side scheduled publish times inside Studio.'
		},
		{
			title: 'Is OpenQuok a good fit for faceless YouTube channels?',
			description:
				'Yes. Connect your channel once, then queue batches of MP4 uploads with titles, descriptions, tags, and thumbnails from the calendar or public API. Many faceless workflows render videos externally and use OpenQuok as the publish queue — you keep approval control before anything goes live.'
		},
		{
			title: 'Is there a free trial for YouTube scheduling?',
			description:
				'Yes. New workspaces can start on OpenQuok’s free trial, connect a YouTube channel, and schedule uploads during the trial period before choosing a paid plan.'
		}
	],
	docsPath: '/docs/social-integration/youtube',
	available: true
} satisfies PublicChannelLandingPageViewModel;
