import type { PublicFaqItem } from '$lib/content/constants/faq';
import {
	appendPublicGeneralFaqItems,
	PUBLIC_COMPARE_HUB_FAQ_ITEM_IDS
} from '$lib/content/constants/faq';

import { getRootPathPublicDirectorySubmissionTool } from '$lib/area-public/constants/getRootPathPublicDirectorySubmissionTool';
import { getRootPathPublicSocialAutopilotLanding } from '$lib/area-public/constants/getRootPathPublicSocialAutopilotLanding';
import { PUBLIC_COMPARE_HUB_SECTION_IDS } from '$lib/content/constants/landing/breadcrumbs';
import {
	faqHrefComparePair,
	faqLink,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';
import { route } from '$lib/utils/path';

export type PublicCompareHubFaqSection = {
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: readonly PublicFaqItem[];
};

export type PublicCompareHubSectionConfig = {
	sectionId: string;
	subtitle: string;
	title: string;
	description: string;
	learnMoreHref: string;
	learnMoreLabel: string;
};

const socialAutopilotLandingHref = route(getRootPathPublicSocialAutopilotLanding());
const directorySubmissionToolHref = route(getRootPathPublicDirectorySubmissionTool());

export const PUBLIC_COMPARE_HUB = {
	metaTitle: 'Compare social schedulers and directory submission services',
	metaDescription:
		'Compare social media schedulers and directory submission services side by side. See OpenQuok vs Buffer, Later, and BoringLaunch on pricing, channels, DIY launch, and control.',
	keywords: [
		'social media scheduler comparison',
		'compare social media scheduling tools',
		'directory submission service comparison',
		'DIY directory launch vs done for you',
		'buffer vs hootsuite alternative',
		'openquok vs boringlaunch',
		'agent social media scheduling',
		'multi-workspace social media scheduler'
	] as const,
	eyebrow: 'Compare',
	title: 'Compare schedulers and directory launch services',
	description:
		'Open head-to-head pages for social media schedulers and directory submission services. You see pricing, features, and trade-offs before you switch tools or hire a done-for-you service.',
	socialSection: {
		sectionId: PUBLIC_COMPARE_HUB_SECTION_IDS.socialMediaSchedulers,
		subtitle: 'Social scheduling',
		title: 'Social media schedulers',
		description:
			'Compare OpenQuok to Buffer, Later, Hootsuite, and other schedulers. You review plan limits, connected channels, workspaces, and agent workflows in one place.',
		learnMoreHref: socialAutopilotLandingHref,
		learnMoreLabel: 'Social media management →'
	} satisfies PublicCompareHubSectionConfig,
	directorySection: {
		sectionId: PUBLIC_COMPARE_HUB_SECTION_IDS.directorySubmissionServices,
		subtitle: 'Directory launch',
		title: 'Directory submission services',
		description:
			'Compare OpenQuok DIY directory launch to done-for-you services such as BoringLaunch. You review one-time fees, pace, control, and DR outcomes before you buy.',
		learnMoreHref: directorySubmissionToolHref,
		learnMoreLabel: 'Directory submission tool →'
	} satisfies PublicCompareHubSectionConfig
} as const;

export const PUBLIC_COMPARE_HUB_FAQ = {
	faqSubtitle: 'Compare FAQ',
	faqTitle: 'Product Comparison, answered',
	faqDescription:
		'How head-to-head pages work, where to start with Buffer or Later, directory submission comparisons, how pricing stacks up, and how to browse alternative directories.',
	faqItems: appendPublicGeneralFaqItems(
		[
		{
			title: 'How do OpenQuok comparison pages work?',
			description:
				`Pick a product family on ${faqLink(publicFaqHref.compare, 'Compare')}, then open a head-to-head page for pricing and feature rows. Social pages cover channels and agent tools. Directory pages cover DIY launch vs done-for-you submission. Each page lists strengths and trade-offs in plain language.`
		},
		{
			title: 'Where should I start for directory launch comparisons?',
			description:
				`Read ${faqLink(faqHrefComparePair('openquok', 'boringlaunch'), 'OpenQuok vs BoringLaunch')} for DIY control, extension workflows, and one-time service fees. Open the ${faqLink(directorySubmissionToolHref, 'directory submission tool')} page when you want the OpenQuok DIY path in one place.`
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
