import {
	COMPARE_HUB_BASE_SLUG,
	type CompareProductSlug
} from '$lib/content/constants/competitors';
import {
	PUBLIC_COMPARE_DETAIL_SOCIAL_FAQ_ITEM_IDS,
	resolvePublicFaqItemsByIds,
	type PublicFaqItem,
	type PublicFaqItemId
} from '$lib/content/constants/faq';
import { faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';

function buildOpenquokVsPostizCompareLeadFaqItem(): PublicFaqItem {
	return {
		title: 'Where can I read a longer OpenQuok vs Postiz guide?',
		description: `This page is the side-by-side matrix. For open-source licenses, channel tiers, kanban review, directory autofill, and Reddit draft-and-handoff, read ${faqLink(publicFaqHref.blogOpenquokVsPostiz, 'OpenQuok vs Postiz: two open-source schedulers, different strengths')}. For Reddit-only workflow detail, see ${faqLink(publicFaqHref.blogRedditAgents, 'AI agents for Reddit: promote without getting banned')}.`
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

	if (!isOpenquokPostizPair) {
		return base;
	}

	return [buildOpenquokVsPostizCompareLeadFaqItem(), ...base];
}
