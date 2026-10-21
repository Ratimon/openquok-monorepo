import type { IconName } from '$data/icons';

import type { DirectoryChannelProcessSection } from '$lib/content/constants/channels/catalog/directory-platforms/directoryChannelProcessSection';
import type { PublicChannelFeatureBentoId } from '$lib/content/constants/channels/catalog/feature-bento';
import type { PublicFaqItem } from '$lib/content/constants/faq';
import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';

export type PublicChannelKind = 'social' | 'directory';

export type PublicChannelFeatureSectionKind = 'default' | 'team-hero';

export type PublicChannelFeatureSection = {
	subtitle: string;
	/** Comma-separated lines; each part gets landing-page gradient styling (see FEATURE_*_TITLE in config). */
	title: string;
	description: string;
	/** Renders `PublicLandingTeamFeatureHero` instead of a media hero row. */
	sectionKind?: PublicChannelFeatureSectionKind;
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
	/** Directory PSEO: five-step how-it-works block (tool-landing style). */
	processSection?: DirectoryChannelProcessSection;
	audienceSubtitle: string;
	audienceTitle: string;
	/** Three base persona cards on `/channels/{slug}`. */
	audienceCards: AudienceCard[];
	/** Optional fourth WhoIsFor card (channel, agent×channel, API platform pages). */
	audienceTailoredCard?: AudienceCard;
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: PublicFaqItem[];
	/** Product docs path (`/docs/social-integration/` or `/docs/directory-integration/`). */
	docsPath: string;
	/** When false, hub and nav show a coming-soon badge; detail route renders a coming-soon page. */
	available: boolean;
	/**
	 * Social OAuth/scheduling channels vs directory launch (business profile + extension autofill).
	 * Omit on social seeds — treated as `social` at runtime.
	 */
	channelKind?: PublicChannelKind;
	/**
	 * Editorial build-backlinks site slug for cross-link to `/build-backlinks/{slug}`.
	 * Usually matches `slug` for directory launch platforms.
	 */
	buildBacklinksSiteSlug?: string;
	/**
	 * Extra platform names for competitor compare tables (e.g. Shorts under the YouTube integration).
	 * `platformLabel` is always included; these are appended in catalog order.
	 */
	comparePlatformLabels?: readonly string[];
};
