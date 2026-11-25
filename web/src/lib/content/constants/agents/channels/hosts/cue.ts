import { PUBLIC_AGENT_CHANNEL_HUB_CHANNELS } from '$lib/content/constants/channels/catalog/agentChannelHubSeeds';

import type { PublicAgentChannelHostConfig } from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelConfigsForHost } from '$lib/content/constants/agents/channels/general';
import { buildAgentChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';
import { CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX } from '$lib/content/constants/schedulingPublishChoice';

export const cueAgentChannelHost: PublicAgentChannelHostConfig = {
	slug: 'cue',
	agentLabel: 'Cue',
	metaTitle: (platformLabel) => buildAgentChannelMetaTitle(platformLabel, 'Cue'),
	metaDescription: (platformLabel) =>
		`Ask Cue to draft and schedule ${platformLabel} posts with openquok-core on your agent computer. Official ${platformLabel} APIs via OpenQuok — not Cue agent social graph. ${CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX}`,
	extraKeywords: (platformLabel) => [
		`Cue ${platformLabel}`,
		`Cue ${platformLabel} scheduler`,
		`schedule ${platformLabel} from Cue`,
		`Cue OS ${platformLabel} OpenQuok`,
		`official API ${platformLabel} Cue`
	]
};

export const cueAgentChannelConfigs = buildAgentChannelConfigsForHost(
	cueAgentChannelHost,
	PUBLIC_AGENT_CHANNEL_HUB_CHANNELS
);