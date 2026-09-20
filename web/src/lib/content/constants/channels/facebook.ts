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
	heroTitle: 'Schedule Facebook posts, Reels, Stories, and follow-up comments',
	heroDescription:
		'Keep your Facebook Page active without living in Meta Business Suite. Queue feed posts, photos, Reels, Stories, and follow-up comments from the OpenQuok calendar or your agents — you approve every post before publish.',
	metaTitle: 'Facebook Page Post, Reel & Story Scheduler',
	metaDescription:
		'Schedule Facebook Page posts, Reels, Stories, and follow-up comments with OpenQuok. Queue from the calendar or API, publish through Meta’s official API, and approve every post before it goes live.',
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
			subtitle: 'Plan weeks ahead',
			title: 'Queue Facebook posts, schedule Reels in bulk, weeks ahead',
			description:
				'Batch feed posts, carousels, and MP4 Reels onto your calendar for days or weeks ahead. Your Page stays active whether you compose by hand or pipe drafts in from an agent.',
			bentoId: 'facebook-bulk-scheduling',
			mediaOnRight: true
		},
		{
			subtitle: 'Reels and link previews',
			title: 'Publish Reels from MP4, schedule follow-up comments, add link previews',
			description:
				'Upload one MP4 and OpenQuok publishes it as a Reel on your Page. Add a URL on text posts for link-preview cards, and queue follow-up comments with delays — all in one composer draft.',
			bentoId: 'facebook-post-editor',
			mediaOnRight: false
		},
		{
			subtitle: 'Stories and post types',
			title: 'Pick feed, Reel, or Story, publish from one composer, set options per post',
			description:
				'Choose feed, Reel, or Story before you schedule. Attach images or MP4 for Stories and adjust Page options from channel settings — in the dashboard or through the public API.',
			bentoId: 'facebook-settings',
			mediaOnRight: true
		},
		{
			subtitle: 'See what works',
			title: 'See what resonates on your Page, track impressions and clicks, double down on winners',
			description:
				'Track post impressions, reactions, and clicks plus Page video views in OpenQuok analytics, so you can schedule more of what already works.',
			bentoId: 'facebook-insights',
			mediaOnRight: false
		}
	],
	audienceSubtitle: 'For Facebook Page owners',
	audienceTitle: 'Who schedules Facebook with OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-rose-400',
			title: 'Page owners',
			description:
				'Schedule Page posts, Reels, and Stories without switching between Business Suite tabs. Review drafts on one calendar before anything goes live.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-lime-400',
			title: 'Marketing teams',
			description:
				'Batch weeks of Page content and review drafts before anything goes live, so campaigns ship on time without weekend scrambles.',
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
		'Answers about connecting a Facebook Page, scheduling posts and Reels, Stories, and follow-up comments with OpenQuok.',
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
				`Yes. Add follow-up comments in the composer (or pass facebook.replies via the API or CLI). Each comment publishes as text or with one image after the delay you set once the main post goes live. See the ${faqLink(faqHrefDocs('creating-posts/threads-and-comments'), 'follow-up comments guide')}.`
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
	available: true
} satisfies PublicChannelLandingPageViewModel;
