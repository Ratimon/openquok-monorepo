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

const LINKEDIN_DOCS_PATH = '/docs/social-integration/linkedin';
const linkedinLinks = buildChannelLandingFaqLinks('linkedin', LINKEDIN_DOCS_PATH);

export const linkedinChannel = {
	slug: 'linkedin',
	platformId: 'linkedin',
	platformLabel: 'LinkedIn',
	icon: icons.LinkedInGlyph.name,
	heroTitle: 'Show up credibly on LinkedIn when B2B buyers actually look you up',
	heroDescription:
		'Connect your personal profile and company Page, queue posts, slide carousels, follow-up comments, and video on the OpenQuok calendar, and publish with review — because executives evaluate vendors at your profile, not in the scroll feed.',
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
		'B2B social scheduling',
		...buildChannelMcpSeoKeywords('LinkedIn')
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
			subtitle: 'Post editor',
			title: 'Build PDF carousels on LinkedIn, schedule follow-up comments, before publish goes live',
			description:
				'Attach two or more images and OpenQuok builds a document carousel when the post publishes. Queue follow-up comments on your profile or Page with delays — all from the same composer draft you review on the kanban board.',
			bentoId: 'linkedin-post-editor',
			mediaOnRight: false
		},
		{
			subtitle: 'Cross-account plugs',
			title: 'Comment your company page or reshare from another LinkedIn account, widen reach with plugs, after publish goes live',
			description:
				'After go-live, widen reach without switching accounts. Enable cross-account comment or reshare plugs on the publishing channel, pick other connected profiles in your workspace, and set delays so engagement lands when buyers are online.',
			bentoId: 'linkedin-settings',
			mediaOnRight: true
		},
		{
			subtitle: 'Outcomes over vanity',
			title: 'Track Page impressions, spot buyer reach, scale what works',
			description:
				'Likes do not always mean pipeline — many buyers read without engaging. OpenQuok surfaces Page impressions, follower growth, and clicks so you can schedule more of what shows up when prospects compare vendors.',
			bentoId: 'linkedin-insights',
			mediaOnRight: false
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
				'Keep your profile and company Page active while you run deals. Schedule from one calendar.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-lime-400',
			title: 'B2B marketing teams',
			description:
				'Batch announcements, carousels, and exec posts. Review drafts on the kanban before publish.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-emerald-400',
			title: 'Agencies & RevOps',
			description:
				'Pipe LinkedIn drafts via API or MCP. Manage client profiles and Pages in separate workspaces.',
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
				`Yes. ${faqLink(publicFaqHref.signUp, 'Sign up for free')}, connect your personal profile or a company Page, write your post, and pick a time on the OpenQuok calendar. OpenQuok publishes through LinkedIn’s official API — text, images, video, and Page document carousels. Review drafts on the kanban board before anything goes live. See the ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide')}.`
		},
		{
			title: 'How do I schedule posts on a LinkedIn company Page?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, open a workspace, and choose Connect channel → LinkedIn Page. Complete OAuth and pick the company Page you administer. Personal profile connection is a separate channel (LinkedIn) with one OAuth step. You can connect both in one workspace and target each from the composer, tailoring captions per channel when needed. For self-hosted deployments, see the ${faqLinkSelfHostChannelSetup(LINKEDIN_DOCS_PATH, 'LinkedIn')}.`
		},
		{
			title: 'Can you schedule LinkedIn document carousels in OpenQuok?',
			description:
				'Yes. Attach two or more images (no video), enable Post as image carousel in composer settings, and OpenQuok combines them into a PDF document share at publish time — the native carousel format LinkedIn expects. Optional carousel title defaults to slides.'
		},
		{
			title: 'Can I schedule follow-up comments on LinkedIn?',
			description:
				`Yes. Add follow-up comment rows in the composer for LinkedIn profile or LinkedIn Page (or pass linkedin.replies or linkedin-page.replies via the API or CLI). Each comment is text only and publishes after the delay you set once the main post goes live. See ${faqLink(faqHrefDocs('creating-posts/threads-and-comments'), 'Threads and comments')}.`
		},
		{
			title: 'Can another LinkedIn account comment on or reshare my scheduled post?',
			description:
				`Yes. Open Settings on the publishing LinkedIn profile or Page channel. Enable Add comments by a different account for cross-account comments, or Add re-posters to reshare from another connected LinkedIn channel after publish. Set comment text, acting channels, and delay. See ${faqLink(faqHrefDocs('automations/cross-account-plugs'), 'Cross-account plugs')} or ${faqLink(faqHrefDocs('cli-examples/linkedin'), 'LinkedIn CLI examples')} for crossAccountPlugs.`
		},
		{
			title: 'What is the LinkedIn character limit in OpenQuok?',
			description:
				`OpenQuok enforces LinkedIn’s 3,000-character cap in the composer with a live preview. When you cross-post, each destination keeps its own caption and limit — edit LinkedIn copy separately from shorter networks such as Threads. Polish drafts in the ${faqLink(linkedinLinks.humanizer.toolChannel, 'LinkedIn humanizer tool')} before you schedule.`
		},
		{
			title: 'What can I publish to LinkedIn through OpenQuok?',
			description:
				`Text posts, single or multi-image posts, one MP4 video per post, PDF document carousels, text follow-up comments, company mentions, and cross-account comment or reshare plugs after publish. LinkedIn Page adds account and per-post analytics plus auto-repost plugs. Browse ${faqLink(linkedinLinks.playbooksTag, 'LinkedIn playbooks')} and ${faqLink(linkedinLinks.buildingBlocksTag, 'LinkedIn building blocks')} for format ideas.`
		},
		{
			title: 'How many LinkedIn posts can I queue in OpenQuok?',
			description:
				`Draft and schedule posts on the calendar as far ahead as you need — drag to reschedule or use recurring slots for a steady cadence. Monthly publish volume follows your workspace plan; see ${faqLink(publicFaqHref.pricing, 'Pricing')} for posts-per-month limits on each tier.`
		},
		{
			title: 'Does OpenQuok show LinkedIn Page analytics?',
			description:
				`Yes, for connected LinkedIn Page channels. Workspace analytics show Page views, follower gains, impressions, clicks, and engagement, plus per-post metrics on published Page content. Personal profile channels do not expose the same account-level insights API. Pull metrics from the ${faqLink(publicFaqHref.cliAnalytics, 'analytics CLI')} or dashboard.`
		},
		{
			title: buildChannelProgrammaticSchedulingFaqTitle('LinkedIn posts'),
			description: buildChannelProgrammaticSchedulingFaqDescription({
				connectPhrase: 'Connect LinkedIn profile or Page channels in our web dashboard',
				cliExamplesHref: publicFaqHref.cliLinkedin,
				cliExamplesLabel: 'LinkedIn CLI examples',
				suffix:
					'Pass postAsImagesCarousel for document carousels or linkedin.replies / linkedin-page.replies for follow-up comments.'
			})
		},
		{
			title: 'Can OpenQuok auto-repost LinkedIn Page posts?',
			description:
				'Yes. On a LinkedIn Page channel, open Plugs and set a like threshold for auto-repost. OpenQuok checks published posts automatically. It reshares from the Page when likes reach your threshold. This is separate from cross-posting to other networks.'
		},
		{
			title: 'Can I cross-post LinkedIn content to other channels?',
			description:
				`Yes. Compose once in OpenQuok and publish tailored versions to LinkedIn, Threads, X, Instagram, and other connected channels. Per-platform captions, media rules, and character limits apply separately for each destination. See every network on ${faqLink(publicFaqHref.channels, 'Supported channels')}.`
		},
		{
			title: 'Is there a free trial for LinkedIn scheduling?',
			description: buildChannelFreeTrialFaqDescription({
				connectPhrase: 'Connect LinkedIn profile and Page channels in our web dashboard'
			})
		}
	],
	docsPath: LINKEDIN_DOCS_PATH,
	available: true
} satisfies PublicChannelLandingPageViewModel;
