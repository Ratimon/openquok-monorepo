import { listPublicChannelsForHub } from '$lib/content/constants/channels';

import type { PublicAgentChannelHostConfig } from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelConfigsForHost } from '$lib/content/constants/agents/channels/general';
import { buildAgentChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';

export const openclawAgentChannelHost: PublicAgentChannelHostConfig = {
	slug: 'openclaw',
	agentLabel: 'OpenClaw',
	metaTitle: (platformLabel) => buildAgentChannelMetaTitle(platformLabel, 'OpenClaw'),
	metaDescription: (platformLabel) =>
		`Message OpenClaw on your self-hosted Gateway to draft and schedule ${platformLabel} posts from WhatsApp, Telegram, Slack, or Discord. Add the openquok-core workspace skill, queue drafts, and approve every publish on the calendar or kanban.`,
	extraKeywords: (platformLabel) => [
		`OpenClaw ${platformLabel}`,
		`OpenClaw ${platformLabel} scheduler`,
		`schedule ${platformLabel} from OpenClaw`
	]
};

export const openclawAgentChannelConfigs = buildAgentChannelConfigsForHost(
	openclawAgentChannelHost,
	listPublicChannelsForHub()
);
