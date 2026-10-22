import type { PublicFaqItem } from '$lib/content/constants/faq';
import { mergePublicFaqItemsUnique } from '$lib/content/constants/faq';
import { PUBLIC_DIRECTORY_SUBMISSION_LANDING_CONFIG } from '$lib/content/constants/marketing/directory-submission-landing';
import { PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG } from '$lib/content/constants/marketing/social-autopilot-landing';

export type PublicMarketingLandingFaqSection = {
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: readonly PublicFaqItem[];
};

export type PublicMarketingLandingFaqId = 'social-autopilot' | 'directory-submission';

/** Per-route FAQ sections for programmatic marketing landings. */
export const PUBLIC_MARKETING_LANDING_FAQ_BY_ID = {
	'social-autopilot': PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG.faqSection,
	'directory-submission': PUBLIC_DIRECTORY_SUBMISSION_LANDING_CONFIG.faqSection
} satisfies Record<PublicMarketingLandingFaqId, PublicMarketingLandingFaqSection>;

/** Merge order when building the home page (`/`) FAQ accordion. */
export const PUBLIC_HOME_MARKETING_LANDING_FAQ_MERGE_ORDER: readonly PublicMarketingLandingFaqId[] =
	['social-autopilot', 'directory-submission'];

export function getPublicMarketingLandingFaqSection(
	id: PublicMarketingLandingFaqId
): PublicMarketingLandingFaqSection {
	return PUBLIC_MARKETING_LANDING_FAQ_BY_ID[id];
}

export function mergePublicMarketingLandingFaqItems(
	order: readonly PublicMarketingLandingFaqId[] = PUBLIC_HOME_MARKETING_LANDING_FAQ_MERGE_ORDER
): PublicFaqItem[] {
	const lists = order.map((id) => PUBLIC_MARKETING_LANDING_FAQ_BY_ID[id].faqItems);
	return mergePublicFaqItemsUnique(...lists);
}

/**
 * Home page FAQ: programmatic marketing landings first, then CMS or git-default catalog items.
 */
export function buildPublicHomeLandingFaqItems(
	catalogItems: readonly PublicFaqItem[]
): PublicFaqItem[] {
	return mergePublicFaqItemsUnique(
		mergePublicMarketingLandingFaqItems(),
		catalogItems
	);
}
