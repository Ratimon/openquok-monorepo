import type { PublicAgentChannelHostConfig } from '$lib/content/constants/agents/channels/types';
import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/catalog/types';
import { buildAgentChannelSeoExtras } from '$lib/content/constants/agents/channels/seo-extras';
import {
	buildChannelMcpSeoKeywords,
	SHARED_CHANNEL_SEO_KEYWORDS
} from '$lib/content/constants/channels/catalog/shared';

const SHARED_CHANNEL_KEYWORD_SET = new Set<string>(SHARED_CHANNEL_SEO_KEYWORDS);

export function filterChannelCatalogKeywordsForAgentPage(
	channel: PublicChannelLandingPageViewModel,
	max = 4
): readonly string[] {
	return channel.keywords
		.filter((keyword) => !SHARED_CHANNEL_KEYWORD_SET.has(keyword))
		.slice(0, max);
}

/** Shared keyword tail for `/agents/{host}/{channelSlug}` page config (social + directory). */
export function buildAgentChannelPageKeywords(params: {
	host: PublicAgentChannelHostConfig;
	channel: PublicChannelLandingPageViewModel;
	leadKeywords: readonly string[];
	/** e.g. `agent social media` on social agent×channel landings only. */
	midKeywords?: readonly string[];
}): readonly string[] {
	const { host, channel, leadKeywords, midKeywords = [] } = params;
	return [
		...leadKeywords,
		...host.extraKeywords(channel.platformLabel),
		...buildAgentChannelSeoExtras(host.slug, channel.platformLabel),
		'openquok-core skill',
		...midKeywords,
		...buildChannelMcpSeoKeywords(channel.platformLabel),
		...filterChannelCatalogKeywordsForAgentPage(channel)
	];
}
