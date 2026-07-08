import type { IconName } from '$data/icons';

import type { PublicChannelFeatureBentoId } from '$lib/content/constants/publicChannelFeatureBentoConfig';
import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';

export type PublicChannelFeatureSection = {
	subtitle: string;
	/** Comma-separated lines; each part gets landing-page gradient styling (see FEATURE_*_TITLE in config). */
	title: string;
	description: string;
	/** Optional demo asset under `/landing/` or `/static/`. */
	imageSrc?: string;
	imageAlt?: string;
	/** Interactive bento showcase (takes precedence over `imageSrc`). */
	bentoId?: PublicChannelFeatureBentoId;
	/** When true, media renders on the right; otherwise on the left. */
	mediaOnRight?: boolean;
};

export type PublicChannelLandingPageViewModel = {
	slug: string;
	/** Integration catalog identifier used for icons and docs links. */
	platformId: string;
	platformLabel: string;
	icon: IconName;
	heroTitle: string;
	heroDescription: string;
	metaTitle: string;
	metaDescription: string;
	/** Hub card blurb on `/channels`; falls back to `metaDescription` when omitted. */
	hubDescription?: string;
	keywords: string[];
	featureSections: PublicChannelFeatureSection[];
	audienceSubtitle: string;
	audienceTitle: string;
	audienceCards: AudienceCard[];
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: PublicFaqItem[];
	/** Setup guide under `/docs/social-integration/`. */
	docsPath: string;
	/** When false, hub shows a coming-soon badge and detail route 404s. */
	available: boolean;
	/**
	 * Extra platform names for competitor compare tables (e.g. Shorts under the YouTube integration).
	 * `platformLabel` is always included; these are appended in catalog order.
	 */
	comparePlatformLabels?: readonly string[];
};

