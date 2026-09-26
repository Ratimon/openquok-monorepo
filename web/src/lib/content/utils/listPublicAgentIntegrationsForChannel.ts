import type { IconName } from '$data/icons';

import { getRootPathPublicAgentChannel } from '$lib/area-public/constants/getRootPathPublicAgents';
import { listPublicAgentsForHub } from '$lib/content/constants/agents';
import { getPublicAgentChannelBySlug } from '$lib/content/constants/agents/channels/index';
import { getPublicChannelBySlug } from '$lib/content/constants/channels';
import { listPublicMcpLandingPages } from '$lib/content/constants/mcps';
import { buildPublicChannelAgentIntegrationCardDescription } from '$lib/content/utils/buildPublicChannelAgentIntegrationsGridCopy';
import { route } from '$lib/utils/path';

export type PublicChannelAgentIntegrationGridItem = {
	slug: string;
	title: string;
	description: string;
	icon: IconName;
	href: string;
	available: boolean;
	kind: 'agent-host' | 'mcp-client';
};

export type PublicChannelAgentIntegrationsForChannel = {
	agentHosts: PublicChannelAgentIntegrationGridItem[];
	mcpClients: PublicChannelAgentIntegrationGridItem[];
};

export function listPublicAgentIntegrationsForChannel(
	channelSlug: string
): PublicChannelAgentIntegrationsForChannel {
	const normalizedChannel = channelSlug.trim().toLowerCase();
	const channel = getPublicChannelBySlug(normalizedChannel);
	if (!channel) {
		return { agentHosts: [], mcpClients: [] };
	}

	const integrationLive = channel.available;

	const agentHosts: PublicChannelAgentIntegrationGridItem[] = [];
	for (const agent of listPublicAgentsForHub()) {
		const config = getPublicAgentChannelBySlug(agent.slug, normalizedChannel);
		if (!config) continue;

		agentHosts.push({
			slug: agent.slug,
			title: agent.agentLabel,
			description: buildPublicChannelAgentIntegrationCardDescription(
				channel.platformLabel,
				agent.agentLabel,
				'agent-host',
				agent.available && integrationLive
			),
			icon: agent.icon,
			href: route(getRootPathPublicAgentChannel(agent.slug, normalizedChannel)),
			available: agent.available,
			kind: 'agent-host'
		});
	}

	const mcpClients = listPublicMcpLandingPages().map((mcp) => ({
		slug: mcp.slug,
		title: mcp.agentLabel,
		description: buildPublicChannelAgentIntegrationCardDescription(
			channel.platformLabel,
			mcp.agentLabel,
			'mcp-client',
			mcp.available && integrationLive
		),
		icon: mcp.icon,
		href: route(getRootPathPublicAgentChannel(mcp.slug, normalizedChannel)),
		available: mcp.available,
		kind: 'mcp-client' as const
	}));

	return { agentHosts, mcpClients };
}
