import { getRootPathPublicAgentChannel } from '$lib/area-public/constants/getRootPathPublicAgents';
import { getPublicChannelBySlug } from '$lib/content/constants/channels';
import { PUBLIC_AGENT_CHANNEL_HUB_CHANNELS } from '$lib/content/constants/channels/catalog/agentChannelHubSeeds';
import { getAvailablePublicMcpLandingBySlug } from '$lib/content/constants/mcps';
import { route } from '$lib/utils/path';

import type {
	PublicAgentChannelHubLinkViewModel,
	PublicAgentChannelPageConfig
} from '$lib/content/constants/agents/channels/types';
import {
	AGENT_HOST_FIRST_CLASS_CHANNEL_BADGE,
	isFirstClassChannelForHost,
	sortAgentChannelHubLinks
} from '$lib/content/constants/agents/ecosystems';
import { buildAgentChannelPageConfig } from '$lib/content/constants/agents/channels/general';
import { grokBotAgentChannelConfigs, grokBotAgentChannelHost } from '$lib/content/constants/agents/channels/hosts/grok-bot';
import { dotsAgentChannelConfigs, dotsAgentChannelHost } from '$lib/content/constants/agents/channels/hosts/dots';
import {
	thinkrailAgentChannelConfigs,
	thinkrailAgentChannelHost
} from '$lib/content/constants/agents/channels/hosts/thinkrail';
import {
	metaMuseAgentChannelConfigs,
	metaMuseAgentChannelHost
} from '$lib/content/constants/agents/channels/hosts/meta-muse';
import { manusAgentChannelConfigs, manusAgentChannelHost } from '$lib/content/constants/agents/channels/hosts/manus';
import { geminiAgentChannelConfigs, geminiAgentChannelHost } from '$lib/content/constants/agents/channels/gemini';
import { hermesAgentChannelConfigs, hermesAgentChannelHost } from '$lib/content/constants/agents/channels/hosts/hermes';
import {
	openclawAgentChannelConfigs,
	openclawAgentChannelHost
} from '$lib/content/constants/agents/channels/hosts/openclaw';

export * from '$lib/content/constants/agents/channels/types';
export {
	buildAgentChannelPageConfig,
	buildAgentChannelConfigsForHost,
	buildAgentsChannelAudienceSection,
	type AgentsChannelAudienceMode,
	type AgentsChannelAudienceSection
} from '$lib/content/constants/agents/channels/general';
export { openclawAgentChannelHost, openclawAgentChannelConfigs } from '$lib/content/constants/agents/channels/hosts/openclaw';
export { hermesAgentChannelHost, hermesAgentChannelConfigs } from '$lib/content/constants/agents/channels/hosts/hermes';
export { grokBotAgentChannelHost, grokBotAgentChannelConfigs } from '$lib/content/constants/agents/channels/hosts/grok-bot';
export { dotsAgentChannelHost, dotsAgentChannelConfigs } from '$lib/content/constants/agents/channels/hosts/dots';
export {
	thinkrailAgentChannelHost,
	thinkrailAgentChannelConfigs
} from '$lib/content/constants/agents/channels/hosts/thinkrail';
export {
	metaMuseAgentChannelHost,
	metaMuseAgentChannelConfigs
} from '$lib/content/constants/agents/channels/hosts/meta-muse';
export { manusAgentChannelHost, manusAgentChannelConfigs } from '$lib/content/constants/agents/channels/hosts/manus';
export { geminiAgentChannelHost, geminiAgentChannelConfigs } from '$lib/content/constants/agents/channels/gemini';

/** Agent host slugs that support `/agents/{agentSlug}/{channelSlug}` SEO pages. */
export const PUBLIC_AGENT_CHANNEL_HOST_SLUGS = [
	'openclaw',
	'hermes',
	'grok-bot',
	'dots',
	'thinkrail',
	'meta-muse',
	'manus',
	'gemini'
] as const;

export type PublicAgentChannelHostSlug = (typeof PUBLIC_AGENT_CHANNEL_HOST_SLUGS)[number];

const channelConfigsByHostSlug: Record<
	PublicAgentChannelHostSlug,
	readonly PublicAgentChannelPageConfig[]
> = {
	openclaw: openclawAgentChannelConfigs,
	hermes: hermesAgentChannelConfigs,
	'grok-bot': grokBotAgentChannelConfigs,
	dots: dotsAgentChannelConfigs,
	thinkrail: thinkrailAgentChannelConfigs,
	'meta-muse': metaMuseAgentChannelConfigs,
	manus: manusAgentChannelConfigs,
	gemini: geminiAgentChannelConfigs
};

