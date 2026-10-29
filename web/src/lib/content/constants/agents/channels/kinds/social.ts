import type { PublicChannelFeatureBentoId } from '$lib/content/constants/channels/catalog/feature-bento';
import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/catalog/types';
import { channelProviderIdentifiersSupportAnalytics } from '$data/social-providers';
import {
	buildAgentChannelAnalyticsCliCommands,
	buildAgentChannelCliCommandReference,
	buildAgentChannelFollowUpCliCommands,
	buildAgentChannelKanbanCliCommands,
	buildAgentChannelMemberHandoffCliCommands
} from '$lib/content/utils/buildAgentChannelCliCommandReference';

import type {
	PublicAgentChannelHostConfig,
	PublicAgentChannelPageConfig
} from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelPageKeywords } from '$lib/content/constants/agents/channels/shared';

const CHANNEL_PROVIDER_IDENTIFIERS: Record<string, readonly string[]> = {
	facebook: ['facebook'],
	threads: ['threads'],
	instagram: ['instagram-business', 'instagram-standalone', 'instagram'],
	youtube: ['youtube'],
	tiktok: ['tiktok'],
	linkedin: ['linkedin', 'linkedin-page'],
	x: ['x'],
	devto: ['devto'],
	bluesky: ['bluesky'],
	skool: ['skool'],
	reddit: ['reddit']
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
	bluesky: 'bluesky-bulk-scheduling',
	skool: 'skool-bulk-scheduling',
	reddit: 'reddit-bulk-scheduling'
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
	bluesky: 'bluesky-insights'
};

/** Default agent×channel page config for social (`channelKind` unset or non-directory). */
export function buildSocialAgentChannelPageConfig(
	host: PublicAgentChannelHostConfig,
	channel: PublicChannelLandingPageViewModel
): PublicAgentChannelPageConfig {
	const providerIdentifiers =
		CHANNEL_PROVIDER_IDENTIFIERS[channel.slug] ?? [channel.platformId || channel.slug];
	const supportsAnalytics = channelProviderIdentifiersSupportAnalytics(providerIdentifiers);
	const isRedditHandoff = channel.slug === 'reddit';

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
		keywords: buildAgentChannelPageKeywords({
			host,
			channel,
			leadKeywords: [],
			midKeywords: ['agent social media']
		}),
		cliExamplesPath: `/docs/cli-examples/${channel.slug}`,
		commands: buildAgentChannelCliCommandReference(channel.slug),
		kanbanCliCommands: buildAgentChannelKanbanCliCommands(channel.slug, channel.platformLabel),
		analyticsCliCommands: supportsAnalytics
			? buildAgentChannelAnalyticsCliCommands(channel.platformLabel, providerIdentifiers)
			: isRedditHandoff
				? buildAgentChannelMemberHandoffCliCommands(channel.platformLabel)
				: buildAgentChannelFollowUpCliCommands(channel.slug, channel.platformLabel),
		kanbanMcpPrompts: `Schedule a ${channel.platformLabel} post for tomorrow at 9am — move to review with a note to check the CTA before it goes live`,
		analyticsMcpPrompts: supportsAnalytics
			? `What performed best on my ${channel.platformLabel} account over the last 30 days?
Break down likes, comments, and shares for post <id>`
			: isRedditHandoff
				? `List my Reddit posts in AWAITING_MEMBER — remind me to finish on reddit.com and mark complete in the dashboard`
				: `Schedule a ${channel.platformLabel} post with a follow-up reply five minutes after the main post goes live`
	};
}
