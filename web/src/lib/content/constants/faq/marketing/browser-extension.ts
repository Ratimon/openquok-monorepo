import type { PublicFaqItem } from '$lib/content/constants/faq';
import {
	appendPublicGeneralFaqItems,
	PUBLIC_CHANNELS_HUB_FAQ_ITEM_IDS
} from '$lib/content/constants/faq';
import type { PublicMarketingLandingFaqSection } from '$lib/content/constants/faq/marketing/types';
import { getRootPathPublicAgentChannel } from '$lib/area-public/constants/getRootPathPublicAgents';
import { getRootPathPublicChannel } from '$lib/area-public/constants/getRootPathPublicChannels';
import { getRootPathPublicDirectorySubmissionTool } from '$lib/area-public/constants/getRootPathPublicDirectorySubmissionTool';
import { getRootPathPublicSocialAutopilotLanding } from '$lib/area-public/constants/getRootPathPublicSocialAutopilotLanding';
import {
	faqExternalLink,
	faqHrefDocs,
	faqLink,
	faqLinkChromeWebStore,
	OPENQUOK_GITHUB_REPO_HREF,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';

import { route } from '$lib/utils/path';

const chromeExtensionDocsHref = faqHrefDocs('installation/chrome-extension');
const edgeExtensionDocsHref = faqHrefDocs('installation/edge-extension');
const firefoxExtensionDocsHref = faqHrefDocs('installation/firefox-extension');
const chromeExtensionConfigHref = faqHrefDocs('configuration-web/browser-extension-chrome');
const edgeExtensionConfigHref = faqHrefDocs('configuration-web/browser-extension-edge');
const firefoxExtensionConfigHref = faqHrefDocs('configuration-web/browser-extension-firefox');
const browserExtensionInstallGuides = `${faqLink(chromeExtensionDocsHref, 'Chrome')}, ${faqLink(edgeExtensionDocsHref, 'Edge')}, and ${faqLink(firefoxExtensionDocsHref, 'Firefox')} install guides`;
const browserExtensionConfigGuides = `${faqLink(chromeExtensionConfigHref, 'Chrome configuration')}, ${faqLink(edgeExtensionConfigHref, 'Edge configuration')}, and ${faqLink(firefoxExtensionConfigHref, 'Firefox configuration')}`;
const buildBacklinksHref = publicFaqHref.buildBacklinks;
const connectChannelsHref = publicFaqHref.connectChannelsGuide;
const connectRulesHref = faqHrefDocs('platforms/connect-rules');
const directorySubmissionDocsHref = faqHrefDocs('directory-submission');
const browserExtensionLandingHref = publicFaqHref.browserExtensionLanding;
const socialAutopilotLandingHref = route(getRootPathPublicSocialAutopilotLanding());
const directorySubmissionToolHref = route(getRootPathPublicDirectorySubmissionTool());
const redditChannelHref = route(getRootPathPublicChannel('reddit'));
const cursorRedditAgentHref = route(getRootPathPublicAgentChannel('cursor', 'reddit'));
const extensionSourceHref = `${OPENQUOK_GITHUB_REPO_HREF}/tree/main/extension`;

const BROWSER_EXTENSION_TAILORED_FAQ_ITEMS: readonly PublicFaqItem[] = [
	{
		title: 'How many browser add-ons does OpenQuok support?',
		description: `OpenQuok ships three store add-ons: ${faqLink(chromeExtensionDocsHref, 'Chrome')}, ${faqLink(edgeExtensionDocsHref, 'Edge')}, and ${faqLink(firefoxExtensionDocsHref, 'Firefox')}. Chrome and Edge use the same Chromium package; Firefox has its own Mozilla add-on build. Use the install chooser on this page or the ${browserExtensionInstallGuides}.`
	},
	{
		title: 'Can we self-host the extension?',
		description: `Yes. Build the add-on from the monorepo and load it unpacked in Chrome or Edge, or as a temporary Firefox add-on — follow the ${browserExtensionInstallGuides}. On your web app, set extension store IDs per browser (${browserExtensionConfigGuides}). Add your HTTPS dashboard origin to the manifest when you build from source. Sign in from the side panel on that host. See ${faqLink(publicFaqHref.selfHostingLanding, 'self-host OpenQuok')} and ${faqLink(faqHrefDocs('configuration-web'), 'web configuration')}.`
	},
	{
		title: 'Is the extension open source?',
		description: `Yes. The browser extension ships in the same AGPL monorepo as OpenQuok. Source and build scripts live in ${faqExternalLink(extensionSourceHref, 'extension/ on GitHub')}. You can read, build, and ship your own copy for self-host without a separate license. Store builds for Chrome, Edge, and Firefox come from that tree — see the ${browserExtensionInstallGuides}.`
	},
	{
		title: 'Does the extension replace Add Channel in the dashboard?',
		description: `No. OAuth and credential networks still connect in the dashboard with ${faqLink(connectChannelsHref, 'Add Channel')}. The extension adds a Chrome side panel to schedule or draft to channels you already connected, plus in-browser connect and directory autofill when a live browser session is required. Product overview: ${faqLink(browserExtensionLandingHref, 'browser extension')}. See ${faqLink(connectRulesHref, 'connect rules')} for which flows use the extension.`
	},
	{
		title: 'Which social networks can I schedule from the side panel?',
		description: `Any schedulable channel in your workspace after you connect it on the dashboard — same avatar chips and groups as the post composer. Publish now, save a draft, or pick a schedule time without leaving the tab you are on. Overview: ${faqLink(socialAutopilotLandingHref, 'social media management')}.`
	},
	{
		title: 'Can I start a post from text or images on a page?',
		description: `Yes. Right-click selected text, a link, or an image and send it into the side panel — like drafting from whatever you are reading. OpenQuok opens the Social tab with your draft ready; publishing still runs on OpenQuok after you submit. See the ${faqLink(browserExtensionLandingHref, 'browser extension')} page and the ${browserExtensionInstallGuides}.`
	},
	{
		title: 'How does directory autofill work?',
		description: `Research directories in ${faqLink(buildBacklinksHref, 'Build backlinks')}, then build a product profile on our dashboard and click Launch to directory. The extension opens the directory site with mapped fields filled. You review and submit on the directory yourself. Install on Chrome (${faqLinkChromeWebStore()}), Edge, or Firefox — see the ${browserExtensionInstallGuides}. Step-by-step workflow: ${faqLink(directorySubmissionDocsHref, 'Directory submission')}. Product overview: ${faqLink(directorySubmissionToolHref, 'Directory submission tool')} and ${faqLink(publicFaqHref.channels, 'Channels')} directory cards.`
	},
	{
		title: 'Is Reddit posting automated through the extension?',
		description: `No. Reddit uses draft-and-handoff: OpenQuok prepares copy and reminders; you submit on reddit.com yourself for lower ban risk. The extension can help at due time — it does not post through Reddit OAuth on the server. Read the ${faqLink(redditChannelHref, 'Reddit scheduler')} page or ${faqLink(cursorRedditAgentHref, 'Cursor with Reddit')} for the same workflow with agents. ${faqLink(publicFaqHref.signUp, 'Sign up for free')} and connect Reddit from the dashboard first.`
	}
];

export const PUBLIC_BROWSER_EXTENSION_LANDING_FAQ_SECTION: PublicMarketingLandingFaqSection = {
	faqSubtitle: 'Browser extension',
	faqTitle: 'Questions about the social media scheduler browser extension',
	faqDescription:
		'Self-host and open-source extension builds, Chrome Edge and Firefox add-ons, scheduling from any tab, directory autofill, Reddit handoff, and dashboard connect.',
	faqItems: appendPublicGeneralFaqItems(
		BROWSER_EXTENSION_TAILORED_FAQ_ITEMS,
		PUBLIC_CHANNELS_HUB_FAQ_ITEM_IDS
	)
};

/** Marketing landing path referenced in FAQ answers. */
export const PUBLIC_BROWSER_EXTENSION_LANDING_FAQ_PAGE_HREF = browserExtensionLandingHref;
