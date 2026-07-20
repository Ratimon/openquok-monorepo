import { icons } from '$data/icons';

import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/types';
import { SHARED_CHANNEL_SEO_KEYWORDS } from '$lib/content/constants/channels/shared';

export const threadsChannel = {
	slug: 'threads',
	platformId: 'threads',
	platformLabel: 'Threads',
	icon: icons.Threads.name,
	heroTitle: 'Schedule Threads posts, media, and follow-up replies you approve',
	heroDescription:
		'Connect a Meta Threads profile, queue text and media on the calendar, schedule follow-up replies with delays, and publish through the official Meta API — from the dashboard, public API, or CLI.',
	metaTitle: 'Threads Post Scheduler',
	metaDescription:
		'Schedule Threads posts with OpenQuok. Connect Meta Threads, queue text and media, chain follow-up replies, and publish from the dashboard, API, or CLI.',
	hubDescription:
		'500-character posts with media and scheduled follow-up reply chains — conversation-first text on Meta Threads.',
	keywords: [
		...SHARED_CHANNEL_SEO_KEYWORDS,
		'Threads post scheduler',
		'schedule Threads posts',
		'Meta Threads scheduling',
		'Threads content calendar',
		'Threads API scheduler',
		'Threads reply scheduler'
	],
	featureSections: [
		{
			subtitle: 'Bulk scheduling',
			title: 'Queue Threads posts, batch drafts on the calendar, weeks ahead',
			description:
				'Schedule text and media posts onto the calendar for weeks ahead. Review agent and human drafts on the kanban board, then scheduled when you are ready to publish.',
			bentoId: 'threads-bulk-scheduling',
			mediaOnRight: true
		},
		{
			subtitle: 'Media & replies',
			title: 'Attach image or video, schedule follow-up replies, in one place',
			description:
				'Create post within Threads\'s 500-character limit, attach a single image, carousel or video, and queue replies with delays before the thread goes live.',
			bentoId: 'threads-media-replies',
			mediaOnRight: false
		},
		{
			subtitle: 'Insights',
			title: 'See what resonates on Threads, track views and engagement, and iterate',
			description:
				'Track views, likes, replies, reposts, and quotes from connected Threads profiles inside OpenQuok analytics — so you can schedule more of what already works.',
			bentoId: 'threads-insights',
			mediaOnRight: true
		}
	],
	audienceSubtitle: 'Built for Meta Threads',
	audienceTitle: 'Who schedules Threads with OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-rose-400',
			title: 'Creators & founders',
			description:
				'Stay consistent on Threads without daily manual posting. Queue text, images, and reply chains on the calendar while you focus on building.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-lime-400',
			title: 'Social managers',
			description:
				'Batch a week of Threads in one sitting, review drafts before they publish, and track views and engagement alongside your other channels.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-emerald-400',
			title: 'Developers & agents',
			description:
				'Pipe Threads drafts from your backend via the public API or CLI — including follow-up replies under providerSettings — while you keep approval control in the dashboard.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Threads scheduling, answered',
	faqDescription: 'Setup, scheduling, media, replies, and automation questions for Meta Threads on OpenQuok.',
	faqItems: [
		{
			title: 'How do I connect Threads to OpenQuok?',
			description:
				'Sign in to Threads and OpenQuok in your browser, then open a workspace, choose Connect channel → Threads, and finish Meta OAuth. OpenQuok links the Threads profile to that workspace for scheduling and analytics.'
		},
		{
			title: 'Can I schedule Threads posts with images, video, or carousels?',
			description:
				'Yes. Attach one image or video, or multiple files for a carousel, when composing a Threads post in OpenQuok. In per-platform mode, unsupported formats (such as SVG) are blocked early with a clear error before publish.'
		},
		{
			title: 'Does OpenQuok respect the Threads 500-character limit?',
			description:
				'Yes. our post editor shows the 500-character cap and the Threads provider trims overflow before publish. Check the preview so hooks and links fit before scheduling.'
		},
		{
			title: 'Can I schedule Threads from the API or CLI?',
			description:
				'Yes. Use integration UUIDs from your workspace in the create-post API or CLI commands. Follow-up replies and other provider settings go under providerSettingsByIntegrationId when needed.'
		},
		{
			title: 'Can I cross-post from Threads to Instagram and other channels?',
			description:
				'Yes. Compose once in OpenQuok and publish the same idea to Threads, Instagram, X, LinkedIn, TikTok, YouTube, and other connected channels from one workflow. Per-platform captions, aspect ratios, and character limits are applied separately, so each destination gets tailored copy from a single schedule.'
		},
		{
			title: 'Can I auto-repost evergreen content on Threads?',
			description:
				'OpenQuok includes auto-repost and recurring schedule slots, so you can recycle evergreen Threads posts on intervals from one day up to one month. Combine it with the media library to keep reusing your best-performing images, videos, and captions without rebuilding posts from scratch.'
		},
		{
			title: 'Can I schedule a Threads follow-up replies in advance?',
			description:
				'Yes. Add follow-up replies in the composer (or pass threads.replies via the API or CLI). Each reply publishes from the same account after the delay you set once the main post goes live.'
		},
		{
			title: 'Is Threads scheduling included in the free trial?',
			description:
				'Yes. Connect Threads during the trial, schedule posts, and explore API access before upgrading to a paid plan that matches your channel and workspace limits.'
		}
	],
	docsPath: '/docs/social-integration/threads',
	available: false
} satisfies PublicChannelLandingPageViewModel;
