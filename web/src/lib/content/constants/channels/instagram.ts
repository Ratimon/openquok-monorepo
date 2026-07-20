import { icons } from '$data/icons';

import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/types';
import { SHARED_CHANNEL_SEO_KEYWORDS } from '$lib/content/constants/channels/shared';

export const instagramChannel = {
	slug: 'instagram',
	platformId: 'instagram',
	platformLabel: 'Instagram',
	icon: icons.InstagramGlyph.name,
	heroTitle: 'Schedule Instagram feed posts, Reels, carousels, and Stories you approve',
	heroDescription:
		'Connect via Instagram or Facebook Business login, queue content on the OpenQuok calendar or through the public API, and tune per-post Instagram settings before publish.',
	metaTitle: 'Instagram Post, Reel & Story Scheduler',
	metaDescription:
		'Schedule Instagram feed posts, Reels, carousels, and Stories with OpenQuok. Business or Standalone login, calendar scheduling, per-post settings, follow-up comments, and analytics.',
	hubDescription:
		'Feed posts, Reels, carousels, and Stories — with trial Reels, collaborator tags, and follow-up comments.',
	keywords: [
		...SHARED_CHANNEL_SEO_KEYWORDS,
		'Instagram post scheduler',
		'schedule Instagram posts',
		'Instagram Reel scheduler',
		'Instagram Story scheduler',
		'Instagram carousel scheduler',
		'Instagram Business scheduling',
		'Instagram content calendar',
		'Instagram API scheduler'
	],
	featureSections: [
		{
			subtitle: 'Bulk scheduling',
			title: 'Queue Instagram posts, batch Reels and carousels, weeks ahead',
			description:
				'Schedule photo, carousels, MP4 Reels, and Stories onto the calendar for days or weeks ahead. Review agent and human drafts on the kanban board, then move them to Scheduled when you are ready to publish.',
			bentoId: 'instagram-bulk-scheduling',
			mediaOnRight: true
		},
		{
			subtitle: 'Compose & settings',
			title: 'Automate trial Reels, follow-up comments and collaborators tags, in one place',
			description:
				'Switch between feed/Reel and Story, tag up to three collaborators on single-media posts, enable Trial Reels, and queue text-only follow-up comments — from the composer or via providerSettings in the API.',
			bentoId: 'instagram-compose-settings',
			mediaOnRight: false
		},
		{
			subtitle: 'Insights',
			title: 'See what resonates on Instagram, track reach and engagement, and iterate',
			description:
				'Track reach, views, likes, saves, and comments from connected Instagram accounts inside OpenQuok analytics — so you can schedule more of what already works.',
			bentoId: 'instagram-insights',
			mediaOnRight: true
		}
	],
	audienceSubtitle: 'Built for Instagram Business & Standalone',
	audienceTitle: 'Who schedules Instagram with OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-rose-400',
			title: 'Brands & creators',
			description:
				'Queue feed posts, Reels, and Stories from one calendar — whether you connect via Facebook-linked Business login or Instagram Standalone.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-lime-400',
			title: 'E-commerce teams',
			description:
				'Batch product carousels and launch Reels ahead of time. Set post type, collaborators, and follow-up comments per post without leaving the composer.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-emerald-400',
			title: 'Agencies & developers',
			description:
				'Separate client Instagram accounts into workspaces, schedule at scale from the dashboard or public API, and track per-account insights without mixing brands.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Instagram scheduling, answered',
	faqDescription:
		'Setup, post types, scheduling, and automation questions for Instagram on OpenQuok.',
	faqItems: [
		{
			title: 'What is the difference between Instagram Business and Standalone in OpenQuok?',
			description:
				'Instagram Business uses Facebook Login and is suited to accounts linked to a Facebook Page. Instagram Standalone uses Instagram Login directly. Both share the same publish pipeline — pick the integration that matches how your account is set up in Meta.'
		},
		{
			title: 'How do I connect Instagram to OpenQuok?',
			description:
				'Sign in to Instagram and OpenQuok in your browser, then in your workspace choose Connect channel and select the Instagram integration that matches your account type. Complete OAuth, and if Business login requires a Page selection, pick the correct profile in the connect flow.'
		},
		{
			title: 'Can I schedule Instagram Reels, carousels, and Stories?',
			description:
				'Yes. Attach a single MP4 for a Reel, 2–10 images or videos for a carousel, or one attachment with post type set to Story. Captions can run up to 2,200 characters on feed posts and Reels.'
		},
		{
			title: 'Does OpenQuok support Trial Reels and collaborators?',
			description:
				'Yes. Enable Trial Reel on a single MP4 feed post and choose manual or performance-based graduation. Add up to three collaborator usernames on single-media feed or Reel posts — not on carousels or Stories.'
		},
		{
			title: 'Can I schedule text follow-up comments on Instagram?',
			description:
				'Yes. Add follow-up comment rows in the composer (or pass instagram.replies via the API). Each comment publishes as text after the delay you set once the root post goes live.'
		},
		{
			title: 'Can I schedule Instagram posts from an AI agent or script?',
			description:
				'Yes. After connecting Instagram, use the public API or CLI with your workspace token. Pass integration UUIDs, media attachments, and flat or nested providerSettings for post type, trial reel, and follow-up comments.'
		},
		{
			title: 'Can I cross-post from Instagram to Threads and other channels?',
			description:
				'Yes. Create & compose once in OpenQuok and publish the same idea to Instagram, Threads, X, LinkedIn, TikTok, YouTube, and other connected channels from one workflow. Per-platform captions, aspect ratios, and character limits are applied separately, so each destination gets tailored copy from a single schedule.'
		},
		{
			title: 'Does OpenQuok include an Instagram DM or comment inbox?',
			description:
				'Not today. OpenQuok schedules posts and scheduled text follow-up comments — not DM replies, keyword auto-replies, or Story link stickers.'
		},
		{
			title: 'Where can I find setup steps for Meta app credentials?',
			description:
				'See the Instagram setup guide in OpenQuok docs for redirect URIs, Meta app configuration, and backend environment variables required for OAuth.'
		}
	],
	docsPath: '/docs/social-integration/instagram',
	available: false
} satisfies PublicChannelLandingPageViewModel;
