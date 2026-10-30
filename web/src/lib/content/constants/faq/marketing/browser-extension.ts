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
import { faqHrefDocs, faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import { route } from '$lib/utils/path';

const chromeExtensionDocsHref = faqHrefDocs('installation/chrome-extension');
const connectChannelsHref = publicFaqHref.connectChannelsGuide;
const connectRulesHref = faqHrefDocs('platforms/connect-rules');
const directorySubmissionDocsHref = faqHrefDocs('directory-submission');
const browserExtensionLandingHref = publicFaqHref.browserExtensionLanding;
const socialAutopilotLandingHref = route(getRootPathPublicSocialAutopilotLanding());
const directorySubmissionToolHref = route(getRootPathPublicDirectorySubmissionTool());
const redditChannelHref = route(getRootPathPublicChannel('reddit'));
const cursorRedditAgentHref = route(getRootPathPublicAgentChannel('cursor', 'reddit'));

const BROWSER_EXTENSION_TAILORED_FAQ_ITEMS: readonly PublicFaqItem[] = [
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
		description: `Yes. Right-click selected text, a link, or an image and send it into the side panel — like drafting from whatever you are reading. OpenQuok opens the Social tab with your draft ready; publishing still runs on OpenQuok after you submit. See the ${faqLink(browserExtensionLandingHref, 'browser extension')} page and the ${faqLink(chromeExtensionDocsHref, 'install guide')}.`
	},
	{
		title: 'How does directory autofill work?',
		description: `Build a product profile on My Products, click Launch to directory, and the extension opens the directory site with mapped fields filled. You review and submit on the directory yourself. Step-by-step workflow: ${faqLink(directorySubmissionDocsHref, 'Directory submission')}. Product overview: ${faqLink(directorySubmissionToolHref, 'Directory submission tool')}.`
	},
	{
		title: 'Can I use the extension with self-hosted OpenQuok?',
		description: `Yes. Sign in on your self-host dashboard origin from the side panel (or keep a signed-in tab on that host). Set ${faqLink(faqHrefDocs('configuration-web'), 'VITE_OPENQUOK_BROWSER_EXTENSION_ID')} on the web app and add your HTTPS origin to the extension manifest when you build from source. See ${faqLink(publicFaqHref.selfHostingLanding, 'self-host OpenQuok')}, the ${faqLink(browserExtensionLandingHref, 'browser extension')} page, and the ${faqLink(chromeExtensionDocsHref, 'install guide')}.`
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
		'Schedule from any tab, start posts from page selections, directory form fill, Reddit copy-and-post helpers, and how the extension works with dashboard connect.',
	faqItems: appendPublicGeneralFaqItems(
		BROWSER_EXTENSION_TAILORED_FAQ_ITEMS,
		PUBLIC_CHANNELS_HUB_FAQ_ITEM_IDS
	)
};

/** Marketing landing path referenced in FAQ answers. */
export const PUBLIC_BROWSER_EXTENSION_LANDING_FAQ_PAGE_HREF = browserExtensionLandingHref;
