import { listPublicChannelsForHub } from '$lib/content/constants/channels';

import type { PublicAgentChannelHostConfig } from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelConfigsForHost } from '$lib/content/constants/agents/channels/shared';
import { buildAgentChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';

export const grokBotAgentChannelHost: PublicAgentChannelHostConfig = {
	slug: 'grok-bot',
	agentLabel: 'Grok Bot',
	metaTitle: (platformLabel) => buildAgentChannelMetaTitle(platformLabel, 'Grok Bot'),
	metaDescription: (platformLabel) =>
		`Message Grok Bot to draft and schedule ${platformLabel} posts from desktop or iOS. Install openquok-core on its cloud computer, queue drafts, and approve every publish on the calendar or kanban.`,
	extraKeywords: (platformLabel) => [
		`Grok Bot ${platformLabel}`,
		`Grok Bot ${platformLabel} scheduler`,
		`schedule ${platformLabel} from Grok Bot`
	]
};

export const grokBotAgentChannelConfigs = buildAgentChannelConfigsForHost(
	grokBotAgentChannelHost,
	listPublicChannelsForHub()
);
