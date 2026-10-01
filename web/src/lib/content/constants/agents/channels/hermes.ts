import { listPublicChannelsForHub } from '$lib/content/constants/channels';

import type { PublicAgentChannelHostConfig } from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelConfigsForHost } from '$lib/content/constants/agents/channels/general';
import { buildAgentChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';
import { CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX } from '$lib/content/constants/schedulingPublishChoice';

export const hermesAgentChannelHost: PublicAgentChannelHostConfig = {
	slug: 'hermes',
	agentLabel: 'Hermes Agent',
	metaTitle: (platformLabel) => buildAgentChannelMetaTitle(platformLabel, 'Hermes Agent'),
	metaDescription: (platformLabel) =>
		`Message Hermes Agent through its gateway to draft and schedule ${platformLabel} posts from Telegram, Discord, Slack, or WhatsApp. Install openquok-core in ~/.hermes/skills/. ${CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX}`,
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
