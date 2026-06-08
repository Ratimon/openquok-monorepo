import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

import type { PublicChannelFeatureBentoId } from '$lib/content/constants/publicChannelFeatureBento';
import type { PublicFaqItem } from '$lib/content/constants/publicFaqCatalog';
import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';

export type PublicChannelFeatureSection = {
	subtitle: string;
	/** Comma-separated lines; each part gets landing-page gradient styling (see FEATURE_*_TITLE in config). */
	title: string;
	description: string;
	/** Optional demo asset under `/landing/` or `/static/`. */
	imageSrc?: string;
	imageAlt?: string;
	/** Interactive bento showcase (takes precedence over `imageSrc`). */
	bentoId?: PublicChannelFeatureBentoId;
	/** When true, media renders on the right; otherwise on the left. */
	mediaOnRight?: boolean;
};

export type PublicChannelLandingPage = {
	slug: string;
	/** Integration catalog identifier used for icons and docs links. */
	platformId: string;
	platformLabel: string;
	icon: IconName;
	heroTitle: string;
	heroDescription: string;
	metaTitle: string;
	metaDescription: string;
	keywords: string[];
	featureSections: PublicChannelFeatureSection[];
	audienceSubtitle: string;
	audienceTitle: string;
	audienceCards: AudienceCard[];
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: PublicFaqItem[];
	/** Setup guide under `/docs/social-integration/`. */
	docsPath: string;
	/** When false, hub shows a coming-soon badge and detail route 404s. */
	available: boolean;
};


const FACEBOOK_CHANNEL: PublicChannelLandingPage = {
	slug: 'facebook',
	platformId: 'facebook',
	platformLabel: 'Facebook',
	icon: icons.Facebook.name,
	heroTitle: 'Schedule Facebook Page posts and Reels you approve',
	heroDescription:
		'Connect a Facebook Page, queue feed posts, photos, link previews, and MP4 Reels from the OpenQuok calendar or your AI agents, and publish through the official Meta API',
	metaTitle: 'Facebook Page Post & Reel Scheduler',
	metaDescription:
		'Schedule Facebook Page posts and Reels with OpenQuok. Connect your Page, queue text, photos, and MP4 video from the calendar or API, and keep human approval in the loop.',
	keywords: [
		'Facebook post scheduler',
		'Facebook Reel scheduler',
		'Facebook Page scheduling',
		'schedule Facebook posts',
		'schedule Facebook Reels',
		'Facebook content calendar',
		'Meta Graph API scheduler'
	],
	featureSections: [
		{
			subtitle: 'Bulk scheduling',
			title: 'Queue Facebook posts, schedule Reels in bulk, weeks ahead',
			description:
				'Schedule feed posts, carousels, and MP4 Reels onto the calendar for days or weeks ahead. OpenQuok keeps your Page active without last-minute scrambles — whether you compose by hand or pipe drafts in from an agent.',
			bentoId: 'facebook-bulk-scheduling',
			mediaOnRight: true
		},
		{
			subtitle: 'Video & links',
			title: 'Publish Reels from MP4, link previews effortlessly, in one composer',
			description:
				'Attach a single MP4 and OpenQuok publishes it to your Page through Meta’s video endpoint — the same path Facebook uses to surface Reels. Add an optional URL on text posts for link-preview cards; photos and video posts use the media you attach.',
			bentoId: 'facebook-video-links',
			mediaOnRight: false
		},
		{
			subtitle: 'Insights',
			title: 'See what resonates on your Page, track engagement insights, and scale correctly',
			description:
				'Track post-level impressions, reactions, and clicks — plus Page-level video views — from connected Facebook Pages inside OpenQuok analytics, so you can schedule more of what already works.',
			bentoId: 'facebook-insights',
			mediaOnRight: true
		}
	],
	audienceSubtitle: 'Built for Facebook Pages',
	audienceTitle: 'Who schedules Facebook with OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-rose-400',
			title: 'Page owners',
			description:
				'Schedule feed posts, photos, and MP4 Reels on your Facebook Page without living in Meta Business Suite. Queue content on the calendar and publish through the official Graph API.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-lime-400',
			title: 'Marketing teams',
			description:
				'Batch weeks of Page content, keep link previews and Reels on one schedule, and review everything before it goes live — from the dashboard or your existing workflows.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-emerald-400',
			title: 'Agencies',
			description:
				'Manage multiple client Facebook Pages in separate workspaces. Connect each Page once, schedule at scale, and track Page insights without mixing brands.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Facebook scheduling, answered',
	faqDescription:
		'Common questions about connecting a Facebook Page, scheduling posts and Reels, and using OpenQuok with Meta.',
	faqItems: [
		{
			title: 'How do I connect my Facebook Page to OpenQuok?',
			description:
				'Sign in, open a workspace, and choose Connect channel → Facebook Page. Complete Meta OAuth, pick the Page you manage, and OpenQuok stores the connection for scheduling and analytics.'
		},
		{
			title: 'Can I connect my personal Facebook profile?',
			description:
				'No. OpenQuok connects to Facebook Pages you manage, not personal profiles. Meta’s Graph API supports third-party publishing to Pages — not scheduling to individual user timelines. Use a Facebook Page for your brand, business, or creator presence.'
		},
		{
			title: 'Can OpenQuok post to Facebook Groups?',
			description:
				'No. OpenQuok publishes to Facebook Pages you manage via the Graph API. Meta deprecated public Group publishing APIs; Page posting is the supported path for businesses and creators.'
		},
		{
			title: 'How do I publish Facebook Reels from OpenQuok?',
			description:
				'Attach a single MP4 when composing a Facebook Page post. OpenQuok uploads it through Meta’s Page video API; Facebook surfaces eligible uploads as Reels on your Page. Caption text becomes the video description.'
		},
		{
			title: 'Can I schedule Facebook posts from an AI agent or script?',
			description:
				'Yes. After connecting a Page, use the public API or CLI with your workspace token to create scheduled posts and Reels. Agents can draft captions and media; you keep approval control in the dashboard.'
		},
		{
			title: 'Does OpenQuok support link previews on Facebook?',
			description:
				'Yes. When you include a URL in a text-only Facebook Page post, OpenQuok passes link-preview settings supported by the integration so shared links render with the right metadata. Link URLs are ignored when photos or video are attached.'
		},
		{
			title: 'Does OpenQuok support Facebook Stories?',
			description:
				'Not today. OpenQuok publishes Page feed posts, photos, MP4 video/Reels, and scheduled follow-up comments — not Facebook Stories.'
		},
		{
			title: 'Is there a free trial for Facebook scheduling?',
			description:
				'Yes. New workspaces can start on OpenQuok’s free trial, connect a Facebook Page, and schedule posts and Reels during the trial period before choosing a paid plan.'
		}
	],
	docsPath: '/docs/social-integration/facebook',
	available: true
};

