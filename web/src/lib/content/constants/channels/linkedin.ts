import { icons } from '$data/icons';

import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/types';
import { SHARED_CHANNEL_SEO_KEYWORDS } from '$lib/content/constants/channels/shared';

export const linkedinChannel = {
	slug: 'linkedin',
	platformId: 'linkedin',
	platformLabel: 'LinkedIn',
	icon: icons.LinkedInGlyph.name,
	heroTitle: 'Show up credibly on LinkedIn when B2B buyers actually look you up',
	heroDescription:
		'Connect your personal profile and company Page, queue posts, slide carousels, and video on the OpenQuok calendar, and publish with review — because executives evaluate vendors at your profile, not in the scroll feed.',
	metaTitle: 'LinkedIn Post Scheduler for B2B Teams',
	metaDescription:
		'Schedule LinkedIn profile and Page posts for B2B outreach. Queue thought leadership, PDF document carousels, and video through the official API — with approval before anything goes live.',
	hubDescription:
		'B2B thought leadership on profile and company Page — scheduled, reviewed, and ready when buyers research you.',
	keywords: [
		...SHARED_CHANNEL_SEO_KEYWORDS,
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
} satisfies PublicChannelLandingPageViewModel;
