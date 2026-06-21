import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

import type { PublicChannelFeatureBentoId } from '$lib/content/constants/publicChannelFeatureBentoConfig';
import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
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
	/** Hub card blurb on `/channels`; falls back to `metaDescription` when omitted. */
	hubDescription?: string;
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
	icon: icons.FacebookGlyph.name,
	heroTitle: 'Schedule Facebook posts and Reels you approve',
	heroDescription:
		'Connect a Facebook Page, queue feed posts, photos, link previews, and MP4 Reels from the OpenQuok calendar or your AI agents, and publish through the official Meta API',
	metaTitle: 'Facebook Page Post & Reel Scheduler',
	metaDescription:
		'Schedule Facebook Page posts and Reels with OpenQuok. Connect your Page, queue text, photos, and MP4 video from the calendar or API, and keep human approval in the loop.',
	hubDescription:
		'Page feed posts, MP4 Reels, and link-preview cards — built for Facebook Pages, not personal profiles.',
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
			title: 'Publish Reels from MP4, link previews effortlessly, in one place',
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
				'Sign in to Facebook and OpenQuok in your browser, then open a workspace and choose Connect channel → Facebook Page. Complete Meta OAuth, pick the Page you manage, and OpenQuok stores the connection for scheduling and analytics.'
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
	heroTitle: 'Schedule Threads posts, media, and follow-up replies you approve',
	heroDescription:
		'Connect a Meta Threads profile, queue text and media on the calendar, schedule follow-up replies with delays, and publish through the official Meta API — from the dashboard, public API, or CLI.',
	metaTitle: 'Threads Post Scheduler',
	metaDescription:
		'Schedule Threads posts with OpenQuok. Connect Meta Threads, queue text and media, chain follow-up replies, and publish from the dashboard, API, or CLI.',
	hubDescription:
		'500-character posts with media and scheduled follow-up reply chains — conversation-first text on Meta Threads.',
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
			title: 'Attach image or video, schedule follow-up replies, in one place',
			description:
				'Create post within Threads\'s 500-character limit, attach a single image or video (or a multi-media carousel), and queue follow-up replies with per-reply delays before the thread goes live.',
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
	available: true
};

const INSTAGRAM_CHANNEL: PublicChannelLandingPage = {
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
	available: true
};

const YOUTUBE_CHANNEL: PublicChannelLandingPage = {
	slug: 'youtube',
	platformId: 'youtube',
	platformLabel: 'YouTube',
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
};

