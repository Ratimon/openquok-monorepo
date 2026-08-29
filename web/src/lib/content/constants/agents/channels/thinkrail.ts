import { listPublicChannelsForHub } from '$lib/content/constants/channels';

import type { PublicAgentChannelHostConfig } from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelConfigsForHost } from '$lib/content/constants/agents/channels/shared';
import { buildAgentChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';

export const thinkrailAgentChannelHost: PublicAgentChannelHostConfig = {
	slug: 'thinkrail',
	agentLabel: 'ThinkRail',
	metaTitle: (platformLabel) => buildAgentChannelMetaTitle(platformLabel, 'ThinkRail'),
	metaDescription: (platformLabel) =>
		`Ask ThinkRail to draft and schedule ${platformLabel} posts from a git worktree. Install openquok-core for the pi coding agent, queue drafts, and approve every publish on the calendar or kanban.`,
	extraKeywords: (platformLabel) => [
		`ThinkRail ${platformLabel}`,
		`ThinkRail ${platformLabel} scheduler`,
		`schedule ${platformLabel} from ThinkRail`
	]
};

export const thinkrailAgentChannelConfigs = buildAgentChannelConfigsForHost(
	thinkrailAgentChannelHost,
	listPublicChannelsForHub()
);
