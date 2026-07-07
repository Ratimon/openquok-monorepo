import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/publicChannelConfig';

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
				return `Batch ${platformLabel} drafts through ${agentLabel} and review before publish.`;
			default:
				return `Let ${agentLabel} queue ${platformLabel} content.`;
		}
	}

	switch (cardIndex) {
		case 0:
			return `Message ${agentLabel} to draft ${platformLabel} posts from chat — you approve before publish.`;
		case 1:
			return `${agentLabel} queues ${platformLabel} drafts at volume — your team approves before publish.`;
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
 * WhoIsFor copy from `publicChannelConfig` (same source as `/channels/{slug}`),
 * adapted for `/agents/{agentSlug}/{channelSlug}` with both platform and agent context.
 */
export function buildAgentsChannelAudienceSection(params: {
	channel: PublicChannelLandingPageViewModel;
	agentLabel: string;
	mode: AgentsChannelAudienceMode;
}): AgentsChannelAudienceSection {
	const { channel, agentLabel, mode } = params;
	const platformLabel = channel.platformLabel;

	return {
		audienceSubtitle: `${channel.audienceSubtitle} with ${agentLabel}`,
		audienceTitle: channel.audienceTitle.replace(/OpenQuok/g, agentLabel),
		audienceCards: channel.audienceCards.map((card, index) => ({
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
