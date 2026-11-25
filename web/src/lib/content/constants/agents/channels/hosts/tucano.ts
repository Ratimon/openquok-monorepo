import { PUBLIC_AGENT_CHANNEL_HUB_CHANNELS } from '$lib/content/constants/channels/catalog/agentChannelHubSeeds';

import type { PublicAgentChannelHostConfig } from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelConfigsForHost } from '$lib/content/constants/agents/channels/general';
import { buildAgentChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';
import { CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX } from '$lib/content/constants/schedulingPublishChoice';

export const tucanoAgentChannelHost: PublicAgentChannelHostConfig = {
	slug: 'tucano',
	agentLabel: 'Tucano',
	metaTitle: (platformLabel) => buildAgentChannelMetaTitle(platformLabel, 'Tucano'),
	metaDescription: (platformLabel) =>
		`Message Tucano agents in channels to draft and schedule ${platformLabel} posts. Add openquok-core where the scheduling agent runs the CLI. ${CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX}`,
	extraKeywords: (platformLabel) => [
		`Tucano ${platformLabel}`,
		`Tucano ${platformLabel} scheduler`,
		`schedule ${platformLabel} from Tucano`,
		`multi-agent Tucano ${platformLabel}`,
		`BYO AI Tucano ${platformLabel}`
	]
};

export const tucanoAgentChannelConfigs = buildAgentChannelConfigsForHost(
	tucanoAgentChannelHost,
	PUBLIC_AGENT_CHANNEL_HUB_CHANNELS
);