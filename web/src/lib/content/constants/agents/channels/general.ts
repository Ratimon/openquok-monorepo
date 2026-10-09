import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';

import type { PublicChannelFeatureBentoId } from '$lib/content/constants/channels/catalog/feature-bento';
import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/catalog/types';
import {
	buildChannelMcpSeoKeywords,
	SHARED_CHANNEL_SEO_KEYWORDS
} from '$lib/content/constants/channels/catalog/shared';
import { getPublicChannelSeedAudienceCards } from '$lib/content/constants/channels';
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
import { buildAgentChannelSeoExtras } from '$lib/content/constants/agents/channels/seo-extras';

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
	bluesky: ['bluesky'],
	skool: ['skool']
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
	bluesky: 'bluesky-insights'
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
			...buildAgentChannelSeoExtras(host.slug, channel.platformLabel),
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

export type AgentsChannelAudienceMode = 'agent-host' | 'mcp-client';

export type AgentsChannelAudienceSection = {
	audienceSubtitle: string;
	audienceTitle: string;
	audienceCards: AudienceCard[];
};

function buildAgentAudienceCardHook(
	cardIndex: number,
	platformLabel: string,
	agentLabel: string,
	mode: AgentsChannelAudienceMode
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
	mode: AgentsChannelAudienceMode
): string {
	const base = description.trim().replace(/\.$/, '');
	const hook = buildAgentAudienceCardHook(cardIndex, platformLabel, agentLabel, mode);
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

	const seedCards = getPublicChannelSeedAudienceCards(channel.slug);
	const audienceCards = seedCards.length > 0 ? seedCards : [...channel.audienceCards];

	return {
		audienceSubtitle: `${channel.audienceSubtitle} with ${agentLabel}`,
		audienceTitle: channel.audienceTitle.replace(/OpenQuok/g, agentLabel),
		audienceCards: audienceCards.map((card, index) => ({
			...card,
			description: tailorAudienceCardDescription(
				card.description,
				index,
				platformLabel,
				agentLabel,
				mode
			)
		}))
	};
}