const TIKTOK_CHANNEL: PublicChannelLandingPage = {
	slug: 'tiktok',
	platformId: 'tiktok',
	platformLabel: 'TikTok',
	icon: icons.TikTok.name,
	heroTitle: 'Schedule TikTok videos and carousels you approve',
	heroDescription:
		'Connect a TikTok account, queue vertical videos or image carousels on the calendar, set privacy and posting method, and publish through the official TikTok APIs — from the dashboard, public API, or CLI.',
	metaTitle: 'TikTok Video & Photo Scheduler',
	metaDescription:
		'Schedule TikTok videos and photo carousels with OpenQuok. Connect your account, queue MP4 or image posts with privacy and interaction settings, and publish from one workspace.',
	hubDescription:
		'Vertical video and photo carousels — direct publish or queue to your TikTok inbox to add trending audio.',
	keywords: [
		'TikTok post scheduler',
		'schedule TikTok videos',
		'TikTok content calendar',
		'TikTok API scheduler',
		'TikTok photo carousel scheduler',
		'schedule TikTok posts'
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
			subtitle: 'Trending audio',
			title: 'Queue carousels to your TikTok inbox, pick trending audio in the app, publish quickly',
			description:
				'Trending tracks lift reach, but schedulers cannot attach them — and posts with a manual sound pick often get more views from TikTok. Queue carousels and clips to your inbox, choose trending audio in the app, and publish in about a minute a day without rebuilding every post by hand.',
			bentoId: 'tiktok-compose-settings',
			mediaOnRight: false
		},
		{
			subtitle: 'Insights',
			title: 'See what resonates on TikTok, track followers and engagement, and iterate',
			description:
				'Track followers, likes, video counts, and recent video engagement from connected TikTok accounts inside OpenQuok analytics — so you can schedule more of what already works.',
			bentoId: 'tiktok-insights',
			mediaOnRight: true
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
				'Ship your product while TikTok grows. Queue ai-generated carousels as inbox drafts on the calendar — add trending audio and publish in about a minute a day.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-lime-400',
			title: 'Ticktoker',
			description:
				'Batch a week of TikTok content in one sitting, review drafts before they publish, and track follower growth alongside your other channels.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-emerald-400',
			title: 'Developers & agents',
			description:
				'Pipe TikTok drafts from your backend via the public API or CLI — including privacy and posting-method settings — while you keep approval control in the dashboard.',
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
				'Sign in to TikTok and OpenQuok in your browser, then open a workspace and choose Connect channel → TikTok. Complete TikTok OAuth, and OpenQuok stores the connection for scheduling and analytics.'
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
				'Yes. Schedule a single MP4 video or one or more images (JPEG, PNG, or WEBP) as a photo carousel. Add an optional carousel title, turn on auto-add music for image posts, and queue the post on the calendar.'
		},
		{
			title: 'Can I add trending audio when scheduling TikTok?',
			description:
				'Not through direct publish. TikTok’s API does not let third-party schedulers attach trending sounds to clips. Use the inbox upload method to queue carousels or videos to your TikTok inbox, then pick trending audio and publish inside the TikTok app in about a minute.'
		},
		{
			title: 'Can I schedule TikTok posts from an AI agent or script?',
			description:
				'Yes. After connecting TikTok, use the public API or CLI with your workspace token to create scheduled posts with video or image media and flat or nested tiktok provider settings.'
		},
		{
			title: 'Can I cross-post from TikTok to other channels eg. Facebook Reels or YouTube Shorts?',
			description:
				'Yes. Publish the same content to TikTok, Instagram, YouTube, and etc. from one workflow. Per-platform settings are applied separately for each destination.'
		},
		{
			title: 'Can I repeat-schedule TikTok posts on a cadence?',
			description:
				'Yes. Set a repeat interval from one day up to one month when scheduling. After a TikTok post publishes, OpenQuok queues the next copy on that cadence so you can recycle evergreen clips and carousels without rebuilding each post.'
		},
		{
			title: 'Can my team review TikTok drafts before they publish?',
			description:
				'Yes. Save TikTok posts as drafts, review them on the kanban board, and move them to Scheduled when you are ready. Workspaces keep each brand’s TikTok account and content separate when you manage multiple clients.'
		},
		{
			title: 'What TikTok analytics does OpenQuok track?',
			description:
				'OpenQuok pulls account-level TikTok metrics — followers, likes, and video count — plus aggregated views, likes, comments, and shares from your recent videos. Per-post analytics return views, likes, comments, and shares once the row is linked to a TikTok video id (`posts:connect` after inbox uploads).'
		},
		{
			title: 'Is there a free trial for TikTok scheduling?',
			description:
				'Yes. New workspaces can start on OpenQuok’s free trial, connect TikTok, and schedule posts during the trial period before choosing a paid plan.'
		}
	],
	docsPath: '/docs/social-integration/tiktok',
	available: true
};

