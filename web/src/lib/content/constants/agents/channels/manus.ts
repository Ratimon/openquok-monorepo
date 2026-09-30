import { listPublicChannelsForHub } from '$lib/content/constants/channels';

import type { PublicAgentChannelHostConfig } from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelConfigsForHost } from '$lib/content/constants/agents/channels/general';
import { buildAgentChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';

export const manusAgentChannelHost: PublicAgentChannelHostConfig = {
	slug: 'manus',
	agentLabel: 'Manus',
	metaTitle: (platformLabel) => buildAgentChannelMetaTitle(platformLabel, 'Manus'),
	metaDescription: (platformLabel) =>
		`Use the openquok-core Skill in Manus to draft and schedule ${platformLabel} posts from chat or Studio. Run the CLI on a Cloud Computer, queue drafts, and approve every publish on the calendar or kanban.`,
	extraKeywords: (platformLabel) => [
		`Manus ${platformLabel}`,
		`Manus ${platformLabel} scheduler`,
		`schedule ${platformLabel} from Manus`
	]
};

export const manusAgentChannelConfigs = buildAgentChannelConfigsForHost(
	manusAgentChannelHost,
	listPublicChannelsForHub()
);
