import {
	buildChannelFaqLinks,
	buildToolChannelFaqLinks,
	type ChannelFaqLinks,
	type ToolChannelFaqLinks
} from '$lib/content/utils/publicFaqLinks';

/** Shared SEO terms appended to every live channel landing page. */
export const SHARED_CHANNEL_SEO_KEYWORDS = [
	'social media scheduler',
	'schedule social media posts'
] as const;

export type ChannelLandingFaqLinks = ChannelFaqLinks & {
	humanizer: ToolChannelFaqLinks;
	skillBuilder: ToolChannelFaqLinks;
	photoEditor: ToolChannelFaqLinks;
	bestTimeToPost: ToolChannelFaqLinks;
};

/** Channel landing FAQ destinations (setup docs, tag hubs, tool×channel routes). */
export function buildChannelLandingFaqLinks(slug: string, docsPath: string): ChannelLandingFaqLinks {
	const trimmedSlug = slug.trim();
	return {
		...buildChannelFaqLinks(trimmedSlug, docsPath),
		humanizer: buildToolChannelFaqLinks('humanizer', trimmedSlug),
		skillBuilder: buildToolChannelFaqLinks('skill-builder', trimmedSlug),
		photoEditor: buildToolChannelFaqLinks('photo-editor', trimmedSlug),
		bestTimeToPost: buildToolChannelFaqLinks('best-time-to-post', trimmedSlug)
	};
}
