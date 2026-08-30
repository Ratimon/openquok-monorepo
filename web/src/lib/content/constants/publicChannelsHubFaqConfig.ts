import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';

import {
	buildChannelFaqLinks,
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
	faqItems: [
		{
			title: 'How do I connect a social channel?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, open a workspace, and choose Add channel for the network you use. Complete OAuth or paste credentials in the dashboard. The ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide')} walks through each network step by step. On OpenQuok Cloud, developer apps are already registered for you.`
		},
		{
			title: 'Which channels can I schedule on OpenQuok?',
			description:
				`Browse live and coming-soon networks on ${faqLink(publicFaqHref.channels, 'Channels')}. Each card links to a channel landing page — for example ${faqLink(YOUTUBE_CHANNEL_LINKS.channelLanding, 'YouTube')} — with scheduling features, FAQs, and agent playbooks for that platform.`
		},
		{
			title: 'Do I need my own Meta or Google developer app?',
			description:
				`Not on OpenQuok Cloud. Sign in, add the channel, and approve OAuth in your browser. Self-hosted operators register their own apps and env vars — see the ${faqLinkSelfHostChannelSetup('/docs/social-integration/youtube', 'YouTube')} path for an example. Cloud users should follow the ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide')}, not operator setup docs alone.`
		},
		{
			title: 'What is the difference between a channel page and setup docs?',
			description:
				`Channel landings on ${faqLink(publicFaqHref.channels, 'Channels')} explain what you can schedule and why teams pick OpenQuok for that network. The ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide')} covers the dashboard flow every cloud user follows. Self-host operator guides live under social-integration docs and must be labeled self-host when linked from FAQs.`
		}
	]
} satisfies PublicChannelsHubFaqSection;
