import { PUBLIC_AGENT_CHANNEL_HUB_CHANNELS } from '$lib/content/constants/channels/catalog/agentChannelHubSeeds';

import type { PublicAgentChannelHostConfig } from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelConfigsForHost } from '$lib/content/constants/agents/channels/general';
import { buildAgentChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';
import { CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX } from '$lib/content/constants/schedulingPublishChoice';

export const openbotAgentChannelHost: PublicAgentChannelHostConfig = {
	slug: 'openbot',
	agentLabel: 'OpenBot',
	metaTitle: (platformLabel) => buildAgentChannelMetaTitle(platformLabel, 'OpenBot'),
	metaDescription: (platformLabel) =>
		`Message OpenBot agents from desktop or mobile to draft and schedule ${platformLabel} posts. Add openquok-core as a local skill and run the CLI on your OpenBot computer. ${CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX}`,
	extraKeywords: (platformLabel) => [
		`OpenBot ${platformLabel}`,
		`OpenBot ${platformLabel} scheduler`,
		`schedule ${platformLabel} from OpenBot`,
		`model agnostic OpenBot ${platformLabel}`,
		`BYO AI OpenBot ${platformLabel}`,
		`OpenBot multi-agent ${platformLabel}`
	]
};

export const openbotAgentChannelConfigs = buildAgentChannelConfigsForHost(
	openbotAgentChannelHost,
	PUBLIC_AGENT_CHANNEL_HUB_CHANNELS
);