import type { PublicFaqItem } from '$lib/content/constants/faq';

import { faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import type {
	LinkDirectoryEffort,
	LinkDirectoryOpportunityDto,
	LinkDirectorySiteDto
} from '$lib/link-directory/link-directory.types';
import { formatMonthlyVisitsLabel } from '$lib/link-directory/utils/formatLinkDirectoryMetrics';
import { summarizePublishedOpportunityDofollow } from '$lib/link-directory/utils/formatBuildBacklinksSiteSeoCopy';
import {
	formatLinkDirectoryEffortLabel,
	summarizeEasiestPublishedEffort
} from '$lib/link-directory/utils/formatBuildBacklinksSiteEffortSummary';

export type BuildBacklinksSiteFaqSection = {
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: PublicFaqItem[];
};

function publishedOpportunities(site: Pick<LinkDirectorySiteDto, 'opportunities'>): LinkDirectoryOpportunityDto[] {
	return (site.opportunities ?? [])
		.filter((opportunity) => opportunity.isAdminPublished)
		.filter((opportunity) => opportunity.title.trim().length > 0)
		.sort((a, b) => a.sortOrder - b.sortOrder);
}

function formatEffortLabel(effort: LinkDirectoryEffort): string {
	return formatLinkDirectoryEffortLabel(effort);
}

function summarizeEasiestEffort(opportunities: LinkDirectoryOpportunityDto[]): LinkDirectoryEffort | null {
	return summarizeEasiestPublishedEffort(opportunities);
}

function formatDofollowFaqAnswer(siteTitle: string, opportunities: LinkDirectoryOpportunityDto[]): string {
	const summary = summarizePublishedOpportunityDofollow(opportunities);
	switch (summary) {
		case 'allDofollow':
			return `Every published opportunity on ${siteTitle} in this guide is marked dofollow where link equity may apply. Confirm the live URL and rel attributes on the platform — policies change.`;
		case 'allNofollow':
			return `Published ${siteTitle} opportunities in this guide use nofollow links. They can still drive traffic and brand visibility, but typically do not pass PageRank from ${siteTitle}.`;
		case 'mixed':
			return `${siteTitle} mixes dofollow and nofollow paths. Each playbook card in this guide calls out link treatment per opportunity — read the dofollow field before you prioritize work.`;
		case 'none':
			return `This guide does not list published backlink opportunities for ${siteTitle} yet. Check back after editors add playbooks, or browse ${faqLink(publicFaqHref.buildBacklinksCategories, 'backlink categories')} on the hub.`;
	}
}

function formatMetricsFaqAnswer(site: LinkDirectorySiteDto): string {
	const parts: string[] = [];
	if (site.domainRating != null) {
		parts.push(`domain rating (DR) ${site.domainRating}`);
	}
	if (site.domainAuthority != null) {
		parts.push(`domain authority (DA) ${site.domainAuthority}`);
	}
	const visitsLabel = formatMonthlyVisitsLabel(site.monthlyVisits);
	if (visitsLabel) {
		parts.push(`estimated monthly traffic ${visitsLabel}`);
	}

	if (parts.length === 0) {
		return `${site.title.trim()} does not show site-level SEO metrics on this guide yet. Opportunity cards still include cost, effort, approval, and dofollow notes from editors.`;
	}

	return `This page shows ${parts.join(', ')} for ${site.title.trim()}. Use them as a guide to compare sites, not as guarantees.`;
}

function formatCostEffortFaqAnswer(siteTitle: string, opportunities: LinkDirectoryOpportunityDto[]): string {
	if (opportunities.length === 0) {
		return `No published opportunities are listed for ${siteTitle} yet. When playbooks ship, each card will show cost tier (free, freemium, or paid), effort, and approval mode.`;
	}

	const freeCount = opportunities.filter((opportunity) => opportunity.costTier === 'free').length;
	const freemiumCount = opportunities.filter((opportunity) => opportunity.costTier === 'freemium').length;
	const paidCount = opportunities.filter((opportunity) => opportunity.costTier === 'paid').length;

	const costParts: string[] = [];
	if (freeCount > 0) costParts.push(`${freeCount} free`);
	if (freemiumCount > 0) costParts.push(`${freemiumCount} freemium`);
	if (paidCount > 0) costParts.push(`${paidCount} paid`);

	const easiest = summarizeEasiestEffort(opportunities);
	const effortNote = easiest
		? ` The quickest path we list is ${formatEffortLabel(easiest)} effort.`
		: '';

	return `This guide lists ${opportunities.length.toLocaleString()} published ${siteTitle} backlink opportunit${opportunities.length === 1 ? 'y' : 'ies'}: ${costParts.join(', ')}.${effortNote} Expand each playbook for approval timing and step-by-step instructions.`;
}

function formatOpenQuokFaqAnswer(site: LinkDirectorySiteDto, opportunities: LinkDirectoryOpportunityDto[]): string | null {
	const hasConnect = opportunities.some((opportunity) => opportunity.openquokCtaKind === 'connect_channel');
	const hasSchedule = opportunities.some((opportunity) => opportunity.openquokCtaKind === 'schedule_post');
	const hasPlug = opportunities.some((opportunity) => opportunity.openquokCtaKind === 'use_plug');

	if (!site.isOpenquokAuthSupported && !hasConnect && !hasSchedule && !hasPlug) {
		return null;
	}

	const siteTitle = site.title.trim();
	const actions: string[] = [];
	if (hasConnect || site.isOpenquokAuthSupported) {
		actions.push('connect the matching social channel in your workspace');
	}
	if (hasSchedule) {
		actions.push('schedule posts after channels are connected');
	}
	if (hasPlug) {
		actions.push('run supported plug workflows where the playbook calls for them');
	}

	const actionText =
		actions.length > 0
			? `OpenQuok can help you ${actions.join(' and ')} when a ${siteTitle} playbook points to those steps.`
			: `OpenQuok lists ${siteTitle} among supported channels for workspace setup.`;

	return `${actionText} Directory submits, guest posts, and manual profile edits still happen on ${siteTitle}. After you ${faqLink(publicFaqHref.signUp, 'sign up')}, use the ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide')} and ${faqLink(publicFaqHref.channels, 'channels hub')} to see what applies today.`;
}

function formatOpportunitiesFaqAnswer(
	siteTitle: string,
	opportunities: LinkDirectoryOpportunityDto[],
	canonical: string
): string {
	if (opportunities.length === 0) {
		return `${siteTitle} does not have published backlink playbooks on this guide yet. Browse the ${faqLink(publicFaqHref.buildBacklinksCategories, 'backlink directory')} for other sites.`;
	}

	const listItems = opportunities
		.map((opportunity) => {
			const anchor = `howto-${opportunity.slug}`;
			return `<li><a href="${canonical}#${anchor}">${opportunity.title.trim()}</a></li>`;
		})
		.join('');

	return `<p>This ${siteTitle} guide includes ${opportunities.length.toLocaleString()} published backlink opportunit${opportunities.length === 1 ? 'y' : 'ies'}:</p><ul>${listItems}</ul><p>Use the overview grid or sidebar jump links to open each step-by-step playbook.</p>`;
}

/** pSEO FAQ copy and items for `/build-backlinks/{siteSlug}` detail pages. */
export function buildBuildBacklinksSiteFaqSection(params: {
	site: LinkDirectorySiteDto;
	canonical: string;
}): BuildBacklinksSiteFaqSection {
	const siteTitle = params.site.title.trim() || 'This site';
	const opportunities = publishedOpportunities(params.site);

	const faqItems: PublicFaqItem[] = [
		{
			title: `What backlink opportunities does ${siteTitle} include?`,
			description: formatOpportunitiesFaqAnswer(siteTitle, opportunities, params.canonical)
		},
		{
			title: `Are ${siteTitle} backlinks dofollow?`,
			description: formatDofollowFaqAnswer(siteTitle, opportunities)
		},
		{
			title: `What SEO metrics does this ${siteTitle} guide show?`,
			description: formatMetricsFaqAnswer(params.site)
		},
		{
			title: `How much does it cost to earn a backlink on ${siteTitle}?`,
			description: formatCostEffortFaqAnswer(siteTitle, opportunities)
		}
	];

	const openQuokAnswer = formatOpenQuokFaqAnswer(params.site, opportunities);
	if (openQuokAnswer) {
		faqItems.push({
			title: `Can OpenQuok help with ${siteTitle} backlinks?`,
			description: openQuokAnswer
		});
	}

	faqItems.push({
		title: `How do I follow the ${siteTitle} Guides on this page?`,
		description: `Each opportunity has its own HowTo section with numbered steps, optional Safari-style UI mocks, and outbound links where editors verified them. Start from ${faqLink(`${params.canonical}#howto-site`, 'all backlink opportunities')} or pick a card in the overview — the sticky sidebar lists jump links on desktop.`
	});

	return {
		faqSubtitle: `${siteTitle} backlinks FAQ`,
		faqTitle: `Common questions about ${siteTitle} link building`,
		faqDescription: `Programmatic answers about ${siteTitle} opportunities, dofollow treatment, metrics, cost, and how this guide fits OpenQuok.`,
		faqItems
	};
}
