import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/catalog/types';
import {
	buildDirectoryAgentChannelAnalyticsCliCommands,
	buildDirectoryAgentChannelCliCommandReference,
	buildDirectoryAgentChannelKanbanCliCommands
} from '$lib/content/utils/buildAgentChannelCliCommandReference';

import type {
	PublicAgentChannelHostConfig,
	PublicAgentChannelPageConfig
} from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelPageKeywords } from '$lib/content/constants/agents/channels/shared';

function buildDirectoryAgentChannelMetaTitle(
	platformLabel: string,
	agentLabel: string
): string {
	return `${platformLabel} directory launch with ${agentLabel}`;
}

function buildDirectoryAgentChannelMetaDescription(
	platformLabel: string,
	agentLabel: string
): string {
	return `Use ${agentLabel} with OpenQuok MCP or CLI to prepare ${platformLabel} listings. List product profiles, ensure variants, check listing readiness, and track domain rating — you submit on the directory site.`;
}

/** Agent×channel page config for `channelKind: 'directory'` (PeerPush, Uneed, …). */
export function buildDirectoryAgentChannelPageConfig(
	host: PublicAgentChannelHostConfig,
	channel: PublicChannelLandingPageViewModel
): PublicAgentChannelPageConfig {
	const siteKey = channel.slug;
	const providerIdentifiers = [channel.platformId || channel.slug];

	return {
		channelSlug: channel.slug,
		platformLabel: channel.platformLabel,
		icon: channel.icon,
		listingTagSlug: channel.slug,
		providerIdentifiers,
		kanbanBentoId: 'directory-extension-autofill',
		analyticsBentoId: 'directory-analytics',
		metaTitle: buildDirectoryAgentChannelMetaTitle(channel.platformLabel, host.agentLabel),
		metaDescription: buildDirectoryAgentChannelMetaDescription(
			channel.platformLabel,
			host.agentLabel
		),
		keywords: buildAgentChannelPageKeywords({
			host,
			channel,
			leadKeywords: [
				`${host.agentLabel} ${channel.platformLabel} directory`,
				`${channel.platformLabel} directory launch`,
				'directory launch MCP',
				'openquok directory CLI'
			]
		}),
		cliExamplesPath: `/docs/cli-examples/${channel.slug}`,
		commands: buildDirectoryAgentChannelCliCommandReference(siteKey, channel.platformLabel),
		kanbanCliCommands: buildDirectoryAgentChannelKanbanCliCommands(siteKey, channel.platformLabel),
		analyticsCliCommands: buildDirectoryAgentChannelAnalyticsCliCommands(channel.platformLabel),
		kanbanMcpPrompts: `List my product profiles, ensure the ${siteKey} variant for my main profile, and show ${channel.platformLabel} listing readiness before I open the browser extension to submit`,
		analyticsMcpPrompts: `Show directory SEO overview for my main product profile — include checkedAt and whether I can refresh DR metrics. Summarize competitor domains if any are configured for ${channel.platformLabel}.`
	};
}
