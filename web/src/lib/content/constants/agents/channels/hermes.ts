import { listPublicChannelsForHub } from '$lib/content/constants/channels';

import type { PublicAgentChannelHostConfig } from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelConfigsForHost } from '$lib/content/constants/agents/channels/shared';
import { buildAgentChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';

export const hermesAgentChannelHost: PublicAgentChannelHostConfig = {
	slug: 'hermes',
	agentLabel: 'Hermes Agent',
	metaTitle: (platformLabel) => buildAgentChannelMetaTitle(platformLabel, 'Hermes Agent'),
	metaDescription: (platformLabel) =>
		`Message Hermes Agent to draft and schedule ${platformLabel} posts from Telegram, Discord, or Slack. Install openquok-core, queue drafts, and approve every publish on the calendar or kanban.`,
	extraKeywords: (platformLabel) => [
		`Hermes Agent ${platformLabel}`,
		`Hermes ${platformLabel} scheduler`,
		`schedule ${platformLabel} from Hermes`
	]
};

export const hermesAgentChannelConfigs = buildAgentChannelConfigsForHost(
	hermesAgentChannelHost,
	listPublicChannelsForHub()
);
