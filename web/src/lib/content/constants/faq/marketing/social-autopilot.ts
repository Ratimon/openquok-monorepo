import { getRootPathPublicAlternativesTarget } from '$lib/area-public/constants/getRootPathPublicAlternatives';
import type { PublicFaqItem } from '$lib/content/constants/faq';
import {
	appendPublicGeneralFaqItems,
	PUBLIC_SOCIAL_AUTOPILOT_FAQ_ITEM_IDS
} from '$lib/content/constants/faq';
import type { PublicMarketingLandingFaqSection } from '$lib/content/constants/faq/marketing/types';
import { faqHrefDocs, faqLink, faqLinkChromeWebStore, publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import { route } from '$lib/utils/path';

const agentsHubHref = publicFaqHref.agents;
const chromeExtensionDocsHref = faqHrefDocs('installation/chrome-extension');
const postizAlternativesHref = route(getRootPathPublicAlternativesTarget('postiz'));

/** Page-specific FAQs after {@link PUBLIC_SOCIAL_AUTOPILOT_FAQ_ITEM_IDS} (no overlap with catalog). */
const SOCIAL_AUTOPILOT_TAILORED_FAQ_ITEMS: readonly PublicFaqItem[] = [
	{
		title: 'Do agents post without my approval?',
		description: `No. Agent hosts, MCP clients, and the CLI can draft and queue posts, but nothing goes live until you approve on the ${faqLink(publicFaqHref.docsCalendar, 'calendar')} or ${faqLink(publicFaqHref.docsKanban, 'kanban')}.`
	},
	{
		title: 'What is the best Postiz alternative with human approval?',
		description: `OpenQuok gives you Postiz-class ${faqLink(publicFaqHref.selfHostingLanding, 'self-host')} and ${faqLink(agentsHubHref, 'MCP scheduling')} with a human approval step before publish. Compare ${faqLink(publicFaqHref.compareOpenquokPostiz, 'OpenQuok vs Postiz')} and open ${faqLink(postizAlternativesHref, 'Postiz alternatives')} for ranked picks.`
	},
	{
		title: 'Can I schedule from Grok Bot or other agent hosts?',
		description: `Yes. Install openquok-core on ${faqLink(publicFaqHref.grokBotLanding, 'Grok Bot')}, OpenClaw, ThinkRail, or other hosts listed in the ${faqLink(agentsHubHref, 'Agents hub')}. Chat-to-schedule uses the same review queue as the dashboard — see ${faqLink(publicFaqHref.grokBotAgentGuide, 'Grok Bot setup')}.`
	},
	{
		title: 'Can I schedule from Chrome without opening the dashboard?',
		description: `Yes. ${faqLinkChromeWebStore()} on Chrome, pin the OpenQuok extension, and use the side panel from any tab — same channels, drafts, and approval flow as the dashboard. Skool connect and Reddit due-time handoff also use this extension. See the ${faqLink(publicFaqHref.browserExtensionLanding, 'browser extension')} page and the ${faqLink(chromeExtensionDocsHref, 'install guide')}.`
	}
];

export const PUBLIC_SOCIAL_AUTOPILOT_LANDING_FAQ_SECTION: PublicMarketingLandingFaqSection = {
	faqSubtitle: 'Social media scheduler',
	faqTitle: 'Agentic social media scheduler FAQ',
	faqDescription:
		'Common questions about social media scheduling, human approval, MCP and CLI tools, and self-host paths.',
	faqItems: appendPublicGeneralFaqItems(
		SOCIAL_AUTOPILOT_TAILORED_FAQ_ITEMS,
		PUBLIC_SOCIAL_AUTOPILOT_FAQ_ITEM_IDS,
		{ generalFirst: true }
	)
};
