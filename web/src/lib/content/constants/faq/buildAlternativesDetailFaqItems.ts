import {
	COMPARE_HUB_BASE_SLUG,
	EMPHASIZED_PEER_COMPARE_BY_TARGET,
	getCompareProduct,
	getComparePair,
	type CompareProductSlug
} from '$lib/content/constants/competitors';
import { canonicalPeerComparePairKey } from '$lib/content/constants/competitors/utils/compareHubPairEmphasis';
import {
	PUBLIC_ALTERNATIVES_DETAIL_SOCIAL_FAQ_ITEM_IDS,
	PUBLIC_COMPARE_DETAIL_DIRECTORY_FAQ_ITEM_IDS,
	resolvePublicFaqItemsByIds,
	type PublicFaqItem
} from '$lib/content/constants/faq';
import { insertDirectoryLaunchDrGuaranteeFaqItems } from '$lib/content/constants/faq/marketing/directory-submission';
import { getRootPathPublicAlternativesTarget } from '$lib/area-public/constants/getRootPathPublicAlternatives';
import {
	faqHrefComparePair,
	faqLink,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';
import { route } from '$lib/utils/path';
import { buildAlternativesSwitchFaqTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';

/** High-impression hosted scheduler targets — cross-link measured open-source winner pages (Track B). */
const OPEN_SOURCE_WINNER_CROSS_LINK_TARGETS = new Set<CompareProductSlug>([
	'later',
	'socialync',
	'buffer'
]);

export type BuildAlternativesDetailFaqItemsParams = {
	targetName: string;
	targetSlug: CompareProductSlug;
	isDirectoryTarget: boolean;
	/** From `CompareProduct.alternativesSeo.faqSwitchTitle` when set. */
	faqSwitchTitle?: string;
};

function resolveAlternativesSwitchFaqTitle(params: BuildAlternativesDetailFaqItemsParams): string {
	if (params.faqSwitchTitle) return params.faqSwitchTitle;
	if (params.targetSlug === COMPARE_HUB_BASE_SLUG) {
		return 'What are common OpenQuok alternatives?';
	}
	if (params.isDirectoryTarget) {
		return `Why switch from ${params.targetName} to OpenQuok?`;
	}
	return buildAlternativesSwitchFaqTitle(params.targetName);
}

function buildAlternativesSwitchFaqItem(
	params: BuildAlternativesDetailFaqItemsParams
): PublicFaqItem {
	const { targetName, targetSlug, isDirectoryTarget } = params;

	if (targetSlug === COMPARE_HUB_BASE_SLUG) {
		return {
			title: resolveAlternativesSwitchFaqTitle(params),
			description:
				`Teams evaluate other social schedulers when they want a different pricing model, channel list, or hosted-only workflow. They also look at directory submission services when they prefer done-for-you listings over DIY launch in OpenQuok. Use the ranked list on this page and ${faqLink(publicFaqHref.compare, 'compare hub')} links for side-by-side matrices.`
		};
	}

	const compareHref = faqHrefComparePair('openquok', targetSlug);
	const compareLabel = `OpenQuok vs ${targetName}`;

	if (isDirectoryTarget) {
		return {
			title: resolveAlternativesSwitchFaqTitle(params),
			description:
				`Done-for-you directory services charge per site and set the pace. OpenQuok DIY directory launch keeps listings in your workspace with profile reuse and the browser extension. You submit on each directory site yourself. Compare on ${faqLink(compareHref, compareLabel)} and see ranked picks on ${faqLink(route(getRootPathPublicAlternativesTarget(targetSlug)), `alternatives to ${targetName}`)}.`
		};
	}

	if (targetSlug === 'postiz') {
		return {
			title: resolveAlternativesSwitchFaqTitle(params),
			description:
				`Teams leave ${targetName} when cloud channel caps, one workspace, or server-side Reddit publishing no longer fit. OpenQuok keeps Reddit as drafts you submit on reddit.com — see ${faqLink(publicFaqHref.blogRedditAgents, 'AI agents for Reddit: promote without getting banned')}. For a full open-source comparison (AGPL, MIT skills, kanban, directory autofill), read ${faqLink(publicFaqHref.blogOpenquokVsPostiz, 'OpenQuok vs Postiz: two open-source schedulers, different strengths')}. Compare on ${faqLink(compareHref, compareLabel)} or use the ranked list on this page.`
		};
	}

	const openSourceWinnerClause = OPEN_SOURCE_WINNER_CROSS_LINK_TARGETS.has(targetSlug)
		? ` For AGPL and self-host stacks, open ${faqLink(route(getRootPathPublicAlternativesTarget('postiz')), 'Postiz alternatives')} and ${faqLink(publicFaqHref.compareOpenquokPostiz, 'OpenQuok vs Postiz')}.`
		: '';

	return {
		title: resolveAlternativesSwitchFaqTitle(params),
		description:
			`Many teams outgrow ${targetName} when they need separate workspaces, agent MCP and CLI scheduling, or a public API with approval before publish. OpenQuok is open source with the same calendar workflow when you post by hand. Compare on ${faqLink(compareHref, compareLabel)}, or use the ranked list on this page.${openSourceWinnerClause} Browse ${faqLink(publicFaqHref.compare, 'all comparisons')} for other schedulers.`
	};
}

function buildOpenSourceSchedulerPeerFaqItem(targetName: string): PublicFaqItem {
	return {
		title: `What open-source schedulers compare to ${targetName}?`,
		description:
			`Teams that hit channel caps on hosted plans often evaluate self-host or AGPL stacks next. Open ${faqLink(route(getRootPathPublicAlternativesTarget('postiz')), 'Postiz alternatives')} for ranked open-source picks with list prices. Read ${faqLink(publicFaqHref.compareOpenquokPostiz, 'OpenQuok vs Postiz')} for side-by-side trial, workspace, and channel rows before you shortlist ${targetName} replacements.`
	};
}

function buildEmphasizedPeerCompareFaqItem(
	targetName: string,
	targetSlug: CompareProductSlug
): PublicFaqItem | null {
	const peerSlugs = EMPHASIZED_PEER_COMPARE_BY_TARGET[targetSlug];
	if (!peerSlugs?.length || targetSlug === COMPARE_HUB_BASE_SLUG) return null;

	const compareLinks = peerSlugs
		.map((peerSlug) => {
			if (!getComparePair(targetSlug, peerSlug)) return null;
			const peer = getCompareProduct(peerSlug);
			const peerName = peer?.name ?? peerSlug;
			const [productA, productB] = canonicalPeerComparePairKey(targetSlug, peerSlug).split('/');
			const href = faqHrefComparePair(productA, productB);
			return faqLink(href, `${targetName} vs ${peerName}`);
		})
		.filter((link): link is string => link != null);

	if (compareLinks.length === 0) return null;

	const peerNames = peerSlugs
		.map((slug) => getCompareProduct(slug)?.name ?? slug)
		.join(peerSlugs.length > 1 ? ' and ' : '');

	return {
		title: `How does ${targetName} compare to ${peerNames}?`,
		description:
			`When you shortlist two schedulers, open the head-to-head page for pricing, channels, and trial rows in one table. Read ${compareLinks.join(' and ')}. Browse ${faqLink(publicFaqHref.compare, 'all comparisons')} for more pairs.`
	};
}

/** FAQs for `/alternatives/{slug}` — first row is tailored to the target product. */
export function buildAlternativesDetailFaqItems(
	params: BuildAlternativesDetailFaqItemsParams
): PublicFaqItem[] {
	const switchItem = buildAlternativesSwitchFaqItem(params);
	const isOpenQuokTarget = params.targetSlug === COMPARE_HUB_BASE_SLUG;

	if (params.isDirectoryTarget) {
		const base = resolvePublicFaqItemsByIds(PUBLIC_COMPARE_DETAIL_DIRECTORY_FAQ_ITEM_IDS);
		return insertDirectoryLaunchDrGuaranteeFaqItems([switchItem, ...base]);
	}

	const base = resolvePublicFaqItemsByIds(PUBLIC_ALTERNATIVES_DETAIL_SOCIAL_FAQ_ITEM_IDS);
	const socialBase = isOpenQuokTarget
		? base.filter((item) => item.id !== 'compare-both-social-and-directory')
		: base;
	const openSourcePeerItem =
		!params.isDirectoryTarget && OPEN_SOURCE_WINNER_CROSS_LINK_TARGETS.has(params.targetSlug)
			? [buildOpenSourceSchedulerPeerFaqItem(params.targetName)]
			: [];
	const emphasizedPeerItem = !params.isDirectoryTarget
		? (() => {
				const item = buildEmphasizedPeerCompareFaqItem(params.targetName, params.targetSlug);
				return item ? [item] : [];
			})()
		: [];
	return [switchItem, ...emphasizedPeerItem, ...openSourcePeerItem, ...socialBase];
}
