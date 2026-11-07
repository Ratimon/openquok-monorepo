import { PUBLIC_AGENT_CHANNEL_HUB_CHANNELS } from '$lib/content/constants/channels/catalog/agentChannelHubSeeds';

import type { PublicAgentChannelHostConfig } from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelConfigsForHost } from '$lib/content/constants/agents/channels/general';
import { buildAgentChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';
import { CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX } from '$lib/content/constants/schedulingPublishChoice';

export const rakazoAgentChannelHost: PublicAgentChannelHostConfig = {
	slug: 'rakazo',
	agentLabel: 'Rakazo',
	metaTitle: (platformLabel) => buildAgentChannelMetaTitle(platformLabel, 'Rakazo'),
	metaDescription: (platformLabel) =>
		`Message a Rakazo bot from desktop, mobile, or Slack to draft and schedule ${platformLabel} posts. Install openquok-core on the bot sandbox. ${CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX}`,
	extraKeywords: (platformLabel) => [
		`Rakazo ${platformLabel}`,
		`Rakazo ${platformLabel} scheduler`,
		`schedule ${platformLabel} from Rakazo`,
		`self-hosted agent ${platformLabel}`,
		`OpenQuok Rakazo ${platformLabel}`
	]
};

export const rakazoAgentChannelConfigs = buildAgentChannelConfigsForHost(
	rakazoAgentChannelHost,
	PUBLIC_AGENT_CHANNEL_HUB_CHANNELS
);