const LINKEDIN_CHANNEL: PublicChannelLandingPage = {
	slug: 'linkedin',
	platformId: 'linkedin',
	platformLabel: 'LinkedIn',
	icon: icons.LinkedIn.name,
	heroTitle: 'Show up credibly on LinkedIn when B2B buyers actually look you up',
	heroDescription:
		'Connect your personal profile and company Page, queue posts, slide carousels, and video on the OpenQuok calendar, and publish with review — because executives evaluate vendors at your profile, not in the scroll feed.',
	metaTitle: 'LinkedIn Post Scheduler for B2B Teams',
	metaDescription:
		'Schedule LinkedIn profile and Page posts for B2B outreach. Queue thought leadership, PDF document carousels, and video through the official API — with approval before anything goes live.',
	hubDescription:
		'B2B thought leadership on profile and company Page — scheduled, reviewed, and ready when buyers research you.',
	keywords: [
		'LinkedIn post scheduler',
		'LinkedIn Page scheduler',
		'schedule LinkedIn posts',
		'LinkedIn content calendar',
		'B2B LinkedIn marketing',
		'LinkedIn document carousel scheduler',
		'B2B social scheduling'
	],
	featureSections: [
		{
			subtitle: 'Decision-time presence',
			title: 'Queue profile and Page posts, batch B2B content, weeks ahead',
			description:
				'B2B buyers check your profile and company Page before they meet — not the feed. Queue founder posts, Page updates, and carousels on the OpenQuok calendar so both stay active when prospects research you.',
			bentoId: 'linkedin-bulk-scheduling',
			mediaOnRight: true
		},
		{
			subtitle: 'B2B content formats',
			title: 'Craft PDF carousels, publish to your Page, reach buyers off the feed',
			description:
				'Posting volume alone does not win B2B deals — format and credibility matter. Attach two or more images and OpenQuok builds a LinkedIn document carousel when the post publishes. Add company mentions, and queue follow-up comments or reshares from another connected LinkedIn account after the post goes live.',
			bentoId: 'linkedin-compose-settings',
			mediaOnRight: false
		},
		{
			subtitle: 'Outcomes over vanity',
			title: 'Track Page impressions, spot buyer reach, scale what works',
			description:
				'Likes do not always mean pipeline — many buyers read without engaging. OpenQuok surfaces Page impressions, follower growth, and clicks so you can schedule more of what shows up when prospects compare vendors.',
			bentoId: 'linkedin-insights',
			mediaOnRight: true
		}
	],
	audienceSubtitle: 'Built for B2B go-to-market',
	audienceTitle: 'Who schedules LinkedIn with OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-rose-400',
			title: 'Founders & sales leaders',
			description:
				'Your profile is a sales asset, not an online resume. Keep personal and company Page content aligned and scheduled while you run deals.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-lime-400',
			title: 'B2B marketing teams',
			description:
				'Batch Page announcements, slide carousels, and executive posts on one calendar. Review drafts on the kanban board before publish.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-emerald-400',
			title: 'Agencies & RevOps',
			description:
				'Manage client profile and Page channels in separate workspaces. Pipe LinkedIn drafts from agents or CRM automations via the API while approvers sign off in the dashboard.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'LinkedIn scheduling for B2B, answered',
	faqDescription:
		'Scheduling, company Pages, document carousels, analytics, and API access — what OpenQuok supports for LinkedIn today.',
	faqItems: [
		{
			title: 'Can you schedule LinkedIn posts with OpenQuok?',
			description:
				'Yes. Connect your personal profile or a company Page, write your post, and pick a time on the OpenQuok calendar. OpenQuok publishes through LinkedIn’s official API — text, images, video, and Page document carousels. Review drafts on the kanban board before anything goes live.'
		},
		{
			title: 'How do I schedule posts on a LinkedIn company Page?',
			description:
				'Choose Connect channel → LinkedIn Page, complete OAuth, and pick the company Page you administer. Personal profile connection is a separate channel (LinkedIn) with one OAuth step. You can connect both in one workspace and target each from the composer, tailoring captions per channel when needed.'
		},
		{
			title: 'Can you schedule LinkedIn document carousels in OpenQuok?',
			description:
				'Yes. Attach two or more images (no video), enable Post as image carousel in composer settings, and OpenQuok combines them into a PDF document share at publish time — the native carousel format LinkedIn expects. Optional carousel title defaults to slides.'
		},
		{
			title: 'What is the LinkedIn character limit in OpenQuok?',
			description:
				'OpenQuok enforces LinkedIn’s 3,000-character cap in the composer with a live preview. When you cross-post, each destination keeps its own caption and limit — edit LinkedIn copy separately from shorter networks such as Threads.'
		},
		{
			title: 'What can I publish to LinkedIn through OpenQuok?',
			description:
				'Text posts, single or multi-image posts, one MP4 video per post, PDF document carousels, text follow-up comments, company mentions, and cross-account comment or reshare plugs after publish. LinkedIn Page adds account and per-post analytics plus auto-repost plugs. LinkedIn articles and direct PDF file uploads are not supported today.'
		},
		{
			title: 'How many LinkedIn posts can I queue in OpenQuok?',
			description:
				'Draft and schedule posts on the calendar as far ahead as you need — drag to reschedule or use recurring slots for a steady cadence. Monthly publish volume follows your workspace plan; see pricing for posts-per-month limits on each tier.'
		},
		{
			title: 'Does OpenQuok show LinkedIn Page analytics?',
			description:
				'Yes, for connected LinkedIn Page channels. Workspace analytics show Page views, follower gains, impressions, clicks, and engagement, plus per-post metrics on published Page content. Personal profile channels do not expose the same account-level insights API.'
		},
		{
			title: 'Can I schedule LinkedIn from the API, CLI, or an AI agent?',
			description:
				'Yes. After connecting a channel, use the public API or openquok CLI with posts:create and integration IDs for linkedin or linkedin-page. Pass provider settings such as postAsImagesCarousel for document carousels. Agents can draft and queue posts; keep human approval in the dashboard when content represents your brand.'
		},
		{
			title: 'Can OpenQuok auto-repost LinkedIn Page posts?',
			description:
				'LinkedIn Page channels support auto-repost plugs: when a post reaches a like threshold you set, OpenQuok can reshare it from the Page (up to three times every six hours). Configure under channel Plugs. This is separate from cross-posting to other networks.'
		},
		{
			title: 'Can I cross-post LinkedIn content to other channels?',
			description:
				'Yes. Compose once in OpenQuok and publish tailored versions to LinkedIn, Threads, X, Instagram, and other connected channels. Per-platform captions, media rules, and character limits apply separately for each destination.'
		},
		{
			title: 'Is there a free trial for LinkedIn scheduling?',
			description:
				'Yes. New workspaces get a 7-day free trial — connect LinkedIn profile and Page channels, schedule posts, and explore API access before choosing a paid plan.'
		}
	],
	docsPath: '/docs/social-integration/linkedin',
	available: true
};

