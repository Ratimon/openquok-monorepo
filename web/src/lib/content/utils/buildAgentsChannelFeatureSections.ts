import type { PublicAgentChannelPageConfig } from '$lib/content/constants/publicAgentChannelConfig';
import type { PublicAgentFeatureSection } from '$lib/content/constants/publicAgentConfig';
import type {
	PublicChannelFeatureSection,
	PublicChannelLandingPageViewModel
} from '$lib/content/constants/publicChannelConfig';

const KANBAN_SECTION_SUBTITLE = 'Kanban + smart filters';
const ANALYTICS_SECTION_SUBTITLE = 'Analytics';

/**
 * Compose/settings row on `/channels/{slug}` — reused for the agent channel
 * "Kanban + smart filters" slot (platform-specific bento + copy).
 */
const CHANNEL_COMPOSE_FEATURE_INDEX = 1;

/** Insights row on `/channels/{slug}` — reused for the agent channel Analytics slot. */
const CHANNEL_INSIGHTS_FEATURE_INDEX = 2;

function mergeChannelFeatureIntoAgentSection(
	agentSection: PublicAgentFeatureSection,
	channelSection: PublicChannelFeatureSection | undefined,
	cliOverlay: Pick<PublicAgentFeatureSection, 'cliCommands' | 'cliCommandsTitle'>
): PublicAgentFeatureSection {
	if (!channelSection) {
		return { ...agentSection, ...cliOverlay };
	}

	return {
		...agentSection,
		subtitle: channelSection.subtitle,
		title: channelSection.title,
		description: channelSection.description,
		bentoId: channelSection.bentoId,
		mediaOnRight: channelSection.mediaOnRight,
		imageAlt: channelSection.imageAlt,
		deviceMock: undefined,
		deviceMockContent: undefined,
		imageSrc: undefined,
		parallelMocks: undefined,
		cliCommandsTitle: cliOverlay.cliCommandsTitle ?? agentSection.cliCommandsTitle,
		cliCommands: cliOverlay.cliCommands ?? agentSection.cliCommands
	};
}

/**
 * Overlay agent/MCP feature rows with copy and bentos from `publicChannelConfig`
 * (same source as `/channels/{slug}`).
 */
export function customizeAgentsChannelFeatureSections(
	sections: PublicAgentFeatureSection[],
	channel: PublicChannelLandingPageViewModel,
	channelConfig: PublicAgentChannelPageConfig,
	mode: 'agent-host' | 'mcp-client'
): PublicAgentFeatureSection[] {
	const composeSection = channel.featureSections[CHANNEL_COMPOSE_FEATURE_INDEX];
	const insightsSection = channel.featureSections[CHANNEL_INSIGHTS_FEATURE_INDEX];

	return sections.map((section) => {
		if (section.subtitle === KANBAN_SECTION_SUBTITLE) {
			return mergeChannelFeatureIntoAgentSection(section, composeSection, {
				cliCommandsTitle: mode === 'mcp-client' ? 'Example prompts' : section.cliCommandsTitle,
				cliCommands: mode === 'mcp-client' ? channelConfig.kanbanMcpPrompts : channelConfig.kanbanCliCommands
			});
		}

		if (section.subtitle === ANALYTICS_SECTION_SUBTITLE) {
			return mergeChannelFeatureIntoAgentSection(section, insightsSection, {
				cliCommandsTitle: mode === 'mcp-client' ? 'Example prompts' : section.cliCommandsTitle,
				cliCommands:
					mode === 'mcp-client' ? channelConfig.analyticsMcpPrompts : channelConfig.analyticsCliCommands
			});
		}

		return section;
	});
}