const THREADS_CHANNEL: PublicChannelLandingPage = {
	slug: 'threads',
	platformId: 'threads',
	platformLabel: 'Threads',
	icon: icons.Threads.name,
	heroTitle: 'Schedule Threads posts, media, and reply chains you approve',
	heroDescription:
		'Connect a Meta Threads profile, queue text and media on the calendar, schedule follow-up replies with delays, and publish through the official Meta API — from the dashboard, public API, or CLI.',
	metaTitle: 'Threads Post Scheduler',
	metaDescription:
		'Schedule Threads posts with OpenQuok. Connect Meta Threads, queue text and media, chain follow-up replies, and publish from the dashboard, API, or CLI.',
	keywords: [
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
				'Schedule text and media posts onto the calendar for days or weeks ahead. Review agent and human drafts on the kanban board, then move them to Scheduled when you are ready to publish.',
			bentoId: 'threads-bulk-scheduling',
			mediaOnRight: true
		},
		{
			subtitle: 'Media & replies',
			title: 'Attach image or video, schedule follow-up replies, in one composer',
			description:
				'Create post within Meta’s 500-character limit, attach a single image or video (or a multi-media carousel), and queue follow-up replies with per-reply delays before the thread goes live.',
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
				'Create or open a workspace, choose Connect channel → Threads, and finish Meta OAuth. OpenQuok links the Threads profile to that workspace for scheduling and analytics.'
		},
		{
			title: 'Can I schedule Threads posts with images, video, or carousels?',
			description:
				'Yes. Attach one image or video, or multiple files for a carousel, when composing a Threads post in OpenQuok. Unsupported formats (such as SVG) are blocked early with a clear error before publish.'
		},
		{
			title: 'Can I schedule a Threads reply chain in advance?',
			description:
				'Yes. Add follow-up replies in the composer (or pass threads.replies via the API or CLI). Each reply publishes from the same account after the delay you set once the main post goes live.'
		},
		{
			title: 'Can I schedule Threads from the API or CLI?',
			description:
				'Yes. Use integration UUIDs from your workspace in the create-post API or CLI commands. Follow-up replies and other provider settings go under providerSettingsByIntegrationId when needed.'
		},
		{
			title: 'Does OpenQuok respect the Threads 500-character limit?',
			description:
				'Yes. The composer shows the 500-character cap and the Threads provider trims overflow before publish. Check the preview so hooks and links fit before scheduling.'
		},
		{
			title: 'Is Threads scheduling included in the free trial?',
			description:
				'Yes. Connect Threads during the trial, schedule posts, and explore API access before upgrading to a paid plan that matches your channel and workspace limits.'
		}
	],
	docsPath: '/docs/social-integration/threads',
	available: true
};

