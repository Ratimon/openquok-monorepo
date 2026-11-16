import {
	COMPARE_HUB_BASE_SLUG,
	getCompareProduct,
	isHighCtrPeerComparePair,
	type CompareProductSlug
} from '$lib/content/constants/competitors';
import { canonicalPeerComparePairKey } from '$lib/content/constants/competitors/utils/compareHubPairEmphasis';
import {
	PUBLIC_COMPARE_DETAIL_SOCIAL_FAQ_ITEM_IDS,
	resolvePublicFaqItemsByIds,
	type PublicFaqItem,
	type PublicFaqItemId
} from '$lib/content/constants/faq';
import { faqHrefComparePair, faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';

function buildOpenquokVsPostizCompareLeadFaqItem(): PublicFaqItem {
	return {
		title: 'Where can I read a longer OpenQuok vs Postiz guide?',
		description: `This page is the side-by-side matrix. For open-source licenses, channel tiers, kanban review, directory autofill, and Reddit draft-and-handoff, read ${faqLink(publicFaqHref.blogOpenquokVsPostiz, 'OpenQuok vs Postiz: two open-source schedulers, different strengths')}. For Reddit-only workflow detail, see ${faqLink(publicFaqHref.blogRedditAgents, 'AI agents for Reddit: promote without getting banned')}.`
	};
}

function buildPeerSchedulerCompareLeadFaqItem(
	leftSlug: CompareProductSlug,
	rightSlug: CompareProductSlug
): PublicFaqItem {
	const left = getCompareProduct(leftSlug);
	const right = getCompareProduct(rightSlug);
	const leftName = left?.name ?? leftSlug;
	const rightName = right?.name ?? rightSlug;
	const [productA, productB] = canonicalPeerComparePairKey(leftSlug, rightSlug).split('/');
	const compareHref = faqHrefComparePair(productA, productB);

	return {
		title: `How do I read the ${leftName} vs ${rightName} comparison table?`,
		description: `The matrix on ${faqLink(compareHref, `${leftName} vs ${rightName}`)} lists public prices, connected channels, and trial language side by side. Use it when you shortlist two schedulers before you sign up. You can also start from matching alternatives pages and open this compare link from the FAQ on that page.`
	};
}

/** FAQs for `/compare/openquok/{peer}` and symmetric social pairs — optional lead row per pair. */
export function buildCompareDetailSocialFaqItems(
	leftSlug: CompareProductSlug,
	rightSlug: CompareProductSlug,
	faqItemIds: readonly PublicFaqItemId[] = PUBLIC_COMPARE_DETAIL_SOCIAL_FAQ_ITEM_IDS
): PublicFaqItem[] {
	const base = resolvePublicFaqItemsByIds(faqItemIds);
	const isOpenquokPostizPair =
		(leftSlug === COMPARE_HUB_BASE_SLUG && rightSlug === 'postiz') ||
		(rightSlug === COMPARE_HUB_BASE_SLUG && leftSlug === 'postiz');

	const leadItems: PublicFaqItem[] = [];
	if (isOpenquokPostizPair) {
		leadItems.push(buildOpenquokVsPostizCompareLeadFaqItem());
	} else if (isHighCtrPeerComparePair(leftSlug, rightSlug)) {
		leadItems.push(buildPeerSchedulerCompareLeadFaqItem(leftSlug, rightSlug));
	}

	if (leadItems.length === 0) {
		return base;
	}

	return [...leadItems, ...base];
}
