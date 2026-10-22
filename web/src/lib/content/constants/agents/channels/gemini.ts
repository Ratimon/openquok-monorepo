import { listPublicChannelsForHub } from '$lib/content/constants/channels';

import type { PublicAgentChannelHostConfig } from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelConfigsForHost } from '$lib/content/constants/agents/channels/general';
import { buildAgentChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';
import { CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX } from '$lib/content/constants/schedulingPublishChoice';

export const geminiAgentChannelHost: PublicAgentChannelHostConfig = {
	slug: 'gemini',
	agentLabel: 'Gemini Task',
	metaTitle: (platformLabel) => buildAgentChannelMetaTitle(platformLabel, 'Gemini Task'),
	metaDescription: (platformLabel) =>
		`Assign Gemini tasks to draft and schedule ${platformLabel} posts through OpenQuok Connected Apps (MCP), skills, or the public API. ${CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX}`,
	extraKeywords: (platformLabel) => [
		`Gemini ${platformLabel}`,
		`Gemini Task ${platformLabel} scheduler`,
		`schedule ${platformLabel} from Gemini`,
		`Gemini Connected Apps OpenQuok`,
		`Google Gemini ${platformLabel} social media`
	]
};

export const geminiAgentChannelConfigs = buildAgentChannelConfigsForHost(
	geminiAgentChannelHost,
	listPublicChannelsForHub()
);
