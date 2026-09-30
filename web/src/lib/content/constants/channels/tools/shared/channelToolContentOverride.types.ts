import type { PublicFaqItem } from '$lib/content/constants/faq';

/**
 * One row in the benchmark timing table shown in tool channel SEO intro blocks
 * (e.g. best-time-to-post Bluesky override). Times are audience-local labels for display.
 */
export type ChannelToolBenchmarkTableRow = {
	/** Display label, e.g. "Wednesday". */
	dayLabel: string;
	/** Primary local time for the day, e.g. "9:00 AM". */
	primaryTime: string;
	/** Additional local times for the same day, e.g. "12:00 PM, 6:00 PM". */
	secondaryTimes?: string;
};

/** Short stat-style callout in tool SEO intro panels (e.g. survey windows). */
export type ChannelToolSeoIntroHighlight = {
	title: string;
	subline: string;
};

/**
 * SSR copy block below the hero on channel tool pages: heading, prose, optional benchmark table.
 */
export type ChannelToolSeoIntro = {
	heading: string;
	paragraphs: readonly string[];
	/** Optional row of highlight cards above the benchmark grid. */
	highlights?: readonly ChannelToolSeoIntroHighlight[];
	/** Accessible table caption when `benchmarkTableRows` is set. */
	benchmarkTableCaption?: string;
	benchmarkTableRows?: readonly ChannelToolBenchmarkTableRow[];
	/** Optional HTML after the table (e.g. calculator CTA with internal links). */
	closingHtml?: string;
};

/**
 * Per-channel marketing overrides for programmatic tool routes (`/tools/{tool}/{slug}`).
 * Register entries in each tool's `CHANNEL_CONTENT_OVERRIDES` map in `general.ts`.
 */
export type ChannelToolContentOverride = {
	metaTitle?: string;
	metaDescription?: string;
	hubDescription?: string;
	/** Extra plain-text paragraph under the hero meta description. */
	heroLead?: string;
	seoIntro?: ChannelToolSeoIntro;
	/** Prepended after tailored FAQ items, before `appendPublicGeneralFaqItems`. */
	extraFaqItems?: readonly PublicFaqItem[];
};

export type ChannelToolContentOverridesBySlug = Readonly<
	Record<string, ChannelToolContentOverride>
>;
