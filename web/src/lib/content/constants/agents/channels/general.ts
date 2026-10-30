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
				return `Batch ${platformLabel} drafts through ${agentLabel}. Schedule posts on OpenQuok.`;
			default:
				return `${agentLabel} batches ${platformLabel} content.`;
		}
	}

	switch (cardIndex) {
		case 0:
			return `Message ${agentLabel} to draft ${platformLabel} posts. Approve on OpenQuok.`;
		case 1:
			return `Schedule ${platformLabel} at volume through ${agentLabel}. Your team approves on OpenQuok.`;
		default:
			return `Run ${agentLabel} per client. ${platformLabel} workspaces stay separate.`;
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

function appendChannelSeedAudienceTailoredCard(
	cards: AudienceCard[],
	channel: PublicChannelLandingPageViewModel,
	agentLabel: string,
	mode: AgentsChannelAudienceMode,
	isDirectory: boolean
): AudienceCard[] {
	const tailored = channel.audienceTailoredCard;
	if (!tailored || isDirectory || cards.some((card) => card.title === tailored.title)) {
		return cards;
	}

	const base = tailored.description.trim().replace(/\.$/, '');
	const description =
		channel.slug === 'reddit'
			? mode === 'mcp-client'
				? `${base}. Ask ${agentLabel} to draft markdown; you submit on reddit.com.`
				: `${base}. Message ${agentLabel} to draft markdown; you submit on reddit.com.`
			: tailored.description;

	return [...cards, { ...tailored, description }];
}

/**
 * WhoIsFor copy from channel **seed** cards (not `/channels/{slug}` ecosystem merge),
 * adapted for `/agents/{agentSlug}/{channelSlug}` with both platform and agent context.
 * Host/MCP ecosystem cards come from `resolveAgentChannelAudienceCards` / `resolveMcpChannelAudienceCards`.
 * Channel seed `audienceTailoredCard` (e.g. Reddit moderators) is appended before those.
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
		audienceCards: appendChannelSeedAudienceTailoredCard(
			audienceCards.map((card, index) => ({
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
			})),
			channel,
			agentLabel,
			mode,
			isDirectory
		)
	};
}
