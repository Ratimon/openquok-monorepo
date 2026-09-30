import type {
	ChannelToolContentOverride,
	ChannelToolContentOverridesBySlug,
	ChannelToolSeoIntro
} from '$lib/content/constants/channels/tools/shared/channelToolContentOverride.types';

/** SEO + hub fields every channel tool page config builds before overrides. */
export type ChannelToolPageSeoBase = {
	metaTitle: string;
	metaDescription: string;
	hubDescription: string;
};

/** Optional fields surfaced on the page when a channel override supplies them. */
export type ChannelToolPageOptionalContent = {
	heroLead?: string;
	seoIntro?: ChannelToolSeoIntro;
};

export type ChannelToolPageSeoMerged = ChannelToolPageSeoBase & ChannelToolPageOptionalContent;

/**
 * Applies per-channel copy overrides onto a built page config. Unset override keys keep base values.
 */
export function mergeChannelToolContentOverride<T extends ChannelToolPageSeoBase>(
	base: T,
	override?: ChannelToolContentOverride | null
): T & ChannelToolPageOptionalContent {
	if (!override) {
		return base;
	}

	const merged: T & ChannelToolPageOptionalContent = { ...base };

	if (override.metaTitle !== undefined) {
		merged.metaTitle = override.metaTitle;
	}
	if (override.metaDescription !== undefined) {
		merged.metaDescription = override.metaDescription;
	}
	if (override.hubDescription !== undefined) {
		merged.hubDescription = override.hubDescription;
	}
	if (override.heroLead !== undefined) {
		merged.heroLead = override.heroLead;
	}
	if (override.seoIntro !== undefined) {
		merged.seoIntro = override.seoIntro;
	}

	return merged;
}

export function getChannelToolContentOverride(
	slug: string,
	overridesBySlug: ChannelToolContentOverridesBySlug
): ChannelToolContentOverride | undefined {
	const key = slug.trim().toLowerCase();
	return overridesBySlug[key];
}
