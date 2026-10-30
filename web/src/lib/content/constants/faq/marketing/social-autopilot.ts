import type { PublicFaqItem } from '$lib/content/constants/faq';
import {
	appendPublicGeneralFaqItems,
	PUBLIC_SOCIAL_AUTOPILOT_FAQ_ITEM_IDS
} from '$lib/content/constants/faq';
import type { PublicMarketingLandingFaqSection } from '$lib/content/constants/faq/marketing/types';
import { faqHrefDocs, faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';

const agentsHubHref = publicFaqHref.agents;
const chromeExtensionDocsHref = faqHrefDocs('installation/chrome-extension');

/** Page-specific FAQs after {@link PUBLIC_SOCIAL_AUTOPILOT_FAQ_ITEM_IDS} (no overlap with catalog). */
const SOCIAL_AUTOPILOT_TAILORED_FAQ_ITEMS: readonly PublicFaqItem[] = [
	{
		title: 'Do agents post without my approval?',
		description: `No. Agent hosts, MCP clients, and the CLI can draft and queue posts, but nothing goes live until you approve on the ${faqLink(publicFaqHref.docsCalendar, 'calendar')} or ${faqLink(publicFaqHref.docsKanban, 'kanban')}.`
	},
	{
		title: 'Can I schedule from Grok Bot or other agent hosts?',
		description: `Yes. Install openquok-core on ${faqLink(publicFaqHref.grokBotLanding, 'Grok Bot')}, OpenClaw, ThinkRail, or other hosts listed in the ${faqLink(agentsHubHref, 'Agents hub')}. Chat-to-schedule uses the same review queue as the dashboard — see ${faqLink(publicFaqHref.grokBotAgentGuide, 'Grok Bot setup')}.`
	},
	{
		title: 'Can I schedule from Chrome without opening the dashboard?',
		description: `Yes. Install the OpenQuok browser extension and use the side panel from any tab — same channels, drafts, and approval flow as the dashboard. See the ${faqLink(publicFaqHref.browserExtensionLanding, 'browser extension')} page and the ${faqLink(chromeExtensionDocsHref, 'install guide')}.`
	}
];

export const PUBLIC_SOCIAL_AUTOPILOT_LANDING_FAQ_SECTION: PublicMarketingLandingFaqSection = {
	faqSubtitle: 'Social autopilot',
	faqTitle: 'Questions about agent-assisted scheduling',
	faqDescription:
		'How OpenQuok combines agents, MCP, CLI, and APIs with a human approval step.',
	faqItems: appendPublicGeneralFaqItems(
		SOCIAL_AUTOPILOT_TAILORED_FAQ_ITEMS,
		PUBLIC_SOCIAL_AUTOPILOT_FAQ_ITEM_IDS,
		{ generalFirst: true }
	)
};
