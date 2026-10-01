import { listPublicChannelsForHub } from '$lib/content/constants/channels';

import type { PublicAgentChannelHostConfig } from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelConfigsForHost } from '$lib/content/constants/agents/channels/general';
import { buildAgentChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';
import { CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX } from '$lib/content/constants/schedulingPublishChoice';

export const grokBotAgentChannelHost: PublicAgentChannelHostConfig = {
	slug: 'grok-bot',
	agentLabel: 'Grok Bot',
	metaTitle: (platformLabel) => buildAgentChannelMetaTitle(platformLabel, 'Grok Bot'),
	metaDescription: (platformLabel) =>
		`Message Grok Bot from desktop or iOS to draft and schedule ${platformLabel} posts. Install openquok-core on the Bot shared cloud computer via Plugins or / commands. ${CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX}`,
	extraKeywords: (platformLabel) => [
		`Grok Bot ${platformLabel}`,
		`Grok Bot ${platformLabel} scheduler`,
		`schedule ${platformLabel} from Grok Bot`,
		`Cursor Grok Bot ${platformLabel}`,
		`xAI Grok Bot ${platformLabel}`,
		`schedule ${platformLabel} Cursor Grok Bot`
	]
};

export const grokBotAgentChannelConfigs = buildAgentChannelConfigsForHost(
	grokBotAgentChannelHost,
	listPublicChannelsForHub()
);
