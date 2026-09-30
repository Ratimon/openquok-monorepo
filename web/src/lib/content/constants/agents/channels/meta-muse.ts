import { listPublicChannelsForHub } from '$lib/content/constants/channels';

import type { PublicAgentChannelHostConfig } from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelConfigsForHost } from '$lib/content/constants/agents/channels/general';
import { buildAgentChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';

export const metaMuseAgentChannelHost: PublicAgentChannelHostConfig = {
	slug: 'meta-muse',
	agentLabel: 'Meta Muse',
	metaTitle: (platformLabel) => buildAgentChannelMetaTitle(platformLabel, 'Meta Muse'),
	metaDescription: (platformLabel) =>
		`Connect OpenQuok to Meta Muse for ${platformLabel} — custom connector, public API, or openquok-core in the Secure VM. Queue drafts from chat and approve every publish on the calendar or kanban.`,
	extraKeywords: (platformLabel) => [
		`Meta Muse ${platformLabel}`,
		`Meta Muse ${platformLabel} scheduler`,
		`schedule ${platformLabel} from Meta Muse`
	]
};

export const metaMuseAgentChannelConfigs = buildAgentChannelConfigsForHost(
	metaMuseAgentChannelHost,
	listPublicChannelsForHub()
);
