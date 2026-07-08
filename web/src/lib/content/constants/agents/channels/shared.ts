import type { PublicChannelFeatureBentoId } from '$lib/content/constants/publicChannelFeatureBentoConfig';
import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/types';
import {
	buildAgentChannelAnalyticsCliCommands,
	buildAgentChannelCliCommandReference,
	buildAgentChannelKanbanCliCommands
} from '$lib/content/utils/buildAgentChannelCliCommandReference';

import type {
	PublicAgentChannelHostConfig,
	PublicAgentChannelPageConfig
} from '$lib/content/constants/agents/channels/types';

const CHANNEL_PROVIDER_IDENTIFIERS: Record<string, readonly string[]> = {
	facebook: ['facebook'],
	threads: ['threads'],
	instagram: ['instagram-business', 'instagram-standalone', 'instagram'],
	youtube: ['youtube'],
	tiktok: ['tiktok'],
	linkedin: ['linkedin', 'linkedin-page'],
	x: ['x']
};

const KANBAN_BENTO_BY_CHANNEL: Record<string, PublicChannelFeatureBentoId> = {
	facebook: 'facebook-bulk-scheduling',
	threads: 'threads-bulk-scheduling',
	instagram: 'instagram-bulk-scheduling',
	youtube: 'youtube-bulk-scheduling',
	tiktok: 'tiktok-bulk-scheduling',
	linkedin: 'linkedin-bulk-scheduling',
	x: 'x-bulk-scheduling'
};

const ANALYTICS_BENTO_BY_CHANNEL: Record<string, PublicChannelFeatureBentoId> = {
	facebook: 'facebook-insights',
	threads: 'threads-insights',
	instagram: 'instagram-insights',
	youtube: 'youtube-insights',
	tiktok: 'tiktok-insights',
	linkedin: 'linkedin-insights',
	x: 'x-insights'
};

export function buildAgentChannelPageConfig(
	host: PublicAgentChannelHostConfig,
	channel: PublicChannelLandingPageViewModel
): PublicAgentChannelPageConfig {
	const providerIdentifiers =
		CHANNEL_PROVIDER_IDENTIFIERS[channel.slug] ?? [channel.platformId || channel.slug];

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
			...channel.keywords.slice(0, 4)
		],
		cliExamplesPath: `/docs/cli-examples/${channel.slug}`,
		commands: buildAgentChannelCliCommandReference(channel.slug),
		kanbanCliCommands: buildAgentChannelKanbanCliCommands(channel.slug, channel.platformLabel),
		analyticsCliCommands: buildAgentChannelAnalyticsCliCommands(
			channel.platformLabel,
			providerIdentifiers
		),
		kanbanMcpPrompts: `Schedule a ${channel.platformLabel} post for tomorrow at 9am — move to review with a note to check the CTA before it goes live`,
		analyticsMcpPrompts: `What performed best on my ${channel.platformLabel} account over the last 30 days?
Break down likes, comments, and shares for post <id>`
	};
}

export function buildAgentChannelConfigsForHost(
	host: PublicAgentChannelHostConfig,
	channels: readonly PublicChannelLandingPageViewModel[]
): PublicAgentChannelPageConfig[] {
	return channels.map((channel) => buildAgentChannelPageConfig(host, channel));
}
