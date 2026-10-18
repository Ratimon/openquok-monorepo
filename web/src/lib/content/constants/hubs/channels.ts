import type { PublicFaqItem } from '$lib/content/constants/faq';
import {
	appendPublicGeneralFaqItems,
	PUBLIC_CHANNELS_HUB_FAQ_ITEM_IDS
} from '$lib/content/constants/faq';

import { getRootPathPublicDirectorySubmissionTool } from '$lib/area-public/constants/getRootPathPublicDirectorySubmissionTool';
import {
	buildChannelFaqLinks,
	faqHrefDocs,
	faqLink,
	faqLinkSelfHostChannelSetup,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';
import { route } from '$lib/utils/path';

import type { ComparePoint } from '$lib/ui/templates/Compare.svelte';

const YOUTUBE_CHANNEL_LINKS = buildChannelFaqLinks('youtube', '/docs/social-integration/youtube');
const directorySubmissionToolHref = route(getRootPathPublicDirectorySubmissionTool());

export type PublicChannelsHubFaqSection = {
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: readonly PublicFaqItem[];
};

export type PublicChannelsHubCompareSection = {
	subtitle: string;
	title: string;
	description: string;
	leftTitle: string;
	rightTitle: string;
	points: ComparePoint[];
};

export const PUBLIC_CHANNELS_HUB = {
	metaTitle: 'Social media scheduler & directory launch channels',
	metaDescription:
		'Connect social networks, schedule posts, and use AI agents from one workspace. Build a business profile and launch on product directories with the OpenQuok browser extension. You control each publish and each directory submit.',
	title: 'Social and directory channels for one workspace',
	socialHubLearnMoreLinkLabel: 'Social media management →',
	directoryHubLearnMoreLinkLabel: 'Save on done-for-you submission →',
	description:
		'Connect social networks, schedule posts, and use agents from one workspace. Build a business profile and launch on product directories with the browser extension. You control each publish and each directory submit.',
	socialHubSubtitle: 'Social Media',
	socialHubTitle: 'Social media platforms',
	socialHubDescription:
		'Connect Facebook, Threads, Instagram, YouTube, TikTok, and more. Schedule posts from one calendar while you approve what goes live.',
	directoryHubSubtitle: 'Directory Launch',
	directoryHubTitle: 'Directory launch platforms',
	directoryHubDescription:
		'Submit your startup listing on PeerPush, Uneed, and more. OpenQuok autofills forms from your profile. You submit on the directory site.',
	compareSection: {
		subtitle: 'Social scheduling vs directory launch',
		title: 'Two channel families, one business profile',
		description:
			'OpenQuok connects OAuth social networks for scheduling and helps you reuse the same business profile when you launch on startup directories. You stay in control on both paths.',
		leftTitle: 'Social media platforms (OAuth & scheduling)',
		rightTitle: 'Directory launch (profile & extension)',
		points: [
			{
				left: 'Connect channels with OAuth or API keys in the workspace',
				right: 'Reuse your business profile fields across directory forms'
			},
			{
				left: 'Schedule posts and threads from the calendar or agents',
				right: 'Open the directory site and autofill with the browser extension'
			},
			{
				left: 'Approve drafts before anything publishes',
				right: 'You click submit on the directory — OpenQuok does not auto-submit for you'
			},
			{
				left: 'Agents and MCP tools draft and schedule social content',
				right: 'Track readiness, listing URL, and evidence in My Products'
			},
			{
				left: 'Docs under social integration and connect channels',
				right: 'Docs under directory submission and directory integration'
			}
		]
	} satisfies PublicChannelsHubCompareSection
} as const;

export const PUBLIC_CHANNELS_HUB_FAQ = {
	faqSubtitle: 'Channels FAQ',
	faqTitle: 'Supported Channels, answered',
	faqDescription:
		'How to connect networks on OpenQuok Cloud, which channel pages cover, directory launches with the extension, and when self-host operator setup applies.',
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
				title: 'How do directory launch platforms work?',
				description:
					`Open a ${faqLink(faqHrefDocs('directory-submission'), 'directory submission')} guide, fill your business profile once, then use the Chrome extension to autofill PeerPush, Uneed, and other directory forms. Mark each listing submitted when you finish on the directory site. See the ${faqLink(directorySubmissionToolHref, 'directory submission tool')} page for DIY vs done-for-you costs. Directory cards on ${faqLink(publicFaqHref.channels, 'Channels')} link to per-platform setup.`
			},
			{
				title: 'Does OpenQuok submit my startup to directories for me?',
				description:
					'No. OpenQuok autofills forms from your profile and helps you track progress. You open the directory site, review the listing, and submit yourself. That keeps you in control of approvals, payments, and queue rules on each platform.'
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
