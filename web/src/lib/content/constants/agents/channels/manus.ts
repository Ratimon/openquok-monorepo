import { listPublicChannelsForHub } from '$lib/content/constants/channels';

import type { PublicAgentChannelHostConfig } from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelConfigsForHost } from '$lib/content/constants/agents/channels/general';
import { buildAgentChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';
import { CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX } from '$lib/content/constants/schedulingPublishChoice';

export const manusAgentChannelHost: PublicAgentChannelHostConfig = {
	slug: 'manus',
	agentLabel: 'Manus',
	metaTitle: (platformLabel) => buildAgentChannelMetaTitle(platformLabel, 'Manus'),
	metaDescription: (platformLabel) =>
		`Use the openquok-core Skill in Manus 2.0 Studio or chat to draft and schedule ${platformLabel} posts — after Video Editor, Game Dev, or Automations. Not the Cue app — Manus Skills path. Run the CLI on a Cloud Computer. ${CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX}`,
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
