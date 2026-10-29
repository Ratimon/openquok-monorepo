/**
 * Reddit channel landing (live). You draft and schedule in OpenQuok; you submit on reddit.com.
 * No server publish to Reddit. No OpenQuok post analytics row.
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
import { getRootPathPublicBrowserExtensionLanding } from '$lib/area-public/constants/getRootPathPublicBrowserExtensionLanding';
import { route } from '$lib/utils/path';

const REDDIT_DOCS_PATH = '/docs/social-integration/reddit';
const browserExtensionLandingHref = route(getRootPathPublicBrowserExtensionLanding());

export const redditChannel = {
	slug: 'reddit',
	platformId: 'reddit',
	platformLabel: 'Reddit',
	icon: icons.Reddit.name,
	heroTitle: 'Draft in OpenQuok\npost on reddit.com — lower ban risk',
	heroDescription:
		'Schedule drafts, autofill with browser extension, then you submit on reddit.com. No bot automation — you follow subreddit rules and avoid getting banned. Optional extension',
	metaTitle: 'Reddit Post Scheduler — Draft in OpenQuok, Submit on reddit.com',
	metaDescription:
		'Schedule Reddit drafts in OpenQuok. You post on reddit.com when due. Manual submit helps you follow subreddit rules and avoid getting banned. Optional browser extension help.',
	hubDescription:
		'Queue Reddit drafts. You submit on reddit.com when due — no server auto-post, lower ban risk.',
	keywords: [
		...SHARED_CHANNEL_SEO_KEYWORDS,
		'Reddit scheduler',
		'schedule Reddit posts',
		'Reddit content calendar',
		'Reddit markdown composer',
		'Reddit manual post',
		...buildChannelMcpSeoKeywords('Reddit')
	],
	featureSections: [
		{
			subtitle: 'Bulk scheduling',
			title: 'Schedule Reddit drafts\nbatch on the calendar\nweeks ahead',
			description:
				'Keep a steady Reddit rhythm without living in old.reddit. Put drafts on the OpenQuok calendar. Review agent and human copy on the kanban board before due time.',
			bentoId: 'reddit-bulk-scheduling',
			mediaOnRight: true
		},
		{
			subtitle: 'When a slot is due',
			title: 'Notified in OpenQuok\nyou still post on reddit.com\n peacefully',
			description:
				'The extension lists due posts — copy, open submit, autofill, download media, then mark complete. You click Post in your browser. OpenQuok does not auto-post to Reddit, so you follow community rules and lower ban risk.',
			bentoId: 'reddit-member-handoff',
			mediaOnRight: false
		},
		{
			subtitle: 'Markdown composer',
			title: 'Write draft as markdown\ncraft writing for your subreddit',
			description:
				'Use the markdown editor for body and links. Set community and post title in Settings when you want autofill to a specific submit URL.',
			bentoId: 'reddit-markdown-composer',
			mediaOnRight: true
		}
	],
	audienceSubtitle: 'Built for human-first Reddit posting',
	audienceTitle: 'Who draft and schedule Reddit with OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-orange-400',
			title: 'Founders & marketers',
			description:
				'Batch launch posts and AMA reminders. You post each one on reddit.com when it is due.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-emerald-400',
			title: 'Agent operators',
			description:
				'Let agents draft markdown via API or MCP. You control what goes live on Reddit.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-violet-400',
			title: 'People tired of AI slop',
			description:
				'You review every draft on the kanban before you post. You submit on reddit.com yourself — real voice, not bot spam.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	audienceTailoredCard: {
		iconName: icons.Reddit.name,
		iconClass: 'text-orange-500',
		title: 'Subreddit moderators',
		description:
			'Schedule announcements and recurring threads from one calendar. The extension can autofill the submit form — you still click Post.',
		containerClass: 'h-full min-h-[18rem]'
	},
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Reddit scheduling and posting on reddit.com yourself',
	faqDescription:
		'Why server-side Reddit schedulers get flagged, how OpenQuok draft-and-submit differs, and how to connect, use the extension, and post on reddit.com when each slot is due.',
	faqItems: [
		{
			title: 'How do I connect Reddit to OpenQuok?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, open a workspace, and choose ${faqLink(publicFaqHref.connectChannelsGuide, 'Connect channel')} → Reddit. Confirm the manual-channel notice — there is no Reddit OAuth connect step. For self-hosted deployments, see the ${faqLinkSelfHostChannelSetup(REDDIT_DOCS_PATH, 'Reddit')}.`
		},
		{
			title: 'Does OpenQuok publish to Reddit for me?',
			description:
				`No. When a post is due, OpenQuok reminds you to finish it on reddit.com. You fill in the submit form and click Post yourself. The optional ${faqLink(faqHrefDocs('installation/chrome-extension'), 'browser extension')} (${faqLink(browserExtensionLandingHref, 'product overview')}) can copy, open submit, autofill, and download media — it does not click Post for you. See the ${faqLinkSelfHostChannelSetup(REDDIT_DOCS_PATH, 'Reddit')}.`
		},
		{
			title: 'Why do third-party Reddit schedulers get accounts banned?',
			description:
				'Many tools post from the vendor server with your OAuth token. Reddit limits API bursts and flags spam, duplicate posts, and bot-like timing. Each subreddit sets karma, account age, and frequency rules. Unattended scheduling often ends in removed posts or suspended accounts.'
		},
		{
			title: 'Why does OpenQuok avoid server-side Reddit publishing?',
			description:
				'OpenQuok stores drafts in your workspace only. When a post is due, you submit on reddit.com in your browser. We do not publish from our backend. The optional extension can copy, open submit, and autofill — you still click Post.'
		},
		{
			title: 'Can OpenQuok still get my Reddit account banned?',
			description:
				'Yes, if you break Reddit or subreddit rules. OpenQuok does not guarantee immunity. We avoid auto-post by server or bot spam. you still need to control each draft and when to submit on reddit.com.'
		},
		{
			title: buildChannelProgrammaticSchedulingFaqTitle('Reddit posts'),
			description: buildChannelProgrammaticSchedulingFaqDescription({
				connectPhrase: 'Add Reddit as a manual channel in the dashboard',
				cliExamplesHref: faqHrefDocs('cli-examples/reddit'),
				cliExamplesLabel: 'Reddit CLI examples',
				suffix:
					'Pass subreddit and title in Reddit provider settings when you want autofill to a specific community. Each post stays scheduled until you submit it on reddit.com.'
			})
		},
		{
			title: 'Is there a free trial for Reddit scheduling?',
			description: buildChannelFreeTrialFaqDescription({
				connectPhrase: 'Add Reddit as a manual channel in the dashboard',
				activityPhrase: 'schedule Reddit drafts, and explore API access'
			})
		}
	],
	docsPath: REDDIT_DOCS_PATH,
	available: true
} satisfies PublicChannelLandingPageViewModel;
