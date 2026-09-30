import type { PublicFaqItem } from '$lib/content/constants/faq';
import type { ChannelToolSeoIntroHighlight } from '$lib/content/constants/channels/tools/shared/channelToolContentOverride.types';

export type ToolSurfaceChannelMeta = {
	/** Channel catalog slug (URL segment). */
	slug: string;
	platformLabel: string;
	/** Docs path without route() — e.g. `/docs/social-integration/instagram`. */
	docsPath: string;
	bestTime: {
		metaDescription: string;
		hubDescription: string;
		seoIntroHeading: string;
		seoIntroParagraph: string;
		highlights: readonly ChannelToolSeoIntroHighlight[];
		/** Optional official analytics / help URL for a second FAQ item. */
		officialInsightsHref?: string;
		officialInsightsLabel?: string;
	};
	/** Prepended to best-time `extraFaqItems` from the factory (channel-specific methodology). */
	extraBestTimeFaqItems?: readonly PublicFaqItem[];
	photoEditor: {
		metaDescription: string;
		hubDescription: string;
		heroLead: string;
		faqTitle: string;
		/** Plain sentence before internal links; factory appends tool + channel links. */
		faqBodyLead: string;
	};
	skillBuilder: {
		metaDescription: string;
		hubDescription: string;
		heroLead: string;
		faqTitle: string;
		faqBodyLead: string;
	};
};
