import { icons } from '$data/icons';

import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/types';
import { SHARED_CHANNEL_SEO_KEYWORDS } from '$lib/content/constants/channels/shared';

export const facebookChannel = {
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
		...SHARED_CHANNEL_SEO_KEYWORDS,
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
				'Schedule feed posts, photos, and MP4 Reels on your Facebook Page without living in Meta Business Suite. Publish content through the official Graph API.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-lime-400',
			title: 'Marketing teams',
			description:
				'Batch weeks of Page content, and review everything before it goes live — from the dashboard or your existing workflows.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-emerald-400',
			title: 'Agencies',
			description:
				'Manage multiple Facebook Pages. Connect each Page once, schedule at scale, and track Page insights without mixing brands.',
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
} satisfies PublicChannelLandingPageViewModel;
