import { listPublicChannelsForHub } from '$lib/content/constants/channels';

import type { PublicAgentChannelHostConfig } from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelConfigsForHost } from '$lib/content/constants/agents/channels/general';
import { buildAgentChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';

export const metaMuseAgentChannelHost: PublicAgentChannelHostConfig = {
	slug: 'meta-muse',
	agentLabel: 'Meta Muse',
	metaTitle: (platformLabel) => buildAgentChannelMetaTitle(platformLabel, 'Meta Muse'),
	metaDescription: (platformLabel) => {
		const metaEcosystem =
			platformLabel === 'Facebook' ||
			platformLabel === 'Instagram' ||
			platformLabel === 'Threads'
				? ` For ${platformLabel} Pages and creators in the Meta ecosystem.`
				: '';
		return `Message Meta Muse on muse.ai or WhatsApp to draft and schedule ${platformLabel} posts via OpenQuok — custom connector from the public API or openquok-core in Muse Secure VM.${metaEcosystem} You approve every publish on the calendar or kanban.`;
	},
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
