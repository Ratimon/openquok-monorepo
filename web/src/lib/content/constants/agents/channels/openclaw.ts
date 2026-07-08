import { listAvailablePublicChannels } from '$lib/content/constants/channels';

import type { PublicAgentChannelHostConfig } from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelConfigsForHost } from '$lib/content/constants/agents/channels/shared';

export const openclawAgentChannelHost: PublicAgentChannelHostConfig = {
	slug: 'openclaw',
	agentLabel: 'OpenClaw',
	metaTitle: (platformLabel) => `${platformLabel} scheduling with OpenClaw`,
	metaDescription: (platformLabel) =>
		`Message OpenClaw to draft and schedule ${platformLabel} posts from Telegram, WhatsApp, or Slack. Install openquok-core, queue drafts, and approve every publish on the calendar or kanban.`,
	extraKeywords: (platformLabel) => [
		`OpenClaw ${platformLabel}`,
		`OpenClaw ${platformLabel} scheduler`,
		`schedule ${platformLabel} from OpenClaw`
	]
};

export const openclawAgentChannelConfigs = buildAgentChannelConfigsForHost(
	openclawAgentChannelHost,
	listAvailablePublicChannels()
);
