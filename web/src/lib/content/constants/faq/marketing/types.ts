import type { PublicFaqItem } from '$lib/content/constants/faq';

/** FAQ block on programmatic marketing landings (`/social-media-management`, `/directory-submission-tool`, `/browser-extension`, home merge). */
export type PublicMarketingLandingFaqSection = {
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: readonly PublicFaqItem[];
};
