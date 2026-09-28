import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import {
	appendPublicGeneralFaqItems,
	PUBLIC_COMPARE_HUB_FAQ_ITEM_IDS
} from '$lib/content/constants/publicFaqConfig';

import { faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';

export type PublicCompareHubFaqSection = {
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: readonly PublicFaqItem[];
};

export const PUBLIC_COMPARE_HUB_FAQ = {
	faqSubtitle: 'Compare FAQ',
	faqTitle: 'Product Comparison, answered',
	faqDescription:
		'How head-to-head pages work, where to start with Buffer or Later, how pricing stacks up, and how to browse alternative directories.',
	faqItems: appendPublicGeneralFaqItems(
		[
		{
			title: 'How do OpenQuok comparison pages work?',
			description:
				`Pick a base product on ${faqLink(publicFaqHref.compare, 'Compare')}, then open a head-to-head page for pricing, channels, and feature rows. Each page lists strengths and trade-offs in plain language so you can shortlist schedulers before you sign up.`
		},
		{
			title: 'Where should I start for OpenQuok vs Buffer?',
			description:
				`Read ${faqLink(publicFaqHref.compareOpenquokBuffer, 'OpenQuok vs Buffer')} for plan limits, agent workflows, and approval controls. The ${faqLink(publicFaqHref.blogBufferAlternatives, 'Buffer alternatives guide')} covers teams that want human review before AI-assisted posts go live.`
		},
		{
			title: 'Where should I start for OpenQuok vs Later?',
			description:
				`Read ${faqLink(publicFaqHref.compareOpenquokLater, 'OpenQuok vs Later')} for social-set pricing, Instagram grid planning, Link in Bio, and agent workflows. Browse ${faqLink(publicFaqHref.alternativesLater, 'Later alternatives')} if you want workspace isolation and a public API instead of a visual dashboard.`
		},
		{
			title: 'How does OpenQuok pricing compare?',
			description:
				`Comparison tables show public list prices side by side. OpenQuok includes workspace scheduling, agent CLI and MCP access, and API keys on paid tiers. Confirm seat limits, channel caps, and trial length on ${faqLink(publicFaqHref.pricing, 'Pricing')} before you switch.`
		},
		{
			title: 'Where can I browse alternatives to other tools?',
			description:
				`Use ${faqLink(publicFaqHref.alternatives, 'Alternatives')} directory pages. Each page ranks OpenQuok first, then peer schedulers, with links back to matching compare pages and official product sites.`
		}
	],
		PUBLIC_COMPARE_HUB_FAQ_ITEM_IDS
	)
} satisfies PublicCompareHubFaqSection;
