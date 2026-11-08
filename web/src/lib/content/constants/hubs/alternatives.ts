import { getRootPathPublicDirectorySubmissionTool } from '$lib/area-public/constants/getRootPathPublicDirectorySubmissionTool';
import { getRootPathPublicSocialAutopilotLanding } from '$lib/area-public/constants/getRootPathPublicSocialAutopilotLanding';
import { getRootPathPublicAlternativesTarget } from '$lib/area-public/constants/getRootPathPublicAlternatives';
import type { PublicFaqItem } from '$lib/content/constants/faq';
import {
	appendPublicGeneralFaqItems,
	PUBLIC_ALTERNATIVES_HUB_FAQ_ITEM_IDS
} from '$lib/content/constants/faq';
import { PUBLIC_ALTERNATIVES_HUB_SECTION_IDS } from '$lib/content/constants/landing/breadcrumbs';
import {
	faqHrefComparePair,
	faqLink,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';
import { route } from '$lib/utils/path';

export type PublicAlternativesHubFaqSection = {
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: readonly PublicFaqItem[];
};

export type PublicAlternativesHubSectionConfig = {
	sectionId: string;
	subtitle: string;
	/** Plain clause before the gradient highlight (e.g. `Social media scheduler `). */
	titlePrefix: string;
	/** Gradient clause (e.g. `alternatives`). */
	titleHighlight: string;
	description: string;
	learnMoreHref: string;
	learnMoreLabel: string;
};

const socialAutopilotLandingHref = route(getRootPathPublicSocialAutopilotLanding());
const directorySubmissionToolHref = route(getRootPathPublicDirectorySubmissionTool());

export const PUBLIC_ALTERNATIVES_HUB = {
	metaTitle: 'Best Social Media Scheduler and Directory Alternatives in 2026',
	metaDescription:
		'Compare the best social media scheduler and directory submission alternatives in 2026. Ranked pages cover Buffer, Hootsuite, Later, BoringLaunch, and peers with list prices and compare links.',
	keywords: [
		'social media scheduler alternatives',
		'directory submission service alternatives',
		'buffer alternatives',
		'hootsuite alternatives',
		'later alternatives',
		'boringlaunch alternatives',
		'agent social media scheduling',
		'open source social media scheduler'
	] as const,
	eyebrow: 'Alternatives',
	/** Plain clause before the gradient highlight in the hub H1 (e.g. `Find the best `). */
	heroTitlePrefix: 'Find the best ',
	/** Gradient clause in the hub hero (e.g. `product alternatives`). */
	heroHighlightText: 'product alternatives in 2026',
	description:
		'Compare ranked social scheduler and directory submission alternatives. Browse by category, sort by price or platform count, then open each page for compare links.',
	socialSection: {
		sectionId: PUBLIC_ALTERNATIVES_HUB_SECTION_IDS.socialMediaSchedulers,
		subtitle: 'Social scheduling',
		titlePrefix: 'Social media scheduler ',
		titleHighlight: 'alternatives',
		description:
			'Open ranked alternative pages for Buffer, Hootsuite, Later, and other schedulers. Each page lists OpenQuok first, then peer tools with links to compare pages.',
		learnMoreHref: socialAutopilotLandingHref,
		learnMoreLabel: 'Social media management →'
	} satisfies PublicAlternativesHubSectionConfig,
	directorySection: {
		sectionId: PUBLIC_ALTERNATIVES_HUB_SECTION_IDS.directorySubmissionServices,
		subtitle: 'Directory launch',
		titlePrefix: 'Directory submission ',
		titleHighlight: 'alternatives',
		description:
			'Open ranked alternative pages for done-for-you directory services. Compare fees, pace, and control against OpenQuok DIY directory launch.',
		learnMoreHref: directorySubmissionToolHref,
		learnMoreLabel: 'Directory submission tool →'
	} satisfies PublicAlternativesHubSectionConfig
} as const;

export const PUBLIC_ALTERNATIVES_HUB_FAQ = {
	faqSubtitle: 'Alternatives FAQ',
	faqTitle: 'Product alternatives, answered',
	faqDescription:
		'How ranked alternative pages work, where to start for Buffer, Hootsuite, or Postiz, directory submission alternatives, and how they relate to head-to-head compare pages.',
	faqItems: appendPublicGeneralFaqItems(
		[
			{
				title: 'Where should I start for OpenQuok alternatives?',
				description:
					`Open ${faqLink(route(getRootPathPublicAlternativesTarget('openquok')), 'OpenQuok alternatives')} for schedulers and directory services you can compare with OpenQuok. Use category and sort filters on the hub when you want a short list by price or platform count.`
			},
			{
				title: 'Where should I start for Buffer alternatives?',
				description:
					`Open ${faqLink(route(getRootPathPublicAlternativesTarget('buffer')), 'Buffer alternatives')} for ranked picks. Read ${faqLink(publicFaqHref.compareOpenquokBuffer, 'OpenQuok vs Buffer')} when you want a full pricing and feature table.`
			},
			{
				title: 'Where should I start for Hootsuite alternatives?',
				description:
					`Open ${faqLink(route(getRootPathPublicAlternativesTarget('hootsuite')), 'Hootsuite alternatives')} for ranked picks. Read ${faqLink(publicFaqHref.compareOpenquokHootsuite, 'OpenQuok vs Hootsuite')} for plan limits, workspaces, and agent workflows.`
			},
			{
				title: 'Where should I start for Postiz alternatives?',
				description:
					`Open ${faqLink(route(getRootPathPublicAlternativesTarget('postiz')), 'Postiz alternatives')} for ranked picks. Read ${faqLink(publicFaqHref.compareOpenquokPostiz, 'OpenQuok vs Postiz')} for cloud vs self-host costs and channels. For a longer narrative on both open-source stacks, see ${faqLink(publicFaqHref.blogOpenquokVsPostiz, 'OpenQuok vs Postiz: two open-source schedulers, different strengths')}. For Reddit draft-and-handoff vs server publish, read ${faqLink(publicFaqHref.blogRedditAgents, 'AI agents for Reddit without getting banned')}.`
			},
			{
				title: 'Where should I start for directory submission alternatives?',
				description:
					`Browse directory targets such as ${faqLink(route(getRootPathPublicAlternativesTarget('boringlaunch')), 'BoringLaunch alternatives')}. Compare DIY launch on ${faqLink(directorySubmissionToolHref, 'directory submission tool')} with done-for-you fees on ${faqLink(faqHrefComparePair('openquok', 'boringlaunch'), 'OpenQuok vs BoringLaunch')}.`
			},
			{
				title: 'How do alternatives pages relate to compare pages?',
				description:
					`Alternatives pages help you pick a short list when you leave one vendor. Compare pages show side-by-side rows for two products. Start on Alternatives, then open the matching compare link on each listing card when you are ready for detail.`
			}
		],
		PUBLIC_ALTERNATIVES_HUB_FAQ_ITEM_IDS
	)
} satisfies PublicAlternativesHubFaqSection;
