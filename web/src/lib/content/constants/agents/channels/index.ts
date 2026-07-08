import { getRootPathPublicAgentChannel } from '$lib/area-public/constants/getRootPathPublicAgents';
import { route } from '$lib/utils/path';

import type {
	PublicAgentChannelHubLinkViewModel,
	PublicAgentChannelPageConfig
} from '$lib/content/constants/agents/channels/types';
import { hermesAgentChannelConfigs, hermesAgentChannelHost } from '$lib/content/constants/agents/channels/hermes';
import { openclawAgentChannelConfigs, openclawAgentChannelHost } from '$lib/content/constants/agents/channels/openclaw';

export * from '$lib/content/constants/agents/channels/types';
export { openclawAgentChannelHost, openclawAgentChannelConfigs } from '$lib/content/constants/agents/channels/openclaw';
export { hermesAgentChannelHost, hermesAgentChannelConfigs } from '$lib/content/constants/agents/channels/hermes';

/** Agent host slugs that support `/agents/{agentSlug}/{channelSlug}` SEO pages. */
export const PUBLIC_AGENT_CHANNEL_HOST_SLUGS = ['openclaw', 'hermes'] as const;

export type PublicAgentChannelHostSlug = (typeof PUBLIC_AGENT_CHANNEL_HOST_SLUGS)[number];

const channelConfigsByHostSlug: Record<
	PublicAgentChannelHostSlug,
	readonly PublicAgentChannelPageConfig[]
> = {
	openclaw: openclawAgentChannelConfigs,
	hermes: hermesAgentChannelConfigs
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
	return channelConfigByHostAndSlug.get(`${agentKey}:${channelKey}`);
}

/** @deprecated Pass `agentSlug` as the first argument — kept for routes that only had channel slug. */
export function getPublicAgentChannelByChannelSlug(
	channelSlug: string,
	agentSlug: PublicAgentChannelHostSlug = 'openclaw'
): PublicAgentChannelPageConfig | undefined {
	return getPublicAgentChannelBySlug(agentSlug, channelSlug);
}

export function isPublicAgentChannelHostSlug(slug: string): slug is PublicAgentChannelHostSlug {
	return (PUBLIC_AGENT_CHANNEL_HOST_SLUGS as readonly string[]).includes(slug.trim().toLowerCase());
}

export function listPublicAgentChannelsForHub(
	agentSlug: string
): PublicAgentChannelHubLinkViewModel[] {
	const normalizedSlug = agentSlug.trim().toLowerCase();
	if (!isPublicAgentChannelHostSlug(normalizedSlug)) return [];

	const configs = channelConfigsByHostSlug[normalizedSlug];
	return configs.map((config) => ({
		slug: config.channelSlug,
		platformLabel: config.platformLabel,
		icon: config.icon,
		href: route(getRootPathPublicAgentChannel(normalizedSlug, config.channelSlug)),
		description: config.metaDescription
	}));
}

export const AGENT_CHANNEL_HOSTS = [openclawAgentChannelHost, hermesAgentChannelHost] as const;
