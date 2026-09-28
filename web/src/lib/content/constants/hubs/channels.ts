import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import {
	appendPublicGeneralFaqItems,
	PUBLIC_CHANNELS_HUB_FAQ_ITEM_IDS
} from '$lib/content/constants/publicFaqConfig';

import {
	buildChannelFaqLinks,
	faqHrefDocs,
	faqLink,
	faqLinkSelfHostChannelSetup,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';

const YOUTUBE_CHANNEL_LINKS = buildChannelFaqLinks('youtube', '/docs/social-integration/youtube');

export type PublicChannelsHubFaqSection = {
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: readonly PublicFaqItem[];
};

export const PUBLIC_CHANNELS_HUB_FAQ = {
	faqSubtitle: 'Channels FAQ',
	faqTitle: 'Supported Channels, answered',
	faqDescription:
		'How to connect networks on OpenQuok Cloud, which channel pages cover, and when self-host operator setup applies.',
	faqItems: appendPublicGeneralFaqItems(
		[
		{
			title: 'How do I connect a social channel?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, open a workspace, and choose Add channel for the network you use. Complete OAuth or paste credentials in the dashboard. The ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide')} walks through each network step by step. On OpenQuok Cloud, developer apps are already registered for you.`
		},
		{
			title: 'Which channels can I schedule on OpenQuok?',
			description:
				`Browse supported networks on ${faqLink(publicFaqHref.channels, 'Channels')}. Each card links to a channel landing page — for example ${faqLink(YOUTUBE_CHANNEL_LINKS.channelLanding, 'YouTube')} — with scheduling features, FAQs, and agent playbooks for that platform.`
		},
		{
			title: 'Do I need my own Meta or Google developer app?',
			description:
				`Not on OpenQuok Cloud. Sign in, add the channel, and approve OAuth in your browser. Self-hosted operators register their own apps and env vars — see the ${faqLinkSelfHostChannelSetup('/docs/social-integration/youtube', 'YouTube')} path for an example. Cloud users should follow the ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide')}, not operator setup docs alone.`
		},
		{
			title: 'What is the difference between a channel page and setup docs?',
			description:
				`Public API ${faqLink(publicFaqHref.publicApiProviders, 'provider settings')} document field-level shapes for each network — for example ${faqLink(faqHrefDocs('public-api-providers/youtube'), 'YouTube Settings')}. The ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide')} covers the dashboard flow every cloud user follows. Self-host operator guides live under social-integration docs and must be labeled self-host when linked from FAQs.`
		}
	],
		PUBLIC_CHANNELS_HUB_FAQ_ITEM_IDS
	)
} satisfies PublicChannelsHubFaqSection;