const INSTAGRAM_CHANNEL: PublicChannelLandingPage = {
	slug: 'instagram',
	platformId: 'instagram',
	platformLabel: 'Instagram',
	icon: icons.Instagram.name,
	heroTitle: 'Instagram scheduler for Business and Standalone login',
	heroDescription:
		'Connect Instagram via Facebook-linked Business login or Instagram Standalone, schedule feed posts from the calendar or API, and manage both flows from the same OpenQuok workspace.',
	metaTitle: 'Instagram Post Scheduler',
	metaDescription:
		'Schedule Instagram posts with OpenQuok. Support for Instagram Business (Facebook Login) and Instagram Standalone — calendar, API, and agent workflows.',
	keywords: [
		'Instagram post scheduler',
		'schedule Instagram posts',
		'Instagram Business scheduling',
		'Instagram content calendar',
		'Instagram API scheduler'
	],
	featureSections: [
		{
			subtitle: 'Both login paths',
			title: 'Business or Standalone login, one Instagram scheduler, minimal setup',
			description:
				'Use Instagram Business when your account is linked to a Facebook Page, or Instagram Standalone when you authenticate directly with Instagram Login. OpenQuok supports both connection flows.',
			imageSrc: '/landing/2-calendar-filters.mp4',
			imageAlt: 'Scheduling Instagram posts on the OpenQuok calendar',
			mediaOnRight: true
		},
		{
			subtitle: 'Compose with control',
			title: 'Per-post Instagram settings, compose with control, efficiently',
			description:
				'Tune provider settings at publish time — captions, media, and Instagram-specific options — whether you post from the composer or send payloads through the API.',
			imageSrc: '/landing/4-file-manager.mp4',
			imageAlt: 'Media library for Instagram post assets',
			mediaOnRight: false
		},
		{
			subtitle: 'Scale',
			title: 'Multi-workspace Instagram, scale for agencies, without mixing clients',
			description:
				'Separate client or brand Instagram accounts into dedicated workspaces. Invite teammates, connect multiple Instagram channels, and keep automation context isolated.',
			imageSrc: '/landing/5-analytics.mp4',
			imageAlt: 'Instagram analytics alongside other channels',
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
				'Connect via Facebook-linked Business login or Instagram Standalone, then schedule feed posts from one calendar — whichever path matches how your account is set up in Meta.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-lime-400',
			title: 'E-commerce teams',
			description:
				'Queue product launches, seasonal campaigns, and evergreen feed posts ahead of time. Tune Instagram-specific settings at publish without juggling multiple tools.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-emerald-400',
			title: 'Agencies',
			description:
				'Separate client Instagram accounts into dedicated workspaces. Invite teammates, connect multiple profiles, and keep automation context isolated per brand.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Instagram scheduling, answered',
	faqDescription:
		'Questions about Instagram Business vs Standalone, connecting accounts, and scheduling with OpenQuok.',
	faqItems: [
		{
			title: 'What is the difference between Instagram Business and Standalone in OpenQuok?',
			description:
				'Instagram Business uses Facebook Login and is suited to accounts linked to a Facebook Page. Instagram Standalone uses Instagram Login directly. Pick the integration that matches how your account is set up in Meta.'
		},
		{
			title: 'How do I connect Instagram to OpenQuok?',
			description:
				'In your workspace, choose Connect channel and select the Instagram integration that matches your account type. Complete OAuth, and if Business login requires a Page selection, pick the correct profile in the connect flow.'
		},
		{
			title: 'Can I schedule Instagram posts from an AI agent?',
			description:
				'Yes. After connecting Instagram, agents can call the public API with your workspace token. Use integration UUIDs in post payloads and providerSettings for per-account options.'
		},
		{
			title: 'Can I connect more than one Instagram account?',
			description:
				'Yes, within your plan’s channel limits. Each connected Instagram account counts as a channel. Use workspaces to separate brands or clients.'
		},
		{
			title: 'Where can I find setup steps for Meta app credentials?',
			description:
				'See the Instagram setup guide in OpenQuok docs for redirect URIs, Meta app configuration, and backend environment variables required for OAuth.'
		}
	],
	docsPath: '/docs/social-integration/instagram',
	available: true
};

/** Coming-soon entries appear on the hub but do not have detail pages yet. */
const COMING_SOON_CHANNELS: PublicChannelLandingPage[] = [
	{
		slug: 'linkedin',
		platformId: 'linkedin',
		platformLabel: 'LinkedIn',
		icon: icons.LinkedIn.name,
		heroTitle: '',
		heroDescription: '',
		metaTitle: 'LinkedIn Post Scheduler',
		metaDescription: 'LinkedIn scheduling on OpenQuok — coming soon.',
		keywords: ['LinkedIn post scheduler'],
		featureSections: [],
		audienceSubtitle: '',
		audienceTitle: '',
		audienceCards: [],
		faqSubtitle: '',
		faqTitle: '',
		faqDescription: '',
		faqItems: [],
		docsPath: '/docs/social-integration',
		available: false
	},
	{
		slug: 'tiktok',
		platformId: 'tiktok',
		platformLabel: 'TikTok',
		icon: icons.TikTok.name,
		heroTitle: '',
		heroDescription: '',
		metaTitle: 'TikTok Post Scheduler',
		metaDescription: 'TikTok scheduling on OpenQuok — coming soon.',
		keywords: ['TikTok post scheduler'],
		featureSections: [],
		audienceSubtitle: '',
		audienceTitle: '',
		audienceCards: [],
		faqSubtitle: '',
		faqTitle: '',
		faqDescription: '',
		faqItems: [],
		docsPath: '/docs/social-integration',
		available: false
	},
	{
		slug: 'youtube',
		platformId: 'youtube',
		platformLabel: 'YouTube',
		icon: icons.YouTube.name,
		heroTitle: '',
		heroDescription: '',
		metaTitle: 'YouTube Post Scheduler',
		metaDescription: 'YouTube scheduling on OpenQuok — coming soon.',
		keywords: ['YouTube post scheduler'],
		featureSections: [],
		audienceSubtitle: '',
		audienceTitle: '',
		audienceCards: [],
		faqSubtitle: '',
		faqTitle: '',
		faqDescription: '',
		faqItems: [],
		docsPath: '/docs/social-integration',
		available: false
	},
	{
		slug: 'x',
		platformId: 'x',
		platformLabel: 'X',
		icon: icons.X.name,
		heroTitle: '',
		heroDescription: '',
		metaTitle: 'X Post Scheduler',
		metaDescription: 'X scheduling on OpenQuok — coming soon.',
		keywords: ['X post scheduler', 'Twitter scheduler'],
		featureSections: [],
		audienceSubtitle: '',
		audienceTitle: '',
		audienceCards: [],
		faqSubtitle: '',
		faqTitle: '',
		faqDescription: '',
		faqItems: [],
		docsPath: '/docs/social-integration',
		available: false
	}
];

export const PUBLIC_CHANNEL_LANDING_PAGES: readonly PublicChannelLandingPage[] = [
	FACEBOOK_CHANNEL,
	THREADS_CHANNEL,
	INSTAGRAM_CHANNEL,
	...COMING_SOON_CHANNELS
];

const channelBySlug = new Map(PUBLIC_CHANNEL_LANDING_PAGES.map((page) => [page.slug, page]));

export function getPublicChannelBySlug(slug: string): PublicChannelLandingPage | undefined {
	const key = slug.trim().toLowerCase();
	return channelBySlug.get(key);
}

export function getAvailablePublicChannelBySlug(slug: string): PublicChannelLandingPage | undefined {
	const page = getPublicChannelBySlug(slug);
	if (!page?.available) return undefined;
	return page;
}

export function listPublicChannelsForHub(): PublicChannelLandingPage[] {
	return [...PUBLIC_CHANNEL_LANDING_PAGES];
}

export function listAvailablePublicChannels(): PublicChannelLandingPage[] {
	return PUBLIC_CHANNEL_LANDING_PAGES.filter((page) => page.available);
}
