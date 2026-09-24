import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import {
	appendPublicGeneralFaqItems,
	PUBLIC_CREATORS_HUB_FAQ_ITEM_IDS
} from '$lib/content/constants/publicFaqConfig';

import { faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';

export type PublicCreatorsHubFaqSection = {
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: readonly PublicFaqItem[];
};

export const PUBLIC_CREATORS_HUB_SEO_KEYWORDS = [
	'OpenQuok community creators',
	'social media scheduling playbooks',
	'agent skills and MCP publishers',
	'publish building blocks OpenQuok',
	'creator playbook directory'
] as const;

export const PUBLIC_CREATORS_HUB_FAQ = {
	faqSubtitle: 'Creators FAQ',
	faqTitle: 'Community Creators, answered',
	faqDescription:
		'Who appears in the directory, how to publish your own listings, and how building blocks differ from playbooks.',
	faqItems: appendPublicGeneralFaqItems(
		[
		{
			title: 'Who appears on the creators page?',
			description:
				`Creators with a public username who published at least one ${faqLink(publicFaqHref.buildingBlocks, 'building block')} or ${faqLink(publicFaqHref.playbooks, 'playbook')}. Each profile card links to their public page with avatar, tagline, and listing counts.`
		},
		{
			title: 'How do I publish as a creator on OpenQuok?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, set a public username in account settings, then open <a href="/account/playbooks">Account → Playbooks</a> to create a listing. The ${faqLink(publicFaqHref.docsPlaybooksMyLibrary, 'My Playbooks library guide')} walks through drafts and publish status; the ${faqLink(publicFaqHref.publishListingGuide, 'publish guide')} covers review and approval. You appear here after at least one building block or playbook is live.`
		},
		{
			title: 'What is the difference between a building block and a playbook?',
			description:
				`Building blocks are installable skills or MCP servers you add to an agent from ${faqLink(publicFaqHref.buildingBlocks, 'Building Blocks')}. Playbooks on ${faqLink(publicFaqHref.playbooks, 'Playbooks')} chain multiple blocks into reusable step-by-step workflows. See ${faqLink(publicFaqHref.listingTypesGuide, 'Listing types explained')} and the ${faqLink(publicFaqHref.docsPlaybooks, 'Playbooks docs')} for how the account page fits the public hubs.`
		},
		{
			title: 'Can I browse everything one creator shipped?',
			description:
				`Yes. Open a creator profile to see their public building blocks and playbooks. Tag hubs such as ${faqLink(publicFaqHref.buildingBlocks, 'Building Blocks')} and ${faqLink(publicFaqHref.playbooks, 'Playbooks')} filter the wider catalog when you want cross-creator discovery.`
		}
	],
		PUBLIC_CREATORS_HUB_FAQ_ITEM_IDS
	)
} satisfies PublicCreatorsHubFaqSection;
