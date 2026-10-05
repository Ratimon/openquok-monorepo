import type { PublicFaqItem } from '$lib/content/constants/faq';

import { faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';

export type PublicBuildBacklinksHubFaqSection = {
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: readonly PublicFaqItem[];
};

export type PublicBuildBacklinksHubConfig = {
	subtitle: string;
	title: string;
	filterPageTitleSuffix: string;
	description: string;
	seoKeywords: readonly string[];
	faqSection: PublicBuildBacklinksHubFaqSection;
};

/** pSEO copy for `/build-backlinks` and filter index pages (categories, tags). */
export const PUBLIC_BUILD_BACKLINKS_HUB: PublicBuildBacklinksHubConfig = {
	subtitle: 'Build backlinks',
	title: 'The backlink directory for builders and startups',
	filterPageTitleSuffix: 'Backlink opportunities',
	description:
		'A maintained list of platforms where you can earn backlinks — launch directories, profiles, guest posts, Web 2.0 sites, and communities — with cost, effort, dofollow, and approval notes on every opportunity.',
	seoKeywords: [
		'backlink directory',
		'link building opportunities',
		'dofollow profile links',
		'startup launch directories',
		'guest post opportunities',
		'community backlink list',
		'SEO link building sites',
		'product launch backlinks',
		'maker directory links',
		'social profile backlinks'
	],
	faqSection: {
		faqSubtitle: 'Build backlinks FAQ',
		faqTitle: 'How to use this backlink directory',
		faqDescription:
			'What each listing includes, how filters work, and how OpenQuok fits when a channel supports scheduling or plugs.',
		faqItems: [
			{
				title: 'What is a site versus an opportunity?',
				description:
					'Each card is one platform or website. Opportunities are specific ways to earn a link there — for example a profile URL, a product submission, or a guest post. Expand a card to compare paths on the same site.'
			},
			{
				title: 'What counts as a quick win in the hub stats?',
				description:
					'<p><strong>Quick wins</strong> counts published playbooks that are free and easy.</p><p>Freemium paths do not count. Free paths with medium or hard effort do not count. Approval speed does not change this number.</p><p>In the stats row, <strong>Free or freemium</strong> shows how many paths you can start without paying. That number is usually higher than Quick wins because it includes freemium and harder free paths too.</p>'
			},
			{
				title: 'Link building is a lot of work — can OpenQuok automate it?',
				description:
					`Partly. OpenQuok can schedule and publish on supported social channels; directory submits, guest posts, and GitHub-style workflows stay manual on each platform. If an opportunity’s playbook shows connect or schedule, we can help from your workspace after you ${faqLink(publicFaqHref.signUp, 'sign up')}. See ${faqLink(publicFaqHref.channels, 'supported channels')} and the ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide')} for what applies today — we plan to add more networks over time, but not every listing qualifies yet.`
			}
		] satisfies readonly PublicFaqItem[]
	}
};
