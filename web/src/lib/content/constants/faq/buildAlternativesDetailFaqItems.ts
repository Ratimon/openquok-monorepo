import {
	COMPARE_HUB_BASE_SLUG,
	type CompareProductSlug
} from '$lib/content/constants/competitors';
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

export type BuildAlternativesDetailFaqItemsParams = {
	targetName: string;
	targetSlug: CompareProductSlug;
	isDirectoryTarget: boolean;
};

function buildAlternativesSwitchFaqItem(
	params: BuildAlternativesDetailFaqItemsParams
): PublicFaqItem {
	const { targetName, targetSlug, isDirectoryTarget } = params;

	if (targetSlug === COMPARE_HUB_BASE_SLUG) {
		return {
			title: 'What are common OpenQuok alternatives?',
			description:
				`Teams evaluate other social schedulers when they want a different pricing model, channel list, or hosted-only workflow. They also look at directory submission services when they prefer done-for-you listings over DIY launch in OpenQuok. Use the ranked list on this page and ${faqLink(publicFaqHref.compare, 'compare hub')} links for side-by-side matrices.`
		};
	}

	const compareHref = faqHrefComparePair('openquok', targetSlug);
	const compareLabel = `OpenQuok vs ${targetName}`;

	if (isDirectoryTarget) {
		return {
			title: `Why switch from ${targetName} to OpenQuok?`,
			description:
				`Done-for-you directory services charge per site and set the pace. OpenQuok DIY directory launch keeps listings in your workspace with profile reuse and the browser extension. You submit on each directory site yourself. Compare on ${faqLink(compareHref, compareLabel)} and see ranked picks on ${faqLink(route(getRootPathPublicAlternativesTarget(targetSlug)), `alternatives to ${targetName}`)}.`
		};
	}

	return {
		title: `Why switch from ${targetName} to OpenQuok?`,
		description:
			`Many teams outgrow ${targetName} when they need separate workspaces, agent MCP and CLI scheduling, or a public API with approval before publish. OpenQuok is open source with the same calendar workflow when you post by hand. Compare on ${faqLink(compareHref, compareLabel)}, or use the ranked list on this page. Browse ${faqLink(publicFaqHref.compare, 'all comparisons')} for other schedulers.`
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
	return [switchItem, ...socialBase];
}
