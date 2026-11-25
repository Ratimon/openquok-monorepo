import { PUBLIC_AGENT_CHANNEL_HUB_CHANNELS } from '$lib/content/constants/channels/catalog/agentChannelHubSeeds';

import type { PublicAgentChannelHostConfig } from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelConfigsForHost } from '$lib/content/constants/agents/channels/general';
import { buildAgentChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';
import { CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX } from '$lib/content/constants/schedulingPublishChoice';

export const mausbotAgentChannelHost: PublicAgentChannelHostConfig = {
	slug: 'mausbot',
	agentLabel: 'MausBot',
	metaTitle: (platformLabel) => buildAgentChannelMetaTitle(platformLabel, 'MausBot'),
	metaDescription: (platformLabel) =>
		`Message MausBot bots from desktop or phone to draft and schedule ${platformLabel} posts. Add openquok-core in the bot working folder and run the CLI on the bot computer. ${CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX}`,
	extraKeywords: (platformLabel) => [
		`MausBot ${platformLabel}`,
		`MausBot ${platformLabel} scheduler`,
		`schedule ${platformLabel} from MausBot`,
		`open source MausBot ${platformLabel}`,
		`BYO AI MausBot ${platformLabel}`,
		`multi-bot MausBot ${platformLabel}`
	]
};

export const mausbotAgentChannelConfigs = buildAgentChannelConfigsForHost(
	mausbotAgentChannelHost,
	PUBLIC_AGENT_CHANNEL_HUB_CHANNELS
);