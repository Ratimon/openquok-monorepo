import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';

import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/catalog/types';
import { getPublicChannelSeedAudienceCards, isPublicDirectoryChannel } from '$lib/content/constants/channels';

import type {
	PublicAgentChannelHostConfig,
	PublicAgentChannelPageConfig
} from '$lib/content/constants/agents/channels/types';
import { buildDirectoryAgentChannelPageConfig } from '$lib/content/constants/agents/channels/kinds/directory';
import { buildSocialAgentChannelPageConfig } from '$lib/content/constants/agents/channels/kinds/social';

export function buildAgentChannelPageConfig(
	host: PublicAgentChannelHostConfig,
	channel: PublicChannelLandingPageViewModel
): PublicAgentChannelPageConfig {
	if (isPublicDirectoryChannel(channel)) {
		return buildDirectoryAgentChannelPageConfig(host, channel);
	}
	return buildSocialAgentChannelPageConfig(host, channel);
}

export function buildAgentChannelConfigsForHost(
	host: PublicAgentChannelHostConfig,
	channels: readonly PublicChannelLandingPageViewModel[]
): PublicAgentChannelPageConfig[] {
	return channels.map((channel) => buildAgentChannelPageConfig(host, channel));
}

export type AgentsChannelAudienceMode = 'agent-host' | 'mcp-client';

export type AgentsChannelAudienceSection = {
	audienceSubtitle: string;
	audienceTitle: string;
	audienceCards: AudienceCard[];
};

function buildDirectoryAgentAudienceCardDescription(
	cardIndex: number,
	platformLabel: string,
	agentLabel: string,
	mode: AgentsChannelAudienceMode,
	siteKey: string
): string {
	if (mode === 'mcp-client') {
		switch (cardIndex) {
			case 0:
				return `Spread ${platformLabel} submits across the week. Ask ${agentLabel} for listing readiness before you open the site.`;
			case 1:
				return `One workspace for launch copy. ${agentLabel} checks ${siteKey} variants and DR before your team approves.`;
			default:
				return `Clients submit on the site. ${agentLabel} refreshes DR from one profile.`;
		}
	}

	switch (cardIndex) {
		case 0:
			return `Spread ${platformLabel} submits. Message ${agentLabel} for profiles and readiness before you submit.`;
		case 1:
			return `One workspace for copy. ${agentLabel} prepares ${siteKey} variants for team review.`;
		default:
			return `One workspace per client. ${agentLabel} keeps ${platformLabel} profiles separate.`;
	}
}

function buildAgentAudienceCardHook(
	cardIndex: number,
	platformLabel: string,
	agentLabel: string,
	mode: AgentsChannelAudienceMode,
	_isDirectory: boolean,
	_siteKey: string
): string {
	if (mode === 'mcp-client') {
		switch (cardIndex) {
			case 0:
				return `Ask ${agentLabel} to draft ${platformLabel} posts in chat.`;
			case 1:
				return `Batch ${platformLabel} drafts through ${agentLabel} — publish now, schedule, or approve on OpenQuok.`;
			default:
				return `Let ${agentLabel} queue ${platformLabel} content.`;
		}
	}

	switch (cardIndex) {
		case 0:
			return `Message ${agentLabel} to draft ${platformLabel} posts from chat — publish now, schedule, or approve on OpenQuok.`;
		case 1:
			return `${agentLabel} queues ${platformLabel} drafts at volume — your team can publish now or approve first.`;
		default:
			return `Run ${agentLabel} per client workspace so ${platformLabel} drafts stay isolated.`;
	}
}

function tailorAudienceCardDescription(
	description: string,
	cardIndex: number,
	platformLabel: string,
	agentLabel: string,
	mode: AgentsChannelAudienceMode,
	isDirectory: boolean,
	siteKey: string
): string {
	if (isDirectory) {
		return buildDirectoryAgentAudienceCardDescription(
			cardIndex,
			platformLabel,
			agentLabel,
			mode,
			siteKey
		);
	}

	const base = description.trim().replace(/\.$/, '');
	const hook = buildAgentAudienceCardHook(
		cardIndex,
		platformLabel,
		agentLabel,
		mode,
		isDirectory,
		siteKey
	);
	return `${base}. ${hook}`;
}

/**
 * WhoIsFor copy from channel **seed** cards (not `/channels/{slug}` ecosystem merge),
 * adapted for `/agents/{agentSlug}/{channelSlug}` with both platform and agent context.
 * Host/MCP fourth cards come from `resolveAgentChannelAudienceCards` / `resolveMcpChannelAudienceCards`.
 */
export function buildAgentsChannelAudienceSection(params: {
	channel: PublicChannelLandingPageViewModel;
	agentLabel: string;
	mode: AgentsChannelAudienceMode;
}): AgentsChannelAudienceSection {
	const { channel, agentLabel, mode } = params;
	const platformLabel = channel.platformLabel;
	const isDirectory = isPublicDirectoryChannel(channel);
	const siteKey = channel.slug;

	const seedCards = getPublicChannelSeedAudienceCards(channel.slug);
	const audienceCards = seedCards.length > 0 ? seedCards : [...channel.audienceCards];

	return {
		audienceSubtitle: isDirectory
			? channel.audienceSubtitle
			: `${channel.audienceSubtitle} with ${agentLabel}`,
		audienceTitle: isDirectory
			? channel.audienceTitle
			: channel.audienceTitle.replace(/OpenQuok/g, agentLabel),
		audienceCards: audienceCards.map((card, index) => ({
			...card,
			description: tailorAudienceCardDescription(
				card.description,
				index,
				platformLabel,
				agentLabel,
				mode,
				isDirectory,
				siteKey
			)
		}))
	};
}
