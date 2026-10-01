import { listPublicChannelsForHub } from '$lib/content/constants/channels';

import type { PublicAgentChannelHostConfig } from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelConfigsForHost } from '$lib/content/constants/agents/channels/general';
import { buildAgentChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';
import { CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX } from '$lib/content/constants/schedulingPublishChoice';

export const dotsAgentChannelHost: PublicAgentChannelHostConfig = {
	slug: 'dots',
	agentLabel: 'Dots',
	metaTitle: (platformLabel) => buildAgentChannelMetaTitle(platformLabel, 'Dots'),
	metaDescription: (platformLabel) =>
		`Message your dot from ChatGPT, Slack, or Teams to draft and schedule ${platformLabel} posts. Install openquok-core on the dot cloud computer via plugins. ${CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX}`,
	extraKeywords: (platformLabel) => [
		`Dots ${platformLabel}`,
		`Dots ${platformLabel} scheduler`,
		`schedule ${platformLabel} from Dots`,
		`OpenAI Dots ${platformLabel}`,
		`ChatGPT dot ${platformLabel} scheduling`
	]
};

export const dotsAgentChannelConfigs = buildAgentChannelConfigsForHost(
	dotsAgentChannelHost,
	listPublicChannelsForHub()
);