const channelConfigByHostAndSlug = new Map<string, PublicAgentChannelPageConfig>();
for (const hostSlug of PUBLIC_AGENT_CHANNEL_HOST_SLUGS) {
	for (const config of channelConfigsByHostSlug[hostSlug]) {
		channelConfigByHostAndSlug.set(`${hostSlug}:${config.channelSlug}`, config);
	}
}

export function getPublicAgentChannelBySlug(
	agentSlug: string,
	channelSlug: string
): PublicAgentChannelPageConfig | undefined {
	const agentKey = agentSlug.trim().toLowerCase();
	const channelKey = channelSlug.trim().toLowerCase();
	if (!agentKey || !channelKey) return undefined;

	const fromHostMap = channelConfigByHostAndSlug.get(`${agentKey}:${channelKey}`);
	if (fromHostMap) return fromHostMap;

	// MCP clients: composed VM — see mcps/channels/index.ts (maintainer map); no mcps/channels/{slug}.ts files.
	if (!getAvailablePublicMcpLandingBySlug(agentKey)) return undefined;

	const channel = getPublicChannelBySlug(channelKey);
	if (!channel) return undefined;

	return buildAgentChannelPageConfig(openclawAgentChannelHost, channel);
}

export function isPublicAgentChannelHostSlug(slug: string): slug is PublicAgentChannelHostSlug {
	return (PUBLIC_AGENT_CHANNEL_HOST_SLUGS as readonly string[]).includes(slug.trim().toLowerCase());
}

const channelBySlug = new Map(
	PUBLIC_AGENT_CHANNEL_HUB_CHANNELS.map((channel) => [channel.slug, channel])
);

function hubDescriptionForChannel(slug: string, platformLabel: string): string {
	const channel = channelBySlug.get(slug);
	if (channel?.hubDescription?.trim()) return channel.hubDescription.trim();
	return `Workflows and examples for ${platformLabel}.`;
}

function mapChannelConfigsToHubLinks(
	agentSlug: string,
	configs: readonly PublicAgentChannelPageConfig[]
): PublicAgentChannelHubLinkViewModel[] {
	const links = configs.map((config) => {
		const channel = channelBySlug.get(config.channelSlug);
		return {
			slug: config.channelSlug,
			platformLabel: config.platformLabel,
			icon: config.icon,
			href: route(getRootPathPublicAgentChannel(agentSlug, config.channelSlug)),
			description: hubDescriptionForChannel(config.channelSlug, config.platformLabel),
			available: channel?.available ?? false
		};
	});

	return sortAgentChannelHubLinks(links, agentSlug).map((link) => ({
		...link,
		badgeLabel: isFirstClassChannelForHost(agentSlug, link.slug)
			? AGENT_HOST_FIRST_CLASS_CHANNEL_BADGE
			: undefined
	}));
}

export function listPublicAgentChannelsForHub(
	agentSlug: string
): PublicAgentChannelHubLinkViewModel[] {
	const normalizedSlug = agentSlug.trim().toLowerCase();
	if (!normalizedSlug) return [];

	if (isPublicAgentChannelHostSlug(normalizedSlug)) {
		return mapChannelConfigsToHubLinks(normalizedSlug, channelConfigsByHostSlug[normalizedSlug]);
	}

	if (getAvailablePublicMcpLandingBySlug(normalizedSlug)) {
		const links = PUBLIC_AGENT_CHANNEL_HUB_CHANNELS.map((channel) => ({
			slug: channel.slug,
			platformLabel: channel.platformLabel,
			icon: channel.icon,
			href: route(getRootPathPublicAgentChannel(normalizedSlug, channel.slug)),
			description: hubDescriptionForChannel(channel.slug, channel.platformLabel),
			available: channel.available
		}));
		return sortAgentChannelHubLinks(links, normalizedSlug).map((link) => ({
			...link,
			badgeLabel: isFirstClassChannelForHost(normalizedSlug, link.slug)
				? AGENT_HOST_FIRST_CLASS_CHANNEL_BADGE
				: undefined
		}));
	}

	return [];
}

export const AGENT_CHANNEL_HOSTS = [
	openclawAgentChannelHost,
	hermesAgentChannelHost,
	grokBotAgentChannelHost,
	dotsAgentChannelHost,
	thinkrailAgentChannelHost,
	metaMuseAgentChannelHost,
	manusAgentChannelHost,
	geminiAgentChannelHost
] as const;
