import { PUBLIC_AGENT_CHANNEL_HUB_CHANNELS } from '$lib/content/constants/channels/catalog/agentChannelHubSeeds';

import type { PublicAgentChannelHostConfig } from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelConfigsForHost } from '$lib/content/constants/agents/channels/general';
import { buildAgentChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';
import { CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX } from '$lib/content/constants/schedulingPublishChoice';

export const openclawAgentChannelHost: PublicAgentChannelHostConfig = {
	slug: 'openclaw',
	agentLabel: 'OpenClaw',
	metaTitle: (platformLabel) => buildAgentChannelMetaTitle(platformLabel, 'OpenClaw'),
	metaDescription: (platformLabel) =>
		`Message OpenClaw on your self-hosted Gateway to draft and schedule ${platformLabel} posts from WhatsApp, Telegram, Slack, or Discord. Add the openquok-core workspace skill. ${CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX}`,
	extraKeywords: (platformLabel) => [
		`OpenClaw ${platformLabel}`,
		`OpenClaw ${platformLabel} scheduler`,
		`schedule ${platformLabel} from OpenClaw`
	]
};

export const openclawAgentChannelConfigs = buildAgentChannelConfigsForHost(
	openclawAgentChannelHost,
	PUBLIC_AGENT_CHANNEL_HUB_CHANNELS
);
