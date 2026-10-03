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
				title: 'What are tags versus sidebar filters?',
				description:
					`Tags are editor labels such as high domain rating or community-moderated platforms. Cost, dofollow, effort, and approval filters use opportunity data — a site appears when any published opportunity on that site matches. Tag landing pages for dofollow or guest posts use the same opportunity rules, not a tag on the site record. Use the left sidebar on the hub to filter the site list; for a full browseable index, open ${faqLink(publicFaqHref.buildBacklinksCategories, 'See All categories')} or ${faqLink(publicFaqHref.buildBacklinksTags, 'See All tags')}.`
			},
			{
				title: 'How do filters work?',
				description:
					'Cost, dofollow, effort, and approval filters match when any opportunity on the site qualifies. Domain rating sort uses the site-level estimate shown on the card. Metrics are editor-maintained estimates with a last-updated date.'
			},
			{
				title: 'What counts as a quick win in the hub stats?',
				description:
					'<p>The <strong>Quick wins</strong> number in the hero counts each published backlink opportunity that meets all of these rules:</p><ul><li>The opportunity is published (<code>is_admin_published</code> is true).</li><li><code>cost_tier</code> is <code>free</code>.</li><li><code>effort</code> is <code>easy</code>.</li></ul><p>It is strictly <strong>free plus easy effort</strong>. It does not include freemium paths (even when effort is easy), free opportunities marked medium or hard effort, or any rule on <code>approval_mode</code> (instant versus manual review). <strong>Free or freemium</strong> is a separate, broader total.</p>'
			},
			{
				title: 'Link building is a lot of work — can OpenQuok automate it?',
				description:
					`Partly. OpenQuok can schedule and publish on supported social channels; directory submits, guest posts, and GitHub-style workflows stay manual on each platform. If an opportunity’s playbook shows connect or schedule, we can help from your workspace after you ${faqLink(publicFaqHref.signUp, 'sign up')}. See ${faqLink(publicFaqHref.channels, 'supported channels')} and the ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide')} for what applies today — we plan to add more networks over time, but not every listing qualifies yet.`
			}
		] satisfies readonly PublicFaqItem[]
	}
};
