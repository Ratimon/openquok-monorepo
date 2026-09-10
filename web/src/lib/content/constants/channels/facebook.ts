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

const FACEBOOK_DOCS_PATH = '/docs/social-integration/facebook';
const facebookLinks = buildChannelLandingFaqLinks('facebook', FACEBOOK_DOCS_PATH);

export const facebookChannel = {
	slug: 'facebook',
	platformId: 'facebook',
	platformLabel: 'Facebook',
	icon: icons.FacebookGlyph.name,
	heroTitle: 'Schedule Facebook posts, Reels, Stories, and follow-up comments you approve',
	heroDescription:
		'Connect a Facebook Page, queue feed posts, photos, link previews, MP4 Reels, Stories, and follow-up comments from the OpenQuok calendar or your AI agents, and publish through the official Meta API',
	metaTitle: 'Facebook Page Post, Reel & Story Scheduler',
	metaDescription:
		'Schedule Facebook Page posts, Reels, Stories, and follow-up comments with OpenQuok. Connect your Page, queue text, photos, MP4 video, and Stories from the calendar or API, and keep human approval in the loop.',
	hubDescription:
		'Page feed posts, MP4 Reels, Stories, link-preview cards, and scheduled follow-up comments — built for Facebook Pages, not personal profiles.',
	keywords: [
		...SHARED_CHANNEL_SEO_KEYWORDS,
		'Facebook post scheduler',
		'Facebook Reel scheduler',
		'Facebook Story scheduler',
		'Facebook Page scheduling',
		'schedule Facebook posts',
		'schedule Facebook Reels',
		'Facebook content calendar',
		'Meta Graph API scheduler',
		...buildChannelMcpSeoKeywords('Facebook')
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
			subtitle: 'Post editor',
			title: 'Publish Reels from MP4, schedule follow-up comments, add link previews',
			description:
				'Attach a single MP4 and OpenQuok publishes it to your Page through Meta’s video endpoint — the same path Facebook uses to surface Reels. Add an optional URL on text posts for link-preview cards, and queue follow-up comments in the composer with delays.',
			bentoId: 'facebook-post-editor',
			mediaOnRight: false
		},
		{
			subtitle: 'Facebook settings',
			title: 'Switch post type, publish Stories, tune Page options per post',
			description:
				'Set post type to feed, Reel, or Story before publish. Attach images or MP4 for Stories, and tune Page-specific options from channel settings — from the dashboard or via provider Settings in the API.',
			bentoId: 'facebook-settings',
			mediaOnRight: true
		},
		{
			subtitle: 'Insights',
			title: 'See what resonates on your Page, track engagement insights, and scale correctly',
			description:
				'Track post-level impressions, reactions, and clicks — plus Page-level video views — from connected Facebook Pages inside OpenQuok analytics, so you can schedule more of what already works.',
			bentoId: 'facebook-insights',
			mediaOnRight: false
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
				'Schedule Page posts, Reels, and Stories without living in Business Suite. Publish through the official Graph API.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-lime-400',
			title: 'Marketing teams',
			description:
				'Batch weeks of Page content and review drafts before anything goes live.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-emerald-400',
			title: 'Agencies',
			description:
				'Manage multiple Facebook Pages in one workspace. Schedule at scale and track insights per brand.',
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
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, open a workspace, and choose Connect channel → Facebook Page. Complete Meta OAuth and pick the Page you manage. OpenQuok Cloud registers the Meta app for you. For self-hosted deployments, see the ${faqLinkSelfHostChannelSetup(FACEBOOK_DOCS_PATH, 'Facebook')}.`
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
				`Attach a single MP4 when composing a Facebook Page post. OpenQuok uploads it through Meta’s Page video API; Facebook surfaces eligible uploads as Reels on your Page. Caption text becomes the video description. Size cover art in the ${faqLink(facebookLinks.photoEditor.toolChannel, 'Facebook photo editor')} before you attach media.`
		},
		{
			title: buildChannelProgrammaticSchedulingFaqTitle('Facebook posts'),
			description: buildChannelProgrammaticSchedulingFaqDescription({
				connectPhrase: 'Connect a Facebook Page in our web dashboard',
				cliExamplesHref: publicFaqHref.cliFacebook,
				cliExamplesLabel: 'Facebook CLI examples',
				suffix: 'Pass facebook.replies for follow-up comments on scheduled posts and Reels.'
			})
		},
		{
			title: 'Does OpenQuok support link previews on Facebook?',
			description:
				'Yes. When you include a URL in a text-only Facebook Page post, OpenQuok passes link-preview settings supported by the integration so shared links render with the right metadata. Link URLs are ignored when photos or video are attached.'
		},
		{
			title: 'Can I schedule follow-up comments on Facebook?',
			description:
				`Yes. Add follow-up comments in the composer (or pass facebook.replies via the API or CLI). Each comment publishes as text or with one image after the delay you set once the main post goes live. See ${faqLink(faqHrefDocs('creating-posts/threads-and-comments'), 'Threads and comments')}.`
		},
		{
			title: 'Does OpenQuok support Facebook Stories?',
			description:
				`Yes. Set post type to Story in the composer or pass ${faqLink(faqHrefDocs('cli-examples/facebook'), 'post_type: story')} via the API or CLI. Attach at least one image or MP4. Each attachment publishes as its own Story on your Page. Link URLs and follow-up comments do not apply to Stories.`
		},
		{
			title: 'Is there a free trial for Facebook scheduling?',
			description: buildChannelFreeTrialFaqDescription({
				connectPhrase: 'Connect a Facebook Page in our web dashboard',
				activityPhrase: 'schedule posts and Reels, and explore API access'
			})
		}
	],
	docsPath: FACEBOOK_DOCS_PATH,
	available: false
} satisfies PublicChannelLandingPageViewModel;
