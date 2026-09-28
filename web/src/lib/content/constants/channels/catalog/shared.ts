import {
	buildChannelFaqLinks,
	buildToolChannelFaqLinks,
	faqHrefBlogPost,
	faqLink,
	publicFaqHref,
	type ChannelFaqLinks,
	type ToolChannelFaqLinks
} from '$lib/content/utils/publicFaqLinks';

/** Blog slug for Meta operator verification vs OpenQuok Cloud connect. */
export const META_BUSINESS_VERIFICATION_BLOG_SLUG =
	'how-to-pass-meta-business-verification-for-a-facebook-app-or-skip-it-with-openquok';

/** Shared FAQ for Facebook, Instagram, and Threads landings (self-host vs Cloud). */
export function buildMetaBusinessVerificationChannelFaqItem(connectAssetLabel: string): {
	title: string;
	description: string;
} {
	const verificationGuide = faqLink(
		faqHrefBlogPost(META_BUSINESS_VERIFICATION_BLOG_SLUG),
		'Meta business verification guide'
	);
	return {
		title: 'How do I pass Meta business verification for a developer app?',
		description:
			`On OpenQuok Cloud, you connect ${connectAssetLabel} with Add channel. You do not submit operator business verification for OpenQuok's Meta app. If you self-host, you use your own Meta developer app. Meta often requires business verification and App Review before Live publishing. See ${verificationGuide}, ${faqLink(publicFaqHref.cloud, 'OpenQuok Cloud')}, and the ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide')}.`
	};
}

/** `featureSections[].bentoId` suffix for workspace analytics rows on channel landings. */
export const CHANNEL_INSIGHTS_BENTO_SUFFIX = '-insights';

/** Shared SEO terms appended to every live channel landing page. */
export const SHARED_CHANNEL_SEO_KEYWORDS = [
	'social media scheduler',
	'schedule social media posts'
] as const;

/** Long-tail MCP phrases for channel, agent×channel, and MCP×channel landing pages. */
export function buildChannelMcpSeoKeywords(platformLabel: string): readonly [string, string] {
	return [`${platformLabel} MCP scheduler`, `schedule ${platformLabel} via MCP`];
}

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
