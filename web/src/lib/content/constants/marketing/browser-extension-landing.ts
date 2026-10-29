/**
 * `/browser-extension` programmatic landing config.
 */
import { icons } from '$data/icons';
import type { IconName } from '$data/icons';

import { getRootPathPublicBrowserExtensionLanding } from '$lib/area-public/constants/getRootPathPublicBrowserExtensionLanding';
import { getRootPathPublicChannel } from '$lib/area-public/constants/getRootPathPublicChannels';
import { getRootPathPublicDirectorySubmissionTool } from '$lib/area-public/constants/getRootPathPublicDirectorySubmissionTool';
import { getRootPathPublicSocialAutopilotLanding } from '$lib/area-public/constants/getRootPathPublicSocialAutopilotLanding';
import type { FeaturesOrderedStep } from '$lib/content/constants/agents';
import { PUBLIC_BROWSER_EXTENSION_LANDING_FAQ_SECTION } from '$lib/content/constants/faq/marketing/browser-extension';
import type { PublicMarketingLandingFaqSection } from '$lib/content/constants/faq/marketing/types';
import type { PublicSetupStepsFooter } from '$lib/content/constants/landing/setup-steps-footer';
import type { PublicLandingHeroStatBadge } from '$lib/content/constants/marketing/publicLandingHeroStatBadges';
import {
	faqHrefDocs,
	faqLink,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';
import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import { getPublicChannelBySlug } from '$lib/content/constants/channels';
import {
	buildBrowserExtensionChannelCrossLinkGridDescription,
	buildBrowserExtensionChannelCrossLinkGridTitle
} from '$lib/content/utils/buildBrowserExtensionLandingGridCopy';
import { getBrowserExtensionChromeWebStoreListingUrl } from '$lib/integrations/browser-extension/extensionConfig';
import { route } from '$lib/utils/path';

const CARD_CONTAINER_CLASS = 'h-full min-h-[18rem]';
const chromeExtensionDocsHref = faqHrefDocs('installation/chrome-extension');
const connectChannelsHref = publicFaqHref.connectChannelsGuide;
const connectRulesHref = faqHrefDocs('platforms/connect-rules');
const directorySubmissionDocsHref = faqHrefDocs('directory-submission');
const publicLandingPath = route(getRootPathPublicBrowserExtensionLanding());
const socialAutopilotLandingPath = route(getRootPathPublicSocialAutopilotLanding());
const directorySubmissionToolPath = route(getRootPathPublicDirectorySubmissionTool());
const redditChannelHref = route(getRootPathPublicChannel('reddit'));
const skoolChannelHref = route(getRootPathPublicChannel('skool'));
const chromeWebStoreListingUrl = getBrowserExtensionChromeWebStoreListingUrl();
const redditChannelSeed = getPublicChannelBySlug('reddit');

export type PublicBrowserExtensionChannelCrossLinkSection = {
	title: string;
	description: string;
	channelSlugs: readonly string[];
};

export type PublicBrowserExtensionAgentIntegrationsSection = {
	integrationChannelSlug: string;
	platformLabel: string;
};

export type PublicBrowserExtensionCta = {
	label: string;
	href: string;
};

export type PublicBrowserExtensionSectionHeader = {
	subtitle: string;
	title: string;
	description: string;
};

export type PublicBrowserExtensionLinkCardItem = {
	id: string;
	title: string;
	description: string;
	href: string;
	ctaLabel: string;
	iconName: IconName;
};

export type BrowserExtensionProductFeatureSectionsConfig = {
	feature1: PublicBrowserExtensionSectionHeader;
	feature2: PublicBrowserExtensionSectionHeader;
	feature3: PublicBrowserExtensionSectionHeader;
	feature4: PublicBrowserExtensionSectionHeader;
};

export type PublicBrowserExtensionLandingConfig = {
	metaTitle: string;
	metaDescription: string;
	keywords: readonly string[];
	hero: PublicBrowserExtensionSectionHeader & {
		primaryCta: PublicBrowserExtensionCta;
		secondaryCta: PublicBrowserExtensionCta;
		heroSocialPlatformsLabel: string;
		heroExtensionPlatformsLabel: string;
	};
	trustStats: readonly PublicLandingHeroStatBadge[];
	whoIsFor: {
		audienceSubtitle: string;
		audienceTitle: string;
		audienceCards: readonly AudienceCard[];
	};
	processSection: PublicBrowserExtensionSectionHeader & {
		steps: readonly FeaturesOrderedStep[];
		stepsFooter: PublicSetupStepsFooter;
	};
	productFeatureSections: BrowserExtensionProductFeatureSectionsConfig;
	channelCrossLinkSection: PublicBrowserExtensionChannelCrossLinkSection;
	agentIntegrationsSection: PublicBrowserExtensionAgentIntegrationsSection;
	relatedLinksSection: PublicBrowserExtensionSectionHeader & {
		items: readonly PublicBrowserExtensionLinkCardItem[];
	};
	faqSection: PublicMarketingLandingFaqSection;
	docsBanner: {
		title: string;
		description: string;
		cta: PublicBrowserExtensionCta;
	};
	softwareApplication: {
		name: string;
		featureList: readonly string[];
		docsPath: string;
	};
};

export const PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG: PublicBrowserExtensionLandingConfig = {
	metaTitle: 'Social Media Scheduler Browser Extension — Post From Any Tab',
	metaDescription:
		'Install the OpenQuok social media scheduler browser extension for Chrome. Schedule or draft from the side panel, start posts from selected text on the page, fill directory launch forms, and get Reddit ready to post without leaving the tab you are on.',
	keywords: [
		'social media scheduler browser extension',
		'OpenQuok browser extension',
		'Chrome extension social media scheduler',
		'schedule posts from browser',
		'post from any tab',
		'side panel social scheduling',
		'social media browser extension',
		'directory autofill extension',
		'Reddit draft handoff extension'
	],
	hero: {
		subtitle: 'Browser extension',
		// Line 2: `extensionhost` → rotating Skool / Reddit / PeerPush / Uneed chip.
		title: 'Autofill\n then post your content\n or launch your startups\n from any tab',
		description:
			'Install the OpenQuok Chrome extension. Schedule or draft from the side panel. Start a post from selected text or images. Autofill directory launch forms from your draft in dashboard. Post on Reddit by hand, avoiding getting banned. Connect channels in the dashboard first.',
		heroSocialPlatformsLabel: 'Connect your accounts — publish to your social channels',
		heroExtensionPlatformsLabel: 'In-browser connect, Reddit handoff, directory autofill',
		primaryCta: {
			label: 'Install for Chrome',
			href: chromeExtensionDocsHref
		},
		secondaryCta: {
			label: 'How it works',
			href: `${publicLandingPath}#browser-extension-process`
		}
	},
	trustStats: [
		{
			id: 'side-panel',
			value: 'One click',
			label: 'Side panel composer'
		},
		{
			id: 'context-menu',
			value: 'Right-click',
			label: 'Draft from selection'
		},
		{
			id: 'dashboard-session',
			value: 'Same session',
			label: 'Dashboard sign-in'
		},
		{
			id: 'directories',
			value: 'Autofill',
			label: 'Directory launch'
		}
	],
	whoIsFor: {
		audienceSubtitle: 'For people who work in the browser',
		audienceTitle: 'Who is the extension for?',
		audienceCards: [
			{
				iconName: icons.CustomizedDrawnLaptop.name,
				iconClass: 'text-sky-400',
				title: 'Solo founders',
				description:
					'You read and research in one tab. Queue a post from the side panel without opening the full dashboard.',
				containerClass: CARD_CONTAINER_CLASS
			},
			{
				iconName: icons.Users.name,
				iconClass: 'text-emerald-400',
				title: 'Community managers',
				description:
					'You run groups and social channels. Schedule from the same side panel after you connect accounts in the dashboard.',
				containerClass: CARD_CONTAINER_CLASS
			},
			{
				iconName: icons.Globe.name,
				iconClass: 'text-amber-400',
				title: 'Launch teams',
				description:
					'You submit to product directories often. Autofill forms from one profile and track progress in My Products.',
				containerClass: CARD_CONTAINER_CLASS
			},
			{
				iconName: icons.Reddit.name,
				iconClass: 'text-orange-500',
				title: 'Reddit marketers',
				description:
					'You draft in OpenQuok and post on reddit.com when each slot is due. The extension helps at handoff — you click Post yourself.',
				containerClass: CARD_CONTAINER_CLASS
			},
			{
				iconName: icons.MessageCircle.name,
				iconClass: 'text-orange-400',
				title: 'Subreddit moderators',
				description:
					'You plan announcements and recurring threads on one calendar. Use copy and open-submit helpers at due time — you still follow each sub’s rules.',
				containerClass: CARD_CONTAINER_CLASS
			}
		]
	},
	processSection: {
		subtitle: 'How it works',
		title: 'Install once, post from any tab',
		description:
			'Connect channels in the dashboard first. The extension adds the side panel and handoff helpers. It does not replace OAuth setup.',
		steps: [
			{
				id: 1,
				title: 'Install and pin',
				content:
					'Add the extension from the Chrome Web Store. Pin the toolbar icon. One click opens the side panel.',
				iconName: icons.CustomizedDrawnLaptop.name,
				deviceMock: 'safari',
				deviceMockContent: 'chrome-web-store-openquok',
				mockUrl: 'chromewebstore.google.com',
				mockLinkHref: chromeWebStoreListingUrl,
				mediaAlt: 'OpenQuok extension listing on the Chrome Web Store'
			},
			{
				id: 2,
				title: 'Sign in on Social',
				content:
					'Open the side panel. Open the Social tab. Connect to your OpenQuok site. Keep a signed-in dashboard tab open on that site.',
				iconName: icons.LogIn.name,
				marketingPanel: 'browser-extension-side-panel',
				mediaAlt: 'Extension side panel Social tab connect screen'
			},
			{
				id: 3,
				title: 'Connect channels in the dashboard',
				content:
					'Use Add Channel in the dashboard for each network. Some networks need you to stay signed in on their site. The extension helps those in-browser connect flows.',
				iconName: icons.Plus.name,
				marketingPanel: 'browser-extension-connect',
				mediaAlt: 'Add Channel modal with social and directory tiles'
			},
			{
				id: 4,
				title: 'Schedule, autofill, or hand off',
				content:
					'Schedule or draft from the side panel. Launch directories from youd dashboard for autofill. For Reddit, post can be draft along with other channels, while human still submits on reddit.com by hand.',
				iconName: icons.Send.name,
				marketingPanel: 'browser-extension-workflows',
				mediaAlt: 'Directory autofill and Reddit handoff actions'
			}
		],
		stepsFooter: {
			footerPrompt: 'Need the full scheduling product story?',
			footerLinkLabel: 'Social media management →',
			footerLinkHref: socialAutopilotLandingPath
		}
	},
	productFeatureSections: {
		feature1: {
			subtitle: 'Side-panel scheduling',
			title: 'Schedule quickly \n from Chrome browser\n from any tab \n for connected channels',
			description:
				'Open social scheduler from the toolbar. Pick channels, attach media, and publish now, or save drafts — the same flow as the dashboard. Posts still go live only after you approve in the workspace.'
		},
		feature2: {
			subtitle: 'Start from what you read',
			title: 'Draft posts directly\nfrom any page',
			description:
				'Right-click a quote, link, or image. Your draft opens in the full post editor — edit and schedule without copy-paste.'
		},
		feature3: {
			subtitle: 'In-browser connect',
			title: 'Connect channels\nwhile you stay signed in',
			description:
				'Skool and Reddit connect only when you are on their website and signed in. Use Add Channel and connect from Chrome. Other networks connect from your workspace.'
		},
		feature4: {
			subtitle: 'Directory launch and Reddit',
			title: 'Autofill directory forms, and post on Reddit like a human',
			description:
				'Launch using prefilled profile to autofill PeerPush, Uneed, and other directory forms in Chrome — you still click submit on the directory site. For Reddit, use copy and open-submit helpers when a post is due, while you post on reddit.com yourself.'
		}
	},
	channelCrossLinkSection: {
		title: buildBrowserExtensionChannelCrossLinkGridTitle(),
		description: buildBrowserExtensionChannelCrossLinkGridDescription(),
		channelSlugs: [
			'reddit',
			'skool',
			'peerpush',
			'uneed',
			'facebook',
			'instagram',
			'threads',
			'x',
			'linkedin',
			'youtube',
			'tiktok',
			'bluesky'
		]
	},
	agentIntegrationsSection: {
		integrationChannelSlug: 'reddit',
		platformLabel: redditChannelSeed?.platformLabel ?? 'Reddit'
	},
	relatedLinksSection: {
		subtitle: 'Go deeper',
		title: 'Channels, agents, and docs',
		description:
			'Install steps, Reddit and Skool channel pages, and related product pages.',
		items: [
			{
				id: 'install-guide',
				title: 'Install guide',
				description: 'Chrome Web Store, unpacked builds, manifest origins, and side-panel QA checklist.',
				href: chromeExtensionDocsHref,
				ctaLabel: 'Open install docs →',
				iconName: icons.BookOpenCheck.name
			},
			{
				id: 'reddit-channel',
				title: 'Reddit Draft helper',
				description: 'Draft in OpenQuok, post on reddit.com — lower ban risk than full auto-posting.',
				href: redditChannelHref,
				ctaLabel: 'View Reddit channel →',
				iconName: icons.MessageCircle.name
			},
			{
				id: 'skool-channel',
				title: 'Skool Scheduler',
				description:
					'Connect on skool.com, schedule from OpenQuok — extension connect while you stay signed in.',
				href: skoolChannelHref,
				ctaLabel: 'View Skool channel →',
				iconName: icons.MessageCircle.name
			},
			{
				id: 'social-autopilot',
				title: 'Social media management',
				description: 'Agent-assisted scheduling, channel groups, and workspace pricing.',
				href: socialAutopilotLandingPath,
				ctaLabel: 'View product page →',
				iconName: icons.Send.name
			},
			{
				id: 'directory-tool',
				title: 'Directory submission tool',
				description: 'Human-paced launches, DR tracking, and extension autofill overview.',
				href: directorySubmissionToolPath,
				ctaLabel: 'View product page →',
				iconName: icons.CustomizedDrawnHouse.name
			}
		]
	},
	faqSection: PUBLIC_BROWSER_EXTENSION_LANDING_FAQ_SECTION,
	docsBanner: {
		title: 'Read the browser extension guide',
		description:
			'Install steps, side panel tabs, right-click drafts, self-host setup, and the manual QA checklist before you ship UI changes.',
		cta: {
			label: 'Open extension docs',
			href: chromeExtensionDocsHref
		}
	},
	softwareApplication: {
		name: 'OpenQuok Social Media Scheduler Browser Extension',
		docsPath: chromeExtensionDocsHref,
		featureList: [
			'Chrome side panel to schedule or draft to connected social channels',
			'Draft from right-click on selected text, links, or images',
			'Dashboard session connect for hosted and self-host origins',
			'In-browser connect flows when Add Channel requires a live site session',
			'Directory launch autofill from My Products business profiles',
			'Reddit due-time handoff helpers without server-side Reddit OAuth posting'
		]
	}
};

export const PUBLIC_BROWSER_EXTENSION_LANDING_SLUG = getRootPathPublicBrowserExtensionLanding();

export const PUBLIC_BROWSER_EXTENSION_LANDING_PATH = publicLandingPath;