const X_CHANNEL: PublicChannelLandingPage = {
	slug: 'x',
	platformId: 'x',
	platformLabel: 'X',
	icon: icons.X.name,
	heroTitle: 'Schedule X posts, threads, and media you approve before they go live',
	heroDescription:
		'Connect an X profile with OAuth, queue tweets and thread replies on the calendar, tune who can reply and community settings per post, and publish from the dashboard, public API, or CLI.',
	metaTitle: 'X Post Scheduler',
	metaDescription:
		'Schedule X posts with OpenQuok. Connect X with OAuth, queue text and media, chain thread replies, and publish from the dashboard, API, or CLI.',
	hubDescription:
		'Weighted 280-character tweets (4000 for Verified), up to four images or one video, and scheduled thread replies.',
	keywords: [
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
			subtitle: 'Compose settings',
			title: 'Tune reply audience, community, thread replies, in one composer',
			description:
				'Set who can reply, optional community URLs, AI and partnership labels, and queue text-only thread replies with per-reply delays — all from the composer or via providerSettings in the API.',
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
				'Create an X developer app (Native App type with Read and Write), set the OAuth redirect to /integration/oauth/x, add X_API_KEY and X_API_SECRET to the backend env, then connect from your workspace.'
		},
		{
			title: 'Can I schedule X posts with images or video?',
			description:
				'Yes. Attach up to four images or one video when composing an X post in OpenQuok. The composer validates media rules before publish.'
		},
		{
			title: 'Does OpenQuok respect X character limits?',
			description:
				'Yes. The composer uses weighted character counting (280 for standard accounts, 4000 when Verified is enabled on the channel). Check the preview before scheduling.'
		},
		{
			title: 'Can I schedule thread replies in advance?',
			description:
				'Yes. Add follow-up replies in the composer (or pass x.replies via the API or CLI). Each reply publishes as a quote-less reply after the delay you set once the root tweet goes live.'
		},
		{
			title: 'Can I schedule X from the API or CLI?',
			description:
				'Yes. Use integration UUIDs from your workspace in the create-post API or CLI commands. Thread replies and compose settings go under providerSettingsByIntegrationId when needed.'
		},
		{
			title: 'Is X scheduling included in the free trial?',
			description:
				'Yes. Connect X during the trial, schedule posts, and explore API access before upgrading to a paid plan that matches your channel and workspace limits.'
		}
	],
	docsPath: '/docs/social-integration/x',
	available: true
};

/** Coming-soon entries appear on the hub but do not have detail pages yet. */
const COMING_SOON_CHANNELS: PublicChannelLandingPage[] = [];

export const PUBLIC_CHANNEL_LANDING_PAGES: readonly PublicChannelLandingPage[] = [
	FACEBOOK_CHANNEL,
	THREADS_CHANNEL,
	INSTAGRAM_CHANNEL,
	YOUTUBE_CHANNEL,
	TIKTOK_CHANNEL,
	LINKEDIN_CHANNEL,
	X_CHANNEL,
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
