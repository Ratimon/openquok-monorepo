import { listPublicChannelsForHub } from '$lib/content/constants/channels';

import type { PublicAgentChannelHostConfig } from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelConfigsForHost } from '$lib/content/constants/agents/channels/general';
import { buildAgentChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';

export const thinkrailAgentChannelHost: PublicAgentChannelHostConfig = {
	slug: 'thinkrail',
	agentLabel: 'ThinkRail',
	metaTitle: (platformLabel) => buildAgentChannelMetaTitle(platformLabel, 'ThinkRail'),
	metaDescription: (platformLabel) =>
		`Ask ThinkRail and pi from a git worktree to draft and schedule ${platformLabel} posts — Monaco editor, scoped terminals, and openquok-core in .pi/skills. Queue drafts and approve every publish on the calendar or kanban.`,
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
