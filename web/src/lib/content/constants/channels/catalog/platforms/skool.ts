/**
 * Skool channel landing (`available: false` until store extension + go-live flip).
 *
 * Extensions Hub listing tag: create in `/secret-admin/catalog-manager/tags` (Name **Skool** → slug `skool`).
 * Do not SQL-seed `listing_tags`. Tag groups: **Social platforms**, **Text**.
 */
import { icons } from '$data/icons';

import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/catalog/types';
import {
	buildChannelMcpSeoKeywords,
	SHARED_CHANNEL_SEO_KEYWORDS
} from '$lib/content/constants/channels/catalog/shared';
import {
	buildChannelFreeTrialFaqDescription,
	buildChannelProgrammaticSchedulingFaqDescription,
	buildChannelProgrammaticSchedulingFaqTitle,
	faqHrefDocs,
	faqLink,
	faqLinkSelfHostChannelSetup,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';

const SKOOL_DOCS_PATH = '/docs/social-integration/skool';

export const skoolChannel = {
	slug: 'skool',
	platformId: 'skool',
	platformLabel: 'Skool',
	icon: icons.SkoolGlyph.name,
	heroTitle: 'Schedule Skool community posts you approve before they go live',
	heroDescription:
		'Keep your group active without living in the feed. Queue posts to the right Skool group, set title and label in the composer, and approve on the kanban board before OpenQuok publishes. Connect uses the OpenQuok browser extension while you are signed in on skool.com — there is no Skool OAuth app for operators to configure.',
	metaTitle: 'Skool Community Post Scheduler — Groups, Labels, and Follow-ups',
	metaDescription:
		'Schedule Skool community posts with OpenQuok. Connect with the browser extension while signed in on skool.com. Queue posts with title, group, and label. Add follow-up comments when the group allows. Approve from the dashboard, API, CLI, or MCP.',
	hubDescription:
		'Schedule Skool community posts with title, group, and label. Connect with the OpenQuok browser extension — no operator OAuth app.',
	keywords: [
		...SHARED_CHANNEL_SEO_KEYWORDS,
		'Skool scheduler',
		'schedule Skool posts',
		'Skool community calendar',
		'Skool group posts',
		'Skool content calendar',
		'Skool browser extension connect',
		'community post scheduler',
		...buildChannelMcpSeoKeywords('Skool')
	],
	featureSections: [
		{
			subtitle: 'Bulk scheduling',
			title: 'Queue Skool posts, batch drafts on the calendar, weeks ahead',
			description:
				'Community momentum fades when you only post in real time. Put Skool posts on the OpenQuok calendar for the groups you run. Review agent and human drafts on the kanban board. Move them to Scheduled when you are ready.',
			bentoId: 'skool-bulk-scheduling',
			mediaOnRight: true
		},
		{
			subtitle: 'Group settings',
			title: 'Pick the Skool group, set title and category, before you approve',
			description:
				'Choose the target group from your connected account. Add a post title and category in Settings. Attach images when your group allows media. Preview the card before you queue the slot.',
			bentoId: 'skool-settings',
			mediaOnRight: false
		},
		{
			subtitle: 'Follow-up comments',
			title: 'Add Skool comments after the post, set delays, keep the thread',
			description:
				'When the group allows it, add follow-up comment rows in the composer with delays and optional media. OpenQuok publishes the main post first. Then it posts each comment on your connected account.',
			bentoId: 'skool-follow-ups',
			mediaOnRight: true
		}
	],
	audienceSubtitle: 'Built for community builders',
	audienceTitle: 'Who schedules Skool with OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-amber-400',
			title: 'Course & community owners',
			description:
				'Keep groups warm with a steady calendar. Approve every post before it hits the feed.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-lime-400',
			title: 'Coaches & creators',
			description:
				'Batch announcements and prompts for multiple groups. Reuse drafts from agents without manual copy-paste.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-emerald-400',
			title: 'Agencies',
			description:
				'Connect client Skool accounts from the dashboard with the extension. Pipe drafts via API or MCP after connect.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Skool scheduling, extension connect, and groups',
	faqDescription:
		'Browser extension connect, group and label settings, follow-up comments, and automation — what OpenQuok supports for Skool.',
	faqItems: [
		{
			title: 'How do I connect Skool to OpenQuok?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, install the ${faqLink(faqHrefDocs('installation/chrome-extension'), 'OpenQuok browser extension')}, and sign in on skool.com in the same Chrome profile. Open a workspace and follow the ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide')} → browser extension → Skool. OpenQuok validates your session and stores it encrypted on the server. For self-hosted deployments, see the ${faqLinkSelfHostChannelSetup(SKOOL_DOCS_PATH, 'Skool')}.`
		},
		{
			title: 'Do I need the OpenQuok browser extension for Skool?',
			description:
				`Yes. Skool has no public OAuth flow for third-party schedulers. You connect while logged in on skool.com. The extension reads required session cookies only when you approve the connect flow in Add Channel. See ${faqLink(faqHrefDocs('installation/chrome-extension'), 'browser extension install')} and the ${faqLinkSelfHostChannelSetup(SKOOL_DOCS_PATH, 'Skool')}.`
		},
		{
			title: 'Can I connect Skool with an invite link?',
			description:
				`No. Invite links work only for OAuth redirect networks. Skool is excluded. Each member connects from the dashboard with the extension, or signs in to OpenQuok and adds Skool themselves. See ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide')}.`
		},
		{
			title: 'What do I set before I schedule a Skool post?',
			description:
				`Use the standard caption editor for the body. In Settings, set a title, pick a group, and optionally a label. Groups load from your connected account. See ${faqLink(faqHrefDocs('platforms/per-channel-settings'), 'per-channel settings')} and the ${faqLinkSelfHostChannelSetup(SKOOL_DOCS_PATH, 'Skool')}.`
		},
		{
			title: 'Can I schedule follow-up comments on Skool?',
			description:
				`When the group allows it, add follow-up rows in the composer with delays and optional media. OpenQuok publishes the main post first, then each comment. See ${faqLink(faqHrefDocs('creating-posts/threads-and-comments'), 'threads and follow-up comments')}.`
		},
		{
			title: buildChannelProgrammaticSchedulingFaqTitle('Skool posts'),
			description: buildChannelProgrammaticSchedulingFaqDescription({
				connectPhrase:
					'Connect Skool in our web dashboard with the browser extension while signed in on skool.com',
				cliExamplesHref: faqHrefDocs('cli-examples'),
				cliExamplesLabel: 'CLI examples',
				suffix: 'Pass title, group, and label in Skool provider settings when you schedule from the API or CLI.'
			})
		},
		{
			title: 'Is there a free trial for Skool scheduling?',
			description: buildChannelFreeTrialFaqDescription({
				connectPhrase:
					'Connect Skool in our web dashboard with the browser extension while signed in on skool.com',
				activityPhrase: 'schedule community posts, and explore API access'
			})
		}
	],
	docsPath: SKOOL_DOCS_PATH,
	available: false
} satisfies PublicChannelLandingPageViewModel;
