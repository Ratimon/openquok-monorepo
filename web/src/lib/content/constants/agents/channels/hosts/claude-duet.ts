import { PUBLIC_AGENT_CHANNEL_HUB_CHANNELS } from '$lib/content/constants/channels/catalog/agentChannelHubSeeds';

import type { PublicAgentChannelHostConfig } from '$lib/content/constants/agents/channels/types';
import { buildAgentChannelConfigsForHost } from '$lib/content/constants/agents/channels/general';
import { buildAgentChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';
import { CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX } from '$lib/content/constants/schedulingPublishChoice';

export const claudeDuetAgentChannelHost: PublicAgentChannelHostConfig = {
	slug: 'claude-duet',
	agentLabel: 'Claude Duet',
	metaTitle: (platformLabel) => buildAgentChannelMetaTitle(platformLabel, 'Claude Duet'),
	metaDescription: (platformLabel) =>
		`Message Claude Duet from iOS, Android, or claude.ai to draft and schedule ${platformLabel} posts. Add openquok-core as a skill on Duet’s virtual machine. ${CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX}`,
	extraKeywords: (platformLabel) => [
		`Claude Duet ${platformLabel}`,
		`Claude Duet ${platformLabel} scheduler`,
		`schedule ${platformLabel} from Claude Duet`,
		`Anthropic Claude Duet ${platformLabel}`,
		`proactive agent ${platformLabel} OpenQuok`
	]
};

export const claudeDuetAgentChannelConfigs = buildAgentChannelConfigsForHost(
	claudeDuetAgentChannelHost,
	PUBLIC_AGENT_CHANNEL_HUB_CHANNELS
);
