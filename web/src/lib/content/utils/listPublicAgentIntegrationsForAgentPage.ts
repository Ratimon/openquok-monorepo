import type { IconName } from '$data/icons';

import {
	getRootPathPublicAgent,
	getRootPathPublicAgentChannel
} from '$lib/area-public/constants/getRootPathPublicAgents';
import { listPublicAgentsForHub } from '$lib/content/constants/agents';
import { getPublicChannelBySlug } from '$lib/content/constants/channels';
import { listPublicMcpLandingPages } from '$lib/content/constants/mcps';
import { buildPublicAgentIntegrationHubCardDescription } from '$lib/content/utils/buildPublicAgentIntegrationsGridCopy';
import { buildPublicChannelAgentIntegrationCardDescription } from '$lib/content/utils/buildPublicChannelAgentIntegrationsGridCopy';
import { route } from '$lib/utils/path';

import type { PublicChannelAgentIntegrationGridItem } from '$lib/content/utils/listPublicAgentIntegrationsForChannel';

export type PublicAgentIntegrationsForAgentPage = {
	agentHosts: PublicChannelAgentIntegrationGridItem[];
	mcpClients: PublicChannelAgentIntegrationGridItem[];
};

function agentPageHref(agentSlug: string, channelSlug: string | null | undefined): string {
	const normalizedAgent = agentSlug.trim().toLowerCase();
	const channel = channelSlug?.trim().toLowerCase();
	if (channel) {
		return route(getRootPathPublicAgentChannel(normalizedAgent, channel));
	}
	return route(getRootPathPublicAgent(normalizedAgent));
}

function cardDescription(
	platformLabel: string,
	agentLabel: string,
	kind: 'agent-host' | 'mcp-client',
	available: boolean,
	channelSlug: string | null | undefined
): string {
	if (channelSlug?.trim()) {
		return buildPublicChannelAgentIntegrationCardDescription(
			platformLabel,
			agentLabel,
			kind,
			available
		);
	}
	return buildPublicAgentIntegrationHubCardDescription(agentLabel, kind, available);
}

export function listPublicAgentIntegrationsForAgentPage(
	channelSlug?: string | null
): PublicAgentIntegrationsForAgentPage {
	const normalizedChannel = channelSlug?.trim().toLowerCase() ?? '';
	const channel = normalizedChannel ? getPublicChannelBySlug(normalizedChannel) : undefined;
	const platformLabel = channel?.platformLabel ?? '';
	const integrationLive = channel?.available ?? true;

	const agentHosts: PublicChannelAgentIntegrationGridItem[] = listPublicAgentsForHub().map(
		(agent) => ({
			slug: agent.slug,
			title: agent.agentLabel,
			description: cardDescription(
				platformLabel,
				agent.agentLabel,
				'agent-host',
				agent.available && integrationLive,
				normalizedChannel || null
			),
			icon: agent.icon,
			href: agentPageHref(agent.slug, normalizedChannel || null),
			available: agent.available,
			kind: 'agent-host' as const
		})
	);

	const mcpClients: PublicChannelAgentIntegrationGridItem[] = listPublicMcpLandingPages().map(
		(mcp) => ({
			slug: mcp.slug,
			title: mcp.agentLabel,
			description: cardDescription(
				platformLabel,
				mcp.agentLabel,
				'mcp-client',
				mcp.available && integrationLive,
				normalizedChannel || null
			),
			icon: mcp.icon,
			href: agentPageHref(mcp.slug, normalizedChannel || null),
			available: mcp.available,
			kind: 'mcp-client' as const
		})
	);

	return { agentHosts, mcpClients };
}
