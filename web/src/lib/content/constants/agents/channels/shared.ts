import type { PublicChannelFeatureBentoId } from '$lib/content/constants/publicChannelFeatureBentoConfig';
import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/types';
import {
	buildChannelMcpSeoKeywords,
	SHARED_CHANNEL_SEO_KEYWORDS
} from '$lib/content/constants/channels/shared';
import { SUPPORTED_ANALYTICS_PROVIDER_IDENTIFIERS } from '$data/social-providers';
import {
	buildAgentChannelAnalyticsCliCommands,
	buildAgentChannelCliCommandReference,
	buildAgentChannelFollowUpCliCommands,
	buildAgentChannelKanbanCliCommands
} from '$lib/content/utils/buildAgentChannelCliCommandReference';

import type {
	PublicAgentChannelHostConfig,
	PublicAgentChannelPageConfig
} from '$lib/content/constants/agents/channels/types';

const SHARED_CHANNEL_KEYWORD_SET = new Set<string>(SHARED_CHANNEL_SEO_KEYWORDS);

const CHANNEL_PROVIDER_IDENTIFIERS: Record<string, readonly string[]> = {
	facebook: ['facebook'],
	threads: ['threads'],
	instagram: ['instagram-business', 'instagram-standalone', 'instagram'],
	youtube: ['youtube'],
	tiktok: ['tiktok'],
	linkedin: ['linkedin', 'linkedin-page'],
	x: ['x'],
	devto: ['devto'],
	bluesky: ['bluesky']
};

const KANBAN_BENTO_BY_CHANNEL: Record<string, PublicChannelFeatureBentoId> = {
	facebook: 'facebook-bulk-scheduling',
	threads: 'threads-bulk-scheduling',
	instagram: 'instagram-bulk-scheduling',
	youtube: 'youtube-bulk-scheduling',
	tiktok: 'tiktok-bulk-scheduling',
	linkedin: 'linkedin-bulk-scheduling',
	x: 'x-bulk-scheduling',
	devto: 'devto-bulk-scheduling',
	bluesky: 'bluesky-bulk-scheduling'
};

const ANALYTICS_BENTO_BY_CHANNEL: Record<string, PublicChannelFeatureBentoId> = {
	facebook: 'facebook-insights',
	threads: 'threads-insights',
	instagram: 'instagram-insights',
	youtube: 'youtube-insights',
	tiktok: 'tiktok-insights',
	linkedin: 'linkedin-insights',
	x: 'x-insights',
	devto: 'devto-insights',
	bluesky: 'bluesky-threads'
};

const ANALYTICS_CAPABLE_IDENTIFIERS = new Set<string>(SUPPORTED_ANALYTICS_PROVIDER_IDENTIFIERS);

export function buildAgentChannelPageConfig(
	host: PublicAgentChannelHostConfig,
	channel: PublicChannelLandingPageViewModel
): PublicAgentChannelPageConfig {
	const providerIdentifiers =
		CHANNEL_PROVIDER_IDENTIFIERS[channel.slug] ?? [channel.platformId || channel.slug];
	const supportsAnalytics = providerIdentifiers.some((id) => ANALYTICS_CAPABLE_IDENTIFIERS.has(id));

	return {
		channelSlug: channel.slug,
		platformLabel: channel.platformLabel,
		icon: channel.icon,
		listingTagSlug: channel.slug,
		providerIdentifiers,
		kanbanBentoId: KANBAN_BENTO_BY_CHANNEL[channel.slug] ?? 'facebook-bulk-scheduling',
		analyticsBentoId: ANALYTICS_BENTO_BY_CHANNEL[channel.slug] ?? 'facebook-insights',
		metaTitle: host.metaTitle(channel.platformLabel),
		metaDescription: host.metaDescription(channel.platformLabel),
		keywords: [
			...host.extraKeywords(channel.platformLabel),
			'openquok-core skill',
			'agent social media',
			...buildChannelMcpSeoKeywords(channel.platformLabel),
			// Prefer channel-specific SEO nouns (posts / series / analytics) over shared generics.
			...channel.keywords.filter((keyword) => !SHARED_CHANNEL_KEYWORD_SET.has(keyword)).slice(0, 4)
		],
		cliExamplesPath: `/docs/cli-examples/${channel.slug}`,
		commands: buildAgentChannelCliCommandReference(channel.slug),
		kanbanCliCommands: buildAgentChannelKanbanCliCommands(channel.slug, channel.platformLabel),
		analyticsCliCommands: supportsAnalytics
			? buildAgentChannelAnalyticsCliCommands(channel.platformLabel, providerIdentifiers)
			: buildAgentChannelFollowUpCliCommands(channel.slug, channel.platformLabel),
		kanbanMcpPrompts: `Schedule a ${channel.platformLabel} post for tomorrow at 9am — move to review with a note to check the CTA before it goes live`,
		analyticsMcpPrompts: supportsAnalytics
			? `What performed best on my ${channel.platformLabel} account over the last 30 days?
Break down likes, comments, and shares for post <id>`
			: `Schedule a ${channel.platformLabel} post with a follow-up reply five minutes after the main post goes live`
	};
}

export function buildAgentChannelConfigsForHost(
	host: PublicAgentChannelHostConfig,
	channels: readonly PublicChannelLandingPageViewModel[]
): PublicAgentChannelPageConfig[] {
	return channels.map((channel) => buildAgentChannelPageConfig(host, channel));
}
